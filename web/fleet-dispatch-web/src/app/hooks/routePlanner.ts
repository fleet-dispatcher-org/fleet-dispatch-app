import {Driver, Truck, Trailer, Load} from "@prisma/client";

export type RoutePlannerContext = {
    drivers: Driver[];
    trucks: Truck[];
    trailers: Trailer[];
    loads: Load[];
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

// Tree-based route structure with alternatives
export type RouteNode = {
    id: string; // This will be the unique node identifier
    loadId: string; // This preserves the original load.id for database lookup
    load: Load;
    nodeType: 'START' | 'PICKUP' | 'DELIVERY' | 'END';
    location: {
        coordinates: { lat: number; long: number };
        address: string;
    };
    estimatedArrivalTime?: Date;
    serviceTime: number;
    sequence: number;
    // Tree-specific properties
    parentNode?: RouteNode;
    childNodes: RouteNode[];
    depth: number; // How deep in the route tree
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
    rootNode: RouteNode; // Starting point (driver's home base)
    segments: RouteSegment[]; // All the connections between nodes
    leafNodes: RouteNode[]; // End points (could be multiple if exploring alternatives)
    totalCost: number;
    totalDistance: number;
    totalDuration: number;
    isValid: boolean;
    routePath: RouteNode[]; // The actual sequence of nodes for this route
    feasibilityScore: number; // Higher is better
}

export type TreeBasedAssignment =  {
    driverGroup: DriverGroup;
    primaryRoute: RouteTree; // Best route selected
    alternativeRoutes: RouteTree[]; // Other possible routes
    selectionCriteria: {
        criteriaUsed: 'SHORTEST_DISTANCE' | 'SHORTEST_TIME' | 'LOWEST_COST' | 'HIGHEST_FEASIBILITY';
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

export class RoutePlanner {
    constructor() {}
    
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
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
            // Create unique node ID but preserve original load ID
            id: `${nodeType.toLowerCase()}_${load.id}_${Date.now()}`,
            loadId: load.id, // ← PRESERVE ORIGINAL LOAD ID HERE
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
            sequence: 0, // Will be set when building path
            parentNode: parentNode,
            childNodes: [],
            depth: parentNode ? parentNode.depth + 1 : 0
        };
    }

    private createRouteSegment(fromNode: RouteNode, toNode: RouteNode) {
        const distance = this.calculateDistance(
            fromNode.location.coordinates.lat,
            fromNode.location.coordinates.long,
            toNode.location.coordinates.lat,
            toNode.location.coordinates.long
        );
        
        const drivingTime = (distance / 60) * 60; // Assume 60 km/h average speed
        const duration = drivingTime + fromNode.serviceTime;
        const cost = distance * 2.5 + drivingTime * 0.5; // Example cost calculation

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

    // ADD: Method to transform load IDs for final output/database operations
    private transformLoadIdsForFinalAssignment(assignment: TreeBasedAssignment): TreeBasedAssignment {
        // This is where you can modify the load IDs for the final result
        const transformNode = (node: RouteNode): RouteNode => ({
            ...node,
            // Example transformations - modify as needed:
            loadId: `ASSIGNED_${node.loadId}`, // Add prefix
            // OR: loadId: node.loadId.replace('LOAD', 'ROUTE'), // Replace part
            // OR: loadId: `${node.loadId}_${assignment.driverGroup.driver.id}`, // Add driver ID
            childNodes: node.childNodes.map(transformNode)
        });

        const transformRoute = (route: RouteTree): RouteTree => ({
            ...route,
            rootNode: transformNode(route.rootNode),
            routePath: route.routePath.map(transformNode),
            leafNodes: route.leafNodes.map(transformNode),
            segments: route.segments.map(segment => ({
                ...segment,
                fromNode: transformNode(segment.fromNode),
                toNode: transformNode(segment.toNode)
            }))
        });

        return {
            ...assignment,
            primaryRoute: transformRoute(assignment.primaryRoute),
            alternativeRoutes: assignment.alternativeRoutes.map(transformRoute)
        };
    }

    private getCombinations<T>(arr: T[], size: number): T[][] {
        if (size === 1) return arr.map(el => [el]);
        
        const combinations: T[][] = [];
        for (let i = 0; i <= arr.length - size; i++) {
            const first = arr[i];
            const rest = this.getCombinations(arr.slice(i + 1), size - 1);
            combinations.push(...rest.map(combo => [first, ...combo]));
        }
        
        return combinations;
    }

    private buildRouteTreeForLoads(
        driverGroup: DriverGroup, 
        homeLoad: Load, 
        loads: Load[], 
        treeIndex: number
    ): RouteTree {
        // Create start node
        const startNode = this.createRouteNode(homeLoad, 'START', 0);
        
        // Create all pickup and delivery nodes
        const allNodes: RouteNode[] = [startNode];
        const pickupNodes: RouteNode[] = [];
        const deliveryNodes: RouteNode[] = [];
        
        loads.forEach(load => {
            const pickup = this.createRouteNode(load, 'PICKUP', 30);
            const delivery = this.createRouteNode(load, 'DELIVERY', 20);
            
            allNodes.push(pickup, delivery);
            pickupNodes.push(pickup);
            deliveryNodes.push(delivery);
        });
        
        // Create end node
        const endNode = this.createRouteNode(homeLoad, 'END', 0);
        allNodes.push(endNode);
        
        // Generate optimized path (simple nearest neighbor for now)
        const optimizedPath = this.optimizeNodeOrder([startNode, ...pickupNodes, ...deliveryNodes, endNode]);
        
        // Create segments for the optimized path
        const segments: RouteSegment[] = [];
        const leafNodes: RouteNode[] = [];
        
        for (let i = 0; i < optimizedPath.length - 1; i++) {
            const segment = this.createRouteSegment(optimizedPath[i], optimizedPath[i + 1]);
            segments.push(segment);
            
            // Set up parent-child relationships
            optimizedPath[i].childNodes.push(optimizedPath[i + 1]);
            optimizedPath[i + 1].parentNode = optimizedPath[i];
            optimizedPath[i + 1].sequence = i + 1;
        }
        
        // Last node is a leaf
        if (optimizedPath.length > 0) {
            leafNodes.push(optimizedPath[optimizedPath.length - 1]);
        }
        
        // Calculate totals
        const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
        const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
        const totalCost = segments.reduce((sum, seg) => sum + seg.cost, 0);
        
        // Calculate feasibility score (higher is better)
        const feasibilityScore = this.calculateFeasibilityScore(totalDistance, totalDuration, loads.length);
        
        return {
            id: `route_tree_${driverGroup.driver.id}_${treeIndex}`,
            rootNode: startNode,
            segments,
            leafNodes,
            totalCost,
            totalDistance,
            totalDuration,
            isValid: loads.length > 0, // 10 hours max I had: totalDuration <= 600 I took this off for more testing
            routePath: optimizedPath,
            feasibilityScore
        };
    }

    private generateAlternativeRoutes(
        driverGroup: DriverGroup,
        availableLoads: Load[],
        maxLoadsPerRoute: number = 4,
        maxAlternatives: number = 10
    ): RouteTree[] {
        const allRouteTrees: RouteTree[] = [];
        
        // Create home base dummy load - KEEP ORIGINAL ID
        const homeLoad = {
            id: `home_${driverGroup.driver.id}`, // This stays as-is for internal processing
            origin: driverGroup.driver.home_base,
            destination: driverGroup.driver.home_base,
            origin_coordinates: driverGroup.driver.home_coordinates,
            destination_coordinates: driverGroup.driver.home_coordinates
        } as Load;

        // Generate different combinations of loads
        const loadCombinations = this.generateLoadCombinations(availableLoads, maxLoadsPerRoute);
        console.log(`Generated ${loadCombinations.length} load combinations for driver ${driverGroup.driver.first_name}`);
        
        for (let i = 0; i < Math.min(loadCombinations.length, maxAlternatives); i++) {
            const loadCombo = loadCombinations[i];
            const routeTree = this.buildRouteTreeForLoads(driverGroup, homeLoad, loadCombo, i);
            // console.log(`Route Tree ${i} for driver ${driverGroup.driver.first_name}:`, routeTree);
            if (routeTree.isValid) {
                console.log
                allRouteTrees.push(routeTree);
            }
        }
        console.log(`All Route Trees Generated: ${allRouteTrees.length} for driver ${driverGroup.driver.first_name}`);
        return allRouteTrees;
    }

    // Generate different combinations of loads
    private generateLoadCombinations(loads: Load[], maxPerRoute: number): Load[][] {
        const combinations: Load[][] = [];
        
        // Always include individual loads
        loads.forEach(load => combinations.push([load]));
        
        // Generate combinations based on proximity/compatibility
        for (let size = 2; size <= Math.min(maxPerRoute, 4); size++) {
            const smartCombos = this.generateSmartCombinations(loads, size);
            combinations.push(...smartCombos.slice(0, 200)); // Limit per size
        }
        
        return combinations;
    }

    private generateSmartCombinations(loads: Load[], size: number): Load[][] {
        const combinations: Load[][] = [];
        
        // Sort loads by pickup location to group nearby loads
        const sortedLoads = [...loads].sort((a, b) => {
            // Sort by destination coordinates if available
            const aCoords = a.destination_coordinates as Array<{lat: number, long: number}> | null;
            const aLat = aCoords?.[0]?.lat;
            const aLong = aCoords?.[0]?.long;
            const bLat = b.origin_coordinates ? (b.origin_coordinates as Array<{lat: number, long: number}>)[0]?.lat : 0;
            const bLong = b.origin_coordinates ? (b.origin_coordinates as Array<{lat: number, long: number}>)[0]?.long : 0;
            return aLat! - bLat!;
        });
        
        // Generate combinations from nearby loads
        for (let i = 0; i < sortedLoads.length && combinations.length < 300; i++) {
            const baseLoad = sortedLoads[i];
            const combo = [baseLoad];
            
            // Add nearby loads to form a combination
            for (let j = i + 1; j < Math.min(i + size * 2, sortedLoads.length) && combo.length < size; j++) {
                combo.push(sortedLoads[j]);
            }
            
            if (combo.length === size) {
                combinations.push(combo);
            }
        }
        
        return combinations;
    }

    // Simple node ordering (you can replace with more sophisticated algorithms)
    private optimizeNodeOrder(nodes: RouteNode[]): RouteNode[] {
        if (nodes.length <= 2) return nodes;
        
        const optimized: RouteNode[] = [];
        const remaining = [...nodes];
        
        // Start with START node
        const startNode = remaining.find(n => n.nodeType === 'START');
        if (startNode) {
            optimized.push(startNode);
            remaining.splice(remaining.indexOf(startNode), 1);
        }
        
        // Use nearest neighbor for middle nodes
        let currentNode = startNode;
        
        while (remaining.length > 1) { // Keep END node for last
            let nearestNode: RouteNode | null = null;
            let nearestDistance = Infinity;
            
            for (const node of remaining) {
                if (node.nodeType === 'END') continue;
                
                if (currentNode) {
                    const distance = this.calculateDistance(
                        currentNode.location.coordinates.lat,
                        currentNode.location.coordinates.long,
                        node.location.coordinates.lat,
                        node.location.coordinates.long
                    );
                    
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestNode = node;
                    }
                }
            }
            
            if (nearestNode) {
                optimized.push(nearestNode);
                currentNode = nearestNode;
                remaining.splice(remaining.indexOf(nearestNode), 1);
            } else {
                break;
            }
        }
        
        // Add END node
        const endNode = remaining.find(n => n.nodeType === 'END');
        if (endNode) {
            optimized.push(endNode);
        }

        // console.log('Optimized Node Order:', optimized.map(n => n.nodeType + '_' + n.loadId));
        // console.log('Total Nodes in Optimized Path:', optimized.length);
        // console.log(`Optimized Path for Driver: ${optimized.map(n => n.loadId).join(' -> ')}`); 
        
        return optimized;
    }

    // Calculate how feasible/good a route is
    private calculateFeasibilityScore(distance: number, duration: number, loadCount: number): number {
        // Higher score is better
        // Factors: more loads is good, shorter distance is good, reasonable duration is good
        const loadScore = loadCount * 100;
        const distanceScore = Math.max(0, 1000 - distance); // Penalty for long distances
        const timeScore = Math.max(0, 600 - duration); // Penalty for long duration (600 = 10 hours)
        
        return loadScore + distanceScore * 0.5 + timeScore * 0.3;
    }

    private selectBestRoute(
        routeTrees: RouteTree[], 
        criteria: 'SHORTEST_DISTANCE' | 'SHORTEST_TIME' | 'LOWEST_COST' | 'HIGHEST_FEASIBILITY' = 'HIGHEST_FEASIBILITY'
    ): { best: RouteTree; scores: { [routeId: string]: number } } {
        const scores: { [routeId: string]: number } = {};
        
        routeTrees.forEach(tree => {
            switch (criteria) {
                case 'SHORTEST_DISTANCE':
                    scores[tree.id] = -tree.totalDistance; // Negative because lower is better
                    break;
                case 'SHORTEST_TIME':
                    scores[tree.id] = -tree.totalDuration;
                    break;
                case 'LOWEST_COST':
                    scores[tree.id] = -tree.totalCost;
                    break;
                case 'HIGHEST_FEASIBILITY':
                default:
                    scores[tree.id] = tree.feasibilityScore;
                    break;
            }
        });
        
        // Find the route with highest score
        const bestRouteId = Object.keys(scores).reduce((best, current) => 
            scores[current] > scores[best] ? current : best
        );
        
        const bestRoute = routeTrees.find(tree => tree.id === bestRouteId)!;
        
        return { best: bestRoute, scores };
    }

    // Create route comparison data
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
            
            const loadCount = tree.routePath.filter(node => 
                node.nodeType === 'PICKUP'
            ).length;
            
            if (loadCount > mostLoads.value) {
                mostLoads = { routeId: tree.id, value: loadCount };
            }
        });
        
        return { bestDistance, bestTime, bestCost, mostLoads };
    }

    // Main function to create tree-based assignments
    public makeTreeBasedAssignments(
        context: RoutePlannerContext,
        maxDistance: number = 400,
        maxLoadsPerRoute: number = 6,
        maxAlternatives: number = 6,
        selectionCriteria: 'SHORTEST_DISTANCE' | 'SHORTEST_TIME' | 'LOWEST_COST' | 'HIGHEST_FEASIBILITY' = 'HIGHEST_FEASIBILITY'
    ): TreeBasedAssignment[] {
        // Get your assignment context
        const assignmentContext = this.getAssignmentContext(
            context.drivers,
            context.trucks,
            context.trailers,
            context.loads,
            maxDistance
        );
        
        const assignments: TreeBasedAssignment[] = [];
        const availableLoads = [...assignmentContext.unassignedLoads];
        console.log('Driver Groups Length: ', assignmentContext.driverGroups.length);
        console.log("Driver Groups:", assignmentContext.driverGroups);
        for (const driverGroup of assignmentContext.driverGroups) {
            // Find loads this driver can handle
            const feasibleLoads = this.findFeasibleLoads(driverGroup, availableLoads, maxDistance);
            
            if (feasibleLoads.length === 0) continue;
            
            // Generate alternative routes
            const alternativeRoutes = this.generateAlternativeRoutes(
                driverGroup, 
                feasibleLoads, 
                maxLoadsPerRoute, 
                maxAlternatives
            );
            
            if (alternativeRoutes.length === 0) continue;
            
            // Select the best route
            const { best: primaryRoute, scores } = this.selectBestRoute(alternativeRoutes, selectionCriteria);
            
            // Create route comparison
            const routeComparison = this.createRouteComparison(alternativeRoutes);
            
            // Count loads in primary route
            const totalLoadsHandled = primaryRoute.routePath.filter(node => 
                node.nodeType === 'PICKUP'
            ).length;
            
            // Create assignment (with original load IDs intact)
            const assignment: TreeBasedAssignment = {
                driverGroup,
                primaryRoute,
                alternativeRoutes: alternativeRoutes.filter(route => route.id !== primaryRoute.id),
                selectionCriteria: {
                    criteriaUsed: selectionCriteria,
                    scores
                },
                totalLoadsHandled,
                routeComparison
            };

            // Don't transform load IDs - keep them as original database IDs
            // assignment = this.transformLoadIdsForFinalAssignment(assignment);

            console.log('Assignment:', assignment);
            
            assignments.push(assignment);
            
            // Remove assigned loads from available loads (using original load ID)
            primaryRoute.routePath
                .filter(node => node.nodeType === 'PICKUP')
                .forEach(pickupNode => {
                    const index = availableLoads.findIndex(load => load.id === pickupNode.loadId);
                    if (index !== -1) {
                        availableLoads.splice(index, 1);
                    }
                });
        }
        
        return assignments;
    }

    // Helper functions (keeping your existing ones)
    private assignTruckToDriver(driver: Driver, truck: Truck, maxDistance: number) {
        if (driver.home_base === truck.current_location) {
            return true;
        }

        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const driverLat = driverCoords?.[0]?.lat;
        const driverLong = driverCoords?.[0]?.long;

        const truckCoords = truck.current_coordinates as Array<{lat: number, long: number}> | null;
        const truckLat = truckCoords?.[0]?.lat;
        const truckLong = truckCoords?.[0]?.long;
        const distance = this.calculateDistance(driverLat!, driverLong!, truckLat!, truckLong!);
        return distance <= maxDistance;
    }

    private assignTrailerToDriver(driver: Driver, trailer: Trailer, maxDistance: number) {
        if (driver.home_base === trailer.current_location) {
            return true;
        }

        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const driverLat = driverCoords?.[0]?.lat;
        const driverLong = driverCoords?.[0]?.long;

        const trailerCoords = trailer.current_coordinates as Array<{lat: number, long: number}> | null;
        const trailerLat = trailerCoords?.[0]?.lat;
        const trailerLong = trailerCoords?.[0]?.long;
        const distance = this.calculateDistance(driverLat!, driverLong!, trailerLat!, trailerLong!);
        
        return distance <= maxDistance;
    }

    private getAssignmentContext(drivers: Driver[], trucks: Truck[], trailers: Trailer[], Loads: Load[], maxDistance: number) {
        const driverGroups: DriverGroup[] = [];
        const usedTrucks = new Set<string>(); // assuming truck has an id property
        const usedTrailers = new Set<string>(); // assuming trailer has an id property

        for (const driver of drivers) {
            let bestTruck: Truck | null = null;
            let bestTruckDistance = Infinity;
            
            // Find the closest available truck
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
                
                // Find the closest available trailer
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
                    driverGroups.push({driver, truck: bestTruck, trailer: bestTrailer});
                    usedTrucks.add(bestTruck.id);
                    usedTrailers.add(bestTrailer.id);
                }
            }
        }
        // console.log('Driver Groups:', driverGroups); should be 22 for all drivers 
        // console.log('Unassigned Loads:', Loads); should be 80 for all loads
        return { driverGroups, unassignedLoads: Loads } as AssignmentContext;
    }

    private getDistanceToTruck(driver: Driver, truck: Truck): number {
        if (driver.home_base === truck.current_location) {
            return 0; // Same location = 0 distance
        }

        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const driverLat = driverCoords?.[0]?.lat;
        const driverLong = driverCoords?.[0]?.long;

        const truckCoords = truck.current_coordinates as Array<{lat: number, long: number}> | null;
        const truckLat = truckCoords?.[0]?.lat;
        const truckLong = truckCoords?.[0]?.long;

        return this.calculateDistance(driverLat!, driverLong!, truckLat!, truckLong!);
    }

    private getDistanceToTrailer(driver: Driver, trailer: Trailer): number {
        if (driver.home_base === trailer.current_location) {
            return 0; // Same location = 0 distance
        }

        const driverCoords = driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const driverLat = driverCoords?.[0]?.lat;
        const driverLong = driverCoords?.[0]?.long;

        const trailerCoords = trailer.current_coordinates as Array<{lat: number, long: number}> | null;
        const trailerLat = trailerCoords?.[0]?.lat;
        const trailerLong = trailerCoords?.[0]?.long;

        return this.calculateDistance(driverLat!, driverLong!, trailerLat!, trailerLong!);
    }

    private findFeasibleLoads(
        driverGroup: DriverGroup, 
        unassignedLoads: Load[], 
        maxDistance: number
    ): Load[] {
        const feasibleLoads: Load[] = [];
        const driverCoords = driverGroup.driver.home_coordinates as Array<{lat: number, long: number}> | null;
        const driverLat = driverCoords?.[0]?.lat;
        const driverLong = driverCoords?.[0]?.long;

        console.log('Finding feasible loads for driver:', driverGroup.driver.first_name);
        
        for (const load of unassignedLoads) {
            const originCoords = load.origin_coordinates as Array<{lat: number, long: number}> | null;
            const originLat = originCoords?.[0]?.lat;
            const originLong = originCoords?.[0]?.long;
            
            if (driverLat && driverLong && originLat && originLong) {
                const distanceToPickup = this.calculateDistance(driverLat, driverLong, originLat, originLong);
                // console.log(`Distance from ${driverGroup.driver.first_name} to load ${load.id}: ${distanceToPickup.toFixed(2)} km`);
                
                // Check if within max distance or if pickup is at home base
                if (distanceToPickup <= maxDistance || load.origin === driverGroup.driver.home_base) {
                    // console.log(`Load ${load.id} is feasible for driver ${driverGroup.driver.first_name}`);
                    feasibleLoads.push(load);
                }
            }
        }
        console.log(`Feasible Loads: ${feasibleLoads.length} for driver ${driverGroup.driver.first_name}`);
        return feasibleLoads;
    }
}