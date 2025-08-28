import { PrismaClient } from "@prisma/client";

let prisma: ReturnType<typeof prismaClientSingleton>;

const prismaClientSingleton = () => {
  const client = new PrismaClient().$extends({
    query: {
      user: {
        create: async ({ args, query }) => {
          // Execute the original user creation
          const result = await query(args);
          
          try {
            // Create driver after user is created
            await client.driver.create({
              data: {
                user: {
                  connect: {
                    id: result.id,
                    
                    
                  }
                },
                // Add required and default driver fields here
                driver_status: 'AVAILABLE',
                emergency_contact: '', // or null if nullable
                emergency_contact_phone: '', // or null if nullable
                // Add other required fields as needed based on your schema
                first_name: result.name?.split(' ')[0] || '',
                last_name: result.name?.split(' ')[1] || '',
                
                // phone_number: null,
                // license_number: null,
                // hire_date: new Date(),
                // Add any other required fields from your Driver model
              }
            });
            
            console.log(`Driver automatically created for user: ${result.id}`);
          } catch (error: unknown) {
            console.error('Failed to create driver for user:', result.id, error);
            // Decide if you want to throw here or just log the error
            // throw error; // Uncomment if you want to fail the user creation
          }
          
          return result;
        },
        
        createMany: async ({ args, query }) => {
          const result = await query(args);
          
          // Note: createMany doesn't return the created records by default
          // You might need to handle this differently if you use createMany
          console.log('Bulk user creation - drivers may need to be created manually');
          
          return result;
        }
      }
    }
  });
  
  return client;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Only cache in development to avoid memory leaks in production
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;