// app/api/upload-routes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';
import { Status } from '@prisma/client';

interface ParsedRoute {
  route: {
    routeIdentifier: string;
    totalDistance: number;
    totalCost: number;
    assigned_driver: string;
    assigned_truck: string;
    assigned_trailer: string;
    status: Status;
  };
  loads: Array<{
    origin: string;
    destination: string;
    weight: number;
    pick_up_by: Date;
    due_by: Date;
    status: Status;
    assigned_driver: string;
    assigned_trailer: string;
    assigned_truck: string;
    order: number;
  }>;
  driver: {
    name: string;
  };
  truck: {
    truck_number: number;
    next_maintenance_date: Date;
    next_admin_date: Date;
    current_location: string;
    truck_admin_designator: number;
  };
  trailer: {
    trailer_number: number;
    next_maintenance_date: Date;
    next_admin_date: Date;
    current_location: string;
    trailer_admin_designator: number;
    trailer_vessel_type: string;
  };
}

function getRouteIdentifier(routeOrder: string): string {
  return routeOrder.match(/^[A-Z]+/)?.[0] || '';
}

function groupRowsByRoute(data: any[]): Map<string, any[]> {
  const routeGroups = new Map<string, any[]>();
  
  for (const row of data) {
    const routeOrder = row['ROUTE ORDER'];
    const routeId = getRouteIdentifier(routeOrder);
    
    if (!routeGroups.has(routeId)) {
      routeGroups.set(routeId, []);
    }
    routeGroups.get(routeId)!.push(row);
  }
  
  return routeGroups;
}

function parseRouteData(routeRows: any[], routeId: string): ParsedRoute {
  const firstRow = routeRows[0];
  
  const driver = {
    name: firstRow['DRIVER'],
  };

  const truck = {
    truck_number: firstRow['TRUCK'],
    next_maintenance_date: new Date(firstRow['TRUCK MAINT DATE']),
    next_admin_date: new Date(firstRow['TRUCK ADMIN DATE']),
    current_location: firstRow['TRUCK GO LOCATION NAME'],
    truck_admin_designator: firstRow['TRUCK ADMIN DESIGNATOR'],
  };

  const firstTrailerRow = routeRows.find(row => row['TRAILER']);
  const trailer = {
    trailer_number: firstTrailerRow['TRAILER'],
    next_maintenance_date: new Date(firstTrailerRow['TRAILER MAINT DATE']),
    next_admin_date: new Date(firstTrailerRow['TRAILER ADMIN DATE']),
    current_location: firstTrailerRow['TRAILER GO LOCATION NAME'],
    trailer_admin_designator: firstTrailerRow['TRAILER ADMIN DESIGNATION'],
    trailer_vessel_type: firstTrailerRow['TRAILER VESSEL TYPE'],
  };

  const loads: ParsedRoute['loads'] = [];
  let totalDistance = 0;
  let totalCost = 0;
  let loadOrder = 0;

  for (let i = 1; i < routeRows.length; i += 2) {
    const pickupRow = routeRows[i];
    const deliveryRow = routeRows[i + 1];

    if (!pickupRow || !deliveryRow) break;

    if (pickupRow['RATE'] === 'POSITIONING' && deliveryRow['RATE'] !== 'POSITIONING') {
      loadOrder++;
      
      const load = {
        origin: pickupRow['CITY AND STATE'],
        destination: deliveryRow['CITY AND STATE'],
        weight: 0,
        pick_up_by: new Date(pickupRow['APPT TIME']),
        due_by: new Date(deliveryRow['APPT TIME']),
        status: 'ASSIGNED' as Status,
        assigned_driver: driver.name,
        assigned_trailer: pickupRow['LOAD'] || trailer.trailer_number,
        assigned_truck: truck.truck_number,
        order: loadOrder,
      };

      loads.push(load);

      const rate = parseFloat(deliveryRow['RATE']) || 0;
      const distance = parseFloat(deliveryRow['MILAGE FROM PREVIOUS LOCATION']) || 0;
      
      totalCost += rate;
      totalDistance += distance;
    }
  }

  const route = {
    routeIdentifier: routeId,
    totalDistance,
    totalCost,
    assigned_driver: driver.name,
    assigned_truck: truck.truck_number,
    assigned_trailer: trailer.trailer_number,
    status: 'ASSIGNED' as Status,
  };

  return {
    route,
    loads,
    driver,
    truck,
    trailer,
  };
}

