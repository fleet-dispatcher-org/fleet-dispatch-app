import {Driver, Truck, Trailer, Load} from "@prisma/client";

// Tree-based route structure with alternatives. Accounts for Dates and sorts chronologically

export type RoutePlannerContext = {
    drivers: Driver[];
    trucks: Truck[];
    trailers: Trailer[];
    loads: Load[];
}

// NEW: Track driver's current location as they get assigned loads
interface DriverState {
    driverGroup: DriverGroup;
    currentLocation: {
        coordinates: { lat: number; long: number };
        address: string;
    };
    assignedLoads: Load[];
}

interface DriverGroup {
    driver: Driver;
    truck: Truck;
    trailer: Trailer;
}

interface AssignmentContext {
    driverGroups: DriverGroup[];
    unassignedLoads: Load[];
}

export type RouteNode = {
    id: string;
    loadId: string;
    load: Load;
    nodeType: 'START' | 'PICKUP' | 'DELIVERY' | 'END';
    location: {
        coordinates: { lat: number; long: number };
        address: string;
    };
    estimatedArrivalTime?: Date;
    serviceTime: number;
    sequence: number;
    parentNode?: RouteNode;
    childNodes: RouteNode[];
    depth: number;
}

interface RouteSegment {
    id: string;
    fromNode: RouteNode;
    toNode: RouteNode;
    distance: number;
    duration: number;
    cost: number;
    drivingTime: number;
}

interface RouteTree {
    id: string;
    rootNode: RouteNode;
    segments: RouteSegment[];
    leafNodes: RouteNode[];
    totalCost: number;
    totalDistance: number;
    totalDuration: number;
    isValid: boolean;
    routePath: RouteNode[];
    feasibilityScore: number;
}

export type TreeBasedAssignment = {
    driverGroup: DriverGroup;
    primaryRoute: RouteTree;
    alternativeRoutes: RouteTree[];
    selectionCriteria: {
        criteriaUsed: 'SHORTEST_DISTANCE' | 'SHORTEST_TIME' | 'LOWEST_COST' | 'HIGHEST_FEASIBILITY' | 'HIGHEST_LOAD_COUNT';
        scores: { [routeId: string]: number };
    };
    totalLoadsHandled: number;
    routeComparison: RouteComparison;
}

interface RouteComparison {
    bestDistance: { routeId: string; value: number };
    bestTime: { routeId: string; value: number };
    bestCost: { routeId: string; value: number };
    mostLoads: { routeId: string; value: number };
}

// Helper type for building chains
interface LoadChain {
    loads: Load[];
    totalDistance: number;
    isValid: boolean;
}

export class RoutePlanner {
    constructor() {}
    
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // NEW: Group loads by date for chronological processing
    // Works by sorting dates into buckets. 
    // NEW: Group loads by date for chronological processing
    private groupLoadsByDate(loads: Load[], dateField: keyof Load = 'pick_up_by'): Map<string, Load[]> {
        const dateGroups = new Map<string, Load[]>();
        
        for (const load of loads) {
            const dateValue = load[dateField];
            
            if (!dateValue) {
                console.warn(`Skipping load ${load.id}: no date value`);
                continue;
            }
            
            // Handle string datetime (ISO 8601 format like "2024-10-23T00:43:36.800Z")
            let dateKey: string;
            if (typeof dateValue === 'string') {
                // Just take the date part before 'T'
                dateKey = dateValue.split('T')[0];
            } else if (dateValue instanceof Date) {
                dateKey = dateValue.toISOString().split('T')[0];
            } else {
                console.warn(`Skipping load ${load.id}: unexpected date format`, dateValue);
                continue;
            }
            
            if (!dateGroups.has(dateKey)) {
                dateGroups.set(dateKey, []);
            }
            dateGroups.get(dateKey)!.push(load);
        }
        
        return dateGroups;
    }

    // NEW: Get sorted date keys
    // Returns an array of sorted date keys. 
    private getSortedDateKeys(dateGroups: Map<string, Load[]>): string[] {
        return Array.from(dateGroups.keys()).sort();
    }

    private createRouteNode(
        load: Load, 
        nodeType: 'START' | 'PICKUP' | 'DELIVERY' | 'END',
        serviceTime: number = 0,
        parentNode?: RouteNode,
    ): RouteNode {
        const coords = nodeType === 'PICKUP' || nodeType === 'START' 
            ? load.origin_coordinates as Array<{lat: number, long: number}> | null
            : load.destination_coordinates as Array<{lat: number, long: number}> | null;
        
        const address = nodeType === 'PICKUP' || nodeType === 'START' 
            ? load.origin || ''
            : load.destination || '';
        
        return {
            id: `${nodeType.toLowerCase()}_${load.id}_${Date.now()}`,
            loadId: load.id,
            load: load,
            nodeType: nodeType,
            location: {
                coordinates: {
                    lat: coords?.[0]?.lat || 0,
                    long: coords?.[0]?.long || 0
                },
                address: address
            },
            serviceTime: serviceTime,
            sequence: 0,
            parentNode: parentNode,
            childNodes: [],
            depth: parentNode ? parentNode.depth + 1 : 0
        };
    }

    private createRouteSegment(fromNode: RouteNode, toNode: RouteNode): RouteSegment {
        const distance = this.calculateDistance(
            fromNode.location.coordinates.lat,
            fromNode.location.coordinates.long,
            toNode.location.coordinates.lat,
            toNode.location.coordinates.long
        );
        
        const drivingTime = (distance / 60) * 60;
        const duration = drivingTime + fromNode.serviceTime;
        const cost = distance * 2.5 + drivingTime * 0.5;
        
        return {
            id: `segment_${fromNode.id}_to_${toNode.id}`,
            fromNode,
            toNode,
            distance,
            duration,
            cost,
            drivingTime
        };
    }

    // NEW: Build load chains iteratively (no recursion - no stack overflow!)
    private buildLoadChains(
        startingLoad: Load,
        availableLoads: Load[],
        maxChainDistance: number,
        maxChainLength: number = 6
    ): LoadChain[] {
        const allChains: LoadChain[] = [];
        
        // Queue of chains to explore: [chain, usedLoadIds]
        interface ChainState {
            chain: Load[];
            usedIds: Set<string>;
        }
        
        const queue: ChainState[] = [{
            chain: [startingLoad],
            usedIds: new Set([startingLoad.id])
        }];
        
        let iterations = 0;
        const maxIterations = 10000; // Safety limit
        
        while (queue.length > 0 && iterations < maxIterations) {
            iterations++;
            
            const state = queue.shift()!;
            const { chain, usedIds } = state;
            
            // Calculate total distance for this chain
            let totalDistance = 0;
            for (let i = 0; i < chain.length - 1; i++) {
                const destCoords = chain[i].destination_coordinates as Array<{lat: number, long: number}> | null;
                const originCoords = chain[i + 1].origin_coordinates as Array<{lat: number, long: number}> | null;
                
                if (destCoords && originCoords) {
                    totalDistance += this.calculateDistance(
                        destCoords[0].lat,
                        destCoords[0].long,
                        originCoords[0].lat,
                        originCoords[0].long
                    );
                }
            }
            
            // Save this chain as a valid option
            allChains.push({
                loads: [...chain],
                totalDistance,
                isValid: true
            });
            
            // Try to extend the chain if not at max length
            if (chain.length < maxChainLength) {
                const lastLoad = chain[chain.length - 1];
                const destCoords = lastLoad.destination_coordinates as Array<{lat: number, long: number}> | null;
                
                if (destCoords) {
                    // Find candidate loads to chain
                    const candidates: Array<{load: Load, distance: number}> = [];
                    
                    for (const nextLoad of availableLoads) {
                        if (usedIds.has(nextLoad.id)) continue;
                        
                        const nextOriginCoords = nextLoad.origin_coordinates as Array<{lat: number, long: number}> | null;
                        
                        if (nextOriginCoords) {
                            const distanceToNext = this.calculateDistance(
                                destCoords[0].lat,
                                destCoords[0].long,
                                nextOriginCoords[0].lat,
                                nextOriginCoords[0].long
                            );
                            
                            if (distanceToNext <= maxChainDistance) {
                                candidates.push({ load: nextLoad, distance: distanceToNext });
                            }
                        }
                    }
                    
                    // Sort by distance and take top 2 to limit branching
                    candidates.sort((a, b) => a.distance - b.distance);
                    const topCandidates = candidates.slice(0, 2);
                    
                    // Add extended chains to queue
                    for (const candidate of topCandidates) {
                        const newChain = [...chain, candidate.load];
                        const newUsedIds = new Set([...usedIds, candidate.load.id]);
                        
                        queue.push({
                            chain: newChain,
                            usedIds: newUsedIds
                        });
                    }
                }
            }
        }
        
        if (iterations >= maxIterations) {
            console.warn(`Chain building hit iteration limit for load ${startingLoad.id}`);
        }
        
        return allChains;
    }