function parseAllRoutesFromCSV(data: any[]): ParsedRoute[] {
  const routeGroups = groupRowsByRoute(data);
  const parsedRoutes: ParsedRoute[] = [];

  for (const [routeId, routeRows] of routeGroups) {
    const parsedRoute = parseRouteData(routeRows, routeId);
    parsedRoutes.push(parsedRoute);
  }

  return parsedRoutes;
}

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();
    
    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const allRoutes = parseAllRoutesFromCSV(data);
    const results = [];

    for (const parsed of allRoutes) {
      // 1. Create or find user first
     // Find existing user by name or create new one
        let user = await prisma.user.findFirst({
        where: { name: parsed.driver.name }
        });

        if (!user) {
        user = await prisma.user.create({
            data: {
            name: parsed.driver.name,
            role: 'DRIVER',
            },
        });
        }

      // 2. Create or find driver (linked to user via id)
      const driver = await prisma.driver.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id, // Use the user's id as the driver's id
          driver_status: 'AVAILABLE',
          emergency_contact: '',
          emergency_contact_phone: '',
          first_name: parsed.driver.name.split(' ')[0] || '',
          last_name: parsed.driver.name.split(' ').slice(1).join(' ') || '',
        },
      });

      // 3. Create or find truck
      const truck = await prisma.truck.upsert({
        where: { truck_number: parsed.truck.truck_number },
        update: {
          next_maintenance_date: parsed.truck.next_maintenance_date,
          next_admin_date: parsed.truck.next_admin_date,
          current_location: parsed.truck.current_location,
          truck_admin_designator: parsed.truck.truck_admin_designator,
        },
        create: parsed.truck,
      });

      // 4. Create or find trailer
      const trailer = await prisma.trailer.upsert({
        where: { trailer_number: parsed.trailer.trailer_number },
        update: {
          next_maintenance_date: parsed.trailer.next_maintenance_date,
          next_admin_date: parsed.trailer.next_admin_date,
          current_location: parsed.trailer.current_location,
          trailer_admin_designator: parsed.trailer.trailer_admin_designator,
          trailer_vessel_type: parsed.trailer.trailer_vessel_type,
        },
        create: parsed.trailer,
      });

      // 5. Create route
      const route = await prisma.route.create({
        data: {
          totalDistance: parsed.route.totalDistance,
          totalCost: parsed.route.totalCost,
          status: parsed.route.status,
          assigned_driver: driver.id,
          assigned_truck: truck.id,
          assigned_trailer: trailer.id,
        },
      });

      // 6. Create loads and link them to the route
      for (const loadData of parsed.loads) {
        const load = await prisma.load.create({
          data: {
            origin: loadData.origin,
            destination: loadData.destination,
            weight: loadData.weight,
            pick_up_by: loadData.pick_up_by,
            due_by: loadData.due_by,
            status: loadData.status,
            assigned_driver: driver.id,
            assigned_truck: truck.id,
            assigned_trailer: trailer.id,
          },
        });

        // 7. Create RouteLoad junction
        await prisma.routeLoad.create({
          data: {
            routeId: route.id,
            loadId: load.id,
            order: loadData.order,
          },
        });
      }

      results.push({ 
        routeId: route.id,
        driverId: driver.id,
        truckId: truck.id,
        trailerId: trailer.id,
        loadsCreated: parsed.loads.length
      });
    }

    return NextResponse.json({
      success: true,
      routesCreated: results.length,
      results
    });

  } catch (error) {
    console.error('Database upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload data to database', details: String(error) },
      { status: 500 }
    );
  }
}