    // NEW: Generate chains starting from driver's home base (with batching)
    // MODIFIED: Generate chains starting from driver's home base (with batching)
    private generateChainsFromHomeBase(
        driverGroup: DriverGroup,
        availableLoads: Load[],
        maxDistance: number,
        maxChainLength: number = 6,
        maxStartingLoads: number = 10,
        restrictStartingLoads?: Load[] // NEW: Optional restriction to specific starting loads
    ): LoadChain[] {
        const allChains: LoadChain[] = [];
        const driverCoords = driverGroup.driver.home_coordinates as Array<{lat: number, long: number}> | null;
        
        if (!driverCoords) return allChains;
        
        // Determine which loads to consider as starting points
        const loadsToConsider = restrictStartingLoads || availableLoads;
        
        // Find loads that start near driver's home with distances
        const startingLoadCandidates: Array<{load: Load, distance: number}> = [];
        
        for (const load of loadsToConsider) {
            const originCoords = load.origin_coordinates as Array<{lat: number, long: number}> | null;
            if (!originCoords) continue;
            
            const distance = this.calculateDistance(
                driverCoords[0].lat,
                driverCoords[0].long,
                originCoords[0].lat,
                originCoords[0].long
            );
            
            if (distance <= maxDistance) {
                startingLoadCandidates.push({ load, distance });
            }
        }
        
        // Sort by distance and take closest ones
        startingLoadCandidates.sort((a, b) => a.distance - b.distance);
        const startingLoads = startingLoadCandidates
            .slice(0, maxStartingLoads)
            .map(c => c.load);
        
        console.log(`Found ${startingLoadCandidates.length} starting loads, using top ${startingLoads.length} for ${driverGroup.driver.first_name}`);
        
        // Build chains from each starting load
        for (const startLoad of startingLoads) {
            const chains = this.buildLoadChains(
                startLoad,
                availableLoads, // Chain with all available loads
                maxDistance,
                maxChainLength
            );
            allChains.push(...chains);
            
            // Limit total chains to prevent memory issues
            if (allChains.length > 1000) {
                console.log(`Chain limit reached for ${driverGroup.driver.first_name}, stopping early`);
                break;
            }
        }
        
        return allChains;
}
    // MODIFIED: Build route tree from a load chain
    private buildRouteTreeFromChain(
        driverGroup: DriverGroup,
        homeLoad: Load,
        chain: LoadChain,
        treeIndex: number
    ): RouteTree {
        const startNode = this.createRouteNode(homeLoad, 'START', 0);
        const allNodes: RouteNode[] = [startNode];
        
        // Create pickup and delivery nodes for each load in the chain
        chain.loads.forEach(load => {
            const pickup = this.createRouteNode(load, 'PICKUP', 30);
            const delivery = this.createRouteNode(load, 'DELIVERY', 20);
            allNodes.push(pickup, delivery);
        });
        
        const endNode = this.createRouteNode(homeLoad, 'END', 0);
        allNodes.push(endNode);
        
        // Optimize the order (pickup before delivery for each load)
        const optimizedPath = this.optimizeChainedNodeOrder(allNodes, chain.loads);
        
        // Create segments
        const segments: RouteSegment[] = [];
        for (let i = 0; i < optimizedPath.length - 1; i++) {
            const segment = this.createRouteSegment(optimizedPath[i], optimizedPath[i + 1]);
            segments.push(segment);
            
            optimizedPath[i].childNodes.push(optimizedPath[i + 1]);
            optimizedPath[i + 1].parentNode = optimizedPath[i];
            optimizedPath[i + 1].sequence = i + 1;
        }
        
        const leafNodes = optimizedPath.length > 0 ? [optimizedPath[optimizedPath.length - 1]] : [];
        
        const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
        const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
        const totalCost = segments.reduce((sum, seg) => sum + seg.cost, 0);
        const feasibilityScore = this.calculateFeasibilityScore(totalDistance, totalDuration, chain.loads.length);
        
        return {
            id: `route_tree_${driverGroup.driver.id}_${treeIndex}`,
            rootNode: startNode,
            segments,
            leafNodes,
            totalCost,
            totalDistance,
            totalDuration,
            isValid: chain.loads.length > 0,
            routePath: optimizedPath,
            feasibilityScore
        };
    }

    // NEW: Optimize node order respecting pickup-delivery constraints
    private optimizeChainedNodeOrder(nodes: RouteNode[], chainLoads: Load[]): RouteNode[] {
        const optimized: RouteNode[] = [];
        
        // Add START
        const startNode = nodes.find(n => n.nodeType === 'START');
        if (startNode) optimized.push(startNode);
        
        // For each load in the chain, add pickup then delivery
        for (const load of chainLoads) {
            const pickup = nodes.find(n => n.nodeType === 'PICKUP' && n.loadId === load.id);
            const delivery = nodes.find(n => n.nodeType === 'DELIVERY' && n.loadId === load.id);
            
            if (pickup) optimized.push(pickup);
            if (delivery) optimized.push(delivery);
        }
        
        // Add END
        const endNode = nodes.find(n => n.nodeType === 'END');
        if (endNode) optimized.push(endNode);
        
        console.log(`Optimized chained path: ${optimized.map(n => `${n.nodeType}_${n.loadId}`).join(' -> ')}`);
        
        return optimized;
    }

    // NEW: Calculate date score for a chain (earlier is better)
    private calculateChainDateScore(chain: LoadChain, dateField: keyof Load = 'pick_up_by'): number {
        if (chain.loads.length === 0) return 0;
        
        // Find the earliest date in the chain
        const dates: Date[] = [];
        
        for (const load of chain.loads) {
            const dateValue = load[dateField];
            if (!dateValue) continue;
            
            if (typeof dateValue === 'string') {
                const parsedDate = new Date(dateValue);
                if (!isNaN(parsedDate.getTime())) {
                    dates.push(parsedDate);
                }
            } else if (dateValue instanceof Date) {
                dates.push(dateValue);
            }
        }
        
        if (dates.length === 0) return 0;
        
        const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const now = new Date();
        
        // Calculate days until pickup (negative if in the past)
        const daysUntil = (earliestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        
        // Score: Sooner is better. Give higher scores to loads happening soon
        return Math.max(0, 1000 - (daysUntil * 10));
    }

    // MODIFIED: Generate alternative routes using chains
    // NEW: Generate routes starting with a specific date's loads
   // MODIFIED: Generate routes starting with a specific date's loads - with stricter distance filtering
    private generateAlternativeRoutesForDate(
        driverGroup: DriverGroup,
        startingDateLoads: Load[], // Loads that MUST start the chain (from target date)
        allAvailableLoads: Load[], // All loads available for chaining
        maxDistance: number = 400,
        maxChainLength: number = 6,
        maxAlternatives: number = 10
    ): RouteTree[] {
        const allRouteTrees: RouteTree[] = [];
        
        const homeLoad = {
            id: `home_${driverGroup.driver.id}`,
            origin: driverGroup.driver.home_base,
            destination: driverGroup.driver.home_base,
            origin_coordinates: driverGroup.driver.home_coordinates,
            destination_coordinates: driverGroup.driver.home_coordinates
        } as Load;
        
        const driverCoords = driverGroup.driver.home_coordinates as Array<{lat: number, long: number}> | null;
        if (!driverCoords) return allRouteTrees;
        
        // NEW: Only consider loads that are actually FEASIBLE from driver's location
        // Filter starting loads to only those within reasonable distance
        const feasibleStartingLoads = startingDateLoads.filter(load => {
            const originCoords = load.origin_coordinates as Array<{lat: number, long: number}> | null;
            if (!originCoords) return false;
            
            const distance = this.calculateDistance(
                driverCoords[0].lat,
                driverCoords[0].long,
                originCoords[0].lat,
                originCoords[0].long
            );
            
            // Only include loads that are actually reachable
            return distance <= maxDistance;
        });
        
        console.log(`  Driver ${driverGroup.driver.first_name} in ${driverGroup.driver.home_base}: ${feasibleStartingLoads.length}/${startingDateLoads.length} loads are within ${maxDistance}km`);
        
        // If no feasible loads for this date, return empty
        if (feasibleStartingLoads.length === 0) {
            console.log(`  No feasible loads for this driver on this date, skipping...`);
            return allRouteTrees;
        }
        
        // Reuse generateChainsFromHomeBase with only FEASIBLE starting loads
        const chains = this.generateChainsFromHomeBase(
            driverGroup,
            allAvailableLoads,           // Can chain with any available load
            maxDistance,
            maxChainLength,
            10,                          // maxStartingLoads
            feasibleStartingLoads        // Only start with feasible loads from this date
        );
        
        console.log(`  Generated ${chains.length} chains for this driver on this date`);
        
        // Sort chains by spatial efficiency
        chains.sort((a, b) => {
            const scoreA = a.loads.length * 1000 - a.totalDistance;
            const scoreB = b.loads.length * 1000 - b.totalDistance;
            return scoreB - scoreA;
        });
        
        // Build route trees from best chains
        for (let i = 0; i < Math.min(chains.length, maxAlternatives); i++) {
            const routeTree = this.buildRouteTreeFromChain(driverGroup, homeLoad, chains[i], i);
            if (routeTree.isValid) {
                allRouteTrees.push(routeTree);
            }
        }
        
        return allRouteTrees;
    }
    private calculateFeasibilityScore(distance: number, duration: number, loadCount: number): number {
        const loadScore = loadCount * 100;
        const distanceScore = Math.max(0, 1000 - distance);
        const timeScore = Math.max(0, 600 - duration);
        return loadScore + distanceScore * 0.1 + timeScore * 0.1;
    }

    private selectBestRoute(
        routeTrees: RouteTree[], 
        criteria: 'SHORTEST_DISTANCE' | 'SHORTEST_TIME' | 'LOWEST_COST' | "HIGHEST_LOAD_COUNT" | 'HIGHEST_FEASIBILITY' = 'HIGHEST_FEASIBILITY'
    ): { best: RouteTree; scores: { [routeId: string]: number } } {
        const scores: { [routeId: string]: number } = {};
        
        routeTrees.forEach(tree => {
            switch (criteria) {
                case 'SHORTEST_DISTANCE':
                    scores[tree.id] = -tree.totalDistance;
                    break;
                case 'SHORTEST_TIME':
                    scores[tree.id] = -tree.totalDuration;
                    break;
                case 'LOWEST_COST':
                    scores[tree.id] = -tree.totalCost;
                    break;
                case 'HIGHEST_LOAD_COUNT':
                    scores[tree.id] = tree.routePath.filter(node => node.nodeType === 'PICKUP').length;
                    break;
                case 'HIGHEST_FEASIBILITY':
                default:
                    scores[tree.id] = tree.feasibilityScore;
                    break;
            }
        });
        
        const bestRouteId = Object.keys(scores).reduce((best, current) => 
            scores[current] > scores[best] ? current : best
        );
        
        const bestRoute = routeTrees.find(tree => tree.id === bestRouteId)!;
        
        return { best: bestRoute, scores };
    }

    private createRouteComparison(routeTrees: RouteTree[]): RouteComparison {
        let bestDistance = { routeId: '', value: Infinity };
        let bestTime = { routeId: '', value: Infinity };
        let bestCost = { routeId: '', value: Infinity };
        let mostLoads = { routeId: '', value: 0 };
        
        routeTrees.forEach(tree => {
            if (tree.totalDistance < bestDistance.value) {
                bestDistance = { routeId: tree.id, value: tree.totalDistance };
            }
            if (tree.totalDuration < bestTime.value) {
                bestTime = { routeId: tree.id, value: tree.totalDuration };
            }
            if (tree.totalCost < bestCost.value) {
                bestCost = { routeId: tree.id, value: tree.totalCost };
            }
            
            const loadCount = tree.routePath.filter(node => node.nodeType === 'PICKUP').length;
            if (loadCount > mostLoads.value) {
                mostLoads = { routeId: tree.id, value: loadCount };
            }
        });
        
        return { bestDistance, bestTime, bestCost, mostLoads };
    }

    // NEW: Generate routes from driver's CURRENT location (not home base)
    private generateAlternativeRoutesFromCurrentLocation(
        driverState: DriverState,
        startingDateLoads: Load[],
        allAvailableLoads: Load[],
        maxDistance: number = 400,
        maxChainLength: number = 6,
        maxAlternatives: number = 10
    ): RouteTree[] {
        const allRouteTrees: RouteTree[] = [];
        
        // Use current location as "home" for this route
        const currentLocationLoad = {
            id: `current_${driverState.driverGroup.driver.id}_${Date.now()}`,
            origin: driverState.currentLocation.address,
            destination: driverState.currentLocation.address,
            origin_coordinates: [driverState.currentLocation.coordinates],
            destination_coordinates: [driverState.currentLocation.coordinates]
        } as unknown as Load;
        
        // Build chains starting from current location
        const allChains: LoadChain[] = [];
        
        // Sort starting loads by distance from current location
        const candidates = startingDateLoads.map(load => {
            const originCoords = load.origin_coordinates as Array<{lat: number, long: number}> | null;
            const distance = originCoords ? this.calculateDistance(
                driverState.currentLocation.coordinates.lat,
                driverState.currentLocation.coordinates.long,
                originCoords[0].lat,
                originCoords[0].long
            ) : Infinity;
            return { load, distance };
        }).sort((a, b) => a.distance - b.distance);
        
        const startingLoads = candidates.slice(0, 10).map(c => c.load);
        
        for (const startLoad of startingLoads) {
            const chains = this.buildLoadChains(
                startLoad,
                allAvailableLoads,
                maxDistance,
                maxChainLength
            );
            allChains.push(...chains);
            
            if (allChains.length > 1000) break;
        }
        
        // Sort by efficiency
        allChains.sort((a, b) => {
            const scoreA = a.loads.length * 1000 - a.totalDistance;
            const scoreB = b.loads.length * 1000 - b.totalDistance;
            return scoreB - scoreA;
        });
        
        // Build route trees
        for (let i = 0; i < Math.min(allChains.length, maxAlternatives); i++) {
            const routeTree = this.buildRouteTreeFromChain(driverState.driverGroup, currentLocationLoad, allChains[i], i);
            if (routeTree.isValid) {
                allRouteTrees.push(routeTree);
            }
        }
        
        return allRouteTrees;
    }

    // IMPROVED: Make assignments in strict chronological order with location tracking
    public makeChronologicalTreeBasedAssignments(
        context: RoutePlannerContext,
        maxDistance: number = 400,
        maxChainLength: number = 6,
        maxAlternatives: number = 10,
        selectionCriteria: 'SHORTEST_DISTANCE' | 'SHORTEST_TIME' | "HIGHEST_LOAD_COUNT" | 'LOWEST_COST' | 'HIGHEST_FEASIBILITY' = 'HIGHEST_FEASIBILITY',
        dateField: keyof Load = 'pick_up_by'
    ): TreeBasedAssignment[] {
        const assignmentContext = this.getAssignmentContext(
            context.drivers,
            context.trucks,
            context.trailers,
            context.loads,
            maxDistance
        );
        
        const assignments: TreeBasedAssignment[] = [];
        const availableLoads = [...assignmentContext.unassignedLoads];
        
        // NEW: Track each driver's current location
        const driverStates: DriverState[] = assignmentContext.driverGroups.map(dg => {
            const homeCoords = dg.driver.home_coordinates as Array<{lat: number, long: number}> | null;
            return {
                driverGroup: dg,
                currentLocation: {
                    coordinates: {
                        lat: homeCoords?.[0]?.lat || 0,
                        long: homeCoords?.[0]?.long || 0
                    },
                    address: dg.driver.home_base || ''
                },
                assignedLoads: []
            };
        });
        
        // Group loads by date
        const dateGroups = this.groupLoadsByDate(availableLoads, dateField);
        const sortedDates = this.getSortedDateKeys(dateGroups);
        
        console.log(`Processing loads across ${sortedDates.length} dates in chronological order`);
        
        // Process each date in order
        for (const dateKey of sortedDates) {
            const loadsForDate = dateGroups.get(dateKey)!;
            console.log(`\n=== Processing date: ${dateKey} (${loadsForDate.length} loads) ===`);
            
            // Filter available loads to only include this date and later
            const currentAndFutureLoads = availableLoads.filter(load => {
                const dateValue = load[dateField];
                if (!dateValue) return false;
                
                let loadDateKey: string;
                if (typeof dateValue === 'string') {
                    loadDateKey = dateValue.split('T')[0];
                } else if (dateValue instanceof Date) {
                    loadDateKey = dateValue.toISOString().split('T')[0];
                } else {
                    return false;
                }
                
                return loadDateKey >= dateKey;
            });
            
            // Assign drivers to loads for this date
            for (const driverState of driverStates) {
                // Find loads from this date that are near the driver's CURRENT location
                const feasibleLoads = loadsForDate.filter(load => {
                    const originCoords = load.origin_coordinates as Array<{lat: number, long: number}> | null;
                    if (!originCoords) return false;
                    
                    const distance = this.calculateDistance(
                        driverState.currentLocation.coordinates.lat,
                        driverState.currentLocation.coordinates.long,
                        originCoords[0].lat,
                        originCoords[0].long
                    );
                    
                    return distance <= maxDistance;
                });
                
                if (feasibleLoads.length === 0) {
                    console.log(`  No feasible loads for ${driverState.driverGroup.driver.first_name} from ${driverState.currentLocation.address}`);
                    continue;
                }
                
                console.log(`  ${driverState.driverGroup.driver.first_name} at ${driverState.currentLocation.address}: ${feasibleLoads.length} feasible loads`);
                
                // Generate routes using CURRENT location
                const alternativeRoutes = this.generateAlternativeRoutesFromCurrentLocation(
                    driverState,
                    feasibleLoads,
                    currentAndFutureLoads,
                    maxDistance,
                    maxChainLength,
                    maxAlternatives
                );
                
                if (alternativeRoutes.length === 0) continue;
                
                const { best: primaryRoute, scores } = this.selectBestRoute(alternativeRoutes, selectionCriteria);
                const routeComparison = this.createRouteComparison(alternativeRoutes);
                
                const totalLoadsHandled = primaryRoute.routePath.filter(node => 
                    node.nodeType === 'PICKUP'
                ).length;
                
                const assignment: TreeBasedAssignment = {
                    driverGroup: driverState.driverGroup,
                    primaryRoute,
                    alternativeRoutes: alternativeRoutes.filter(route => route.id !== primaryRoute.id),
                    selectionCriteria: {
                        criteriaUsed: selectionCriteria,
                        scores
                    },
                    totalLoadsHandled,
                    routeComparison
                };
                
                assignments.push(assignment);
                
                // Remove assigned loads and UPDATE DRIVER'S LOCATION
                const assignedLoadNodes = primaryRoute.routePath.filter(node => node.nodeType === 'PICKUP');
                
                assignedLoadNodes.forEach(pickupNode => {
                    const index = availableLoads.findIndex(load => load.id === pickupNode.loadId);
                    if (index !== -1) {
                        const assignedLoad = availableLoads[index];
                        driverState.assignedLoads.push(assignedLoad);
                        availableLoads.splice(index, 1);
                        console.log(`  Assigned load ${pickupNode.loadId} to ${driverState.driverGroup.driver.first_name}`);
                    }
                });
                
                // Update driver's location to last delivery location
                const lastDeliveryNode = primaryRoute.routePath
                    .filter(node => node.nodeType === 'DELIVERY')
                    .pop();
                
                if (lastDeliveryNode) {
                    driverState.currentLocation = {
                        coordinates: lastDeliveryNode.location.coordinates,
                        address: lastDeliveryNode.location.address
                    };
                    console.log(`  ${driverState.driverGroup.driver.first_name} now at ${driverState.currentLocation.address}`);
                }
                
                // If all loads for this date are assigned, move to next date
                const remainingLoadsForDate = loadsForDate.filter(load => 
                    availableLoads.some(available => available.id === load.id)
                );
                
                if (remainingLoadsForDate.length === 0) {
                    console.log(`All loads for ${dateKey} assigned, moving to next date`);
                    break;
                }
            }
        }
        
        return assignments;
    }

    // Helper functions
    private assignTruckToDriver(driver: Driver, truck: Truck, maxDistance: number): boolean {
        if (driver.home_base === truck.current_location) return true;
        
        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const truckCoords = truck.current_coordinates as Array<{lat: number, long: number}> | null;
        
        if (!driverCoords || !truckCoords) return false;
        
        const distance = this.calculateDistance(
            driverCoords[0].lat,
            driverCoords[0].long,
            truckCoords[0].lat,
            truckCoords[0].long
        );
        
        return distance <= maxDistance;
    }

    private assignTrailerToDriver(driver: Driver, trailer: Trailer, maxDistance: number): boolean {
        if (driver.home_base === trailer.current_location) return true;
        
        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const trailerCoords = trailer.current_coordinates as Array<{lat: number, long: number}> | null;
        
        if (!driverCoords || !trailerCoords) return false;
        
        const distance = this.calculateDistance(
            driverCoords[0].lat,
            driverCoords[0].long,
            trailerCoords[0].lat,
            trailerCoords[0].long
        );
        
        return distance <= maxDistance;
    }

    private getAssignmentContext(
        drivers: Driver[], 
        trucks: Truck[], 
        trailers: Trailer[], 
        loads: Load[], 
        maxDistance: number
    ): AssignmentContext {
        const driverGroups: DriverGroup[] = [];
        const usedTrucks = new Set<string>();
        const usedTrailers = new Set<string>();
        
        for (const driver of drivers) {
            let bestTruck: Truck | null = null;
            let bestTruckDistance = Infinity;
            
            for (const truck of trucks) {
                if (usedTrucks.has(truck.id)) continue;
                
                if (this.assignTruckToDriver(driver, truck, maxDistance)) {
                    const distance = this.getDistanceToTruck(driver, truck);
                    if (distance < bestTruckDistance) {
                        bestTruckDistance = distance;
                        bestTruck = truck;
                    }
                }
            }
            
            if (bestTruck) {
                let bestTrailer: Trailer | null = null;
                let bestTrailerDistance = Infinity;
                
                for (const trailer of trailers) {
                    if (usedTrailers.has(trailer.id)) continue;
                    
                    if (this.assignTrailerToDriver(driver, trailer, maxDistance)) {
                        const distance = this.getDistanceToTrailer(driver, trailer);
                        if (distance < bestTrailerDistance) {
                            bestTrailerDistance = distance;
                            bestTrailer = trailer;
                        }
                    }
                }
                
                if (bestTrailer) {
                    driverGroups.push({ driver, truck: bestTruck, trailer: bestTrailer });
                    usedTrucks.add(bestTruck.id);
                    usedTrailers.add(bestTrailer.id);
                }
            }
        }
        
        return { driverGroups, unassignedLoads: loads };
    }

    private getDistanceToTruck(driver: Driver, truck: Truck): number {
        if (driver.home_base === truck.current_location) return 0;
        
        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const truckCoords = truck.current_coordinates as Array<{lat: number, long: number}> | null;
        
        if (!driverCoords || !truckCoords) return Infinity;
        
        return this.calculateDistance(
            driverCoords[0].lat,
            driverCoords[0].long,
            truckCoords[0].lat,
            truckCoords[0].long
        );
    }

    private getDistanceToTrailer(driver: Driver, trailer: Trailer): number {
        if (driver.home_base === trailer.current_location) return 0;
        
        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const trailerCoords = trailer.current_coordinates as Array<{lat: number, long: number}> | null;
        
        if (!driverCoords || !trailerCoords) return Infinity;
        
        return this.calculateDistance(
            driverCoords[0].lat,
            driverCoords[0].long,
            trailerCoords[0].lat,
            trailerCoords[0].long
        );
    }
}