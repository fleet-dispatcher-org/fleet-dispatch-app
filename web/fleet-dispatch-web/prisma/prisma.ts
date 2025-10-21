import { PrismaClient } from "@prisma/client";

let prisma: ReturnType<typeof prismaClientSingleton>;

const prismaClientSingleton = () => {
  // Create base client first
  const baseClient = new PrismaClient();
  
  const client = baseClient.$extends({
    query: {
      user: {
        create: async ({ args, query }) => {
          // Execute the original user creation
          const result = await query(args);
          
          try {
            // Use baseClient instead of client to avoid circular reference
            await baseClient.driver.create({
              data: {
                user: {
                  connect: {
                    id: result.id,
                  }
                },
                driver_status: 'AVAILABLE',
                emergency_contact: '',
                emergency_contact_phone: '',
                first_name: result.name?.split(' ')[0] || '',
                last_name: result.name?.split(' ').slice(1).join(' ') || '',
              }
            });
            
            console.log(`Driver automatically created for user: ${result.id}`);
          } catch (error: unknown) {
            console.error('Failed to create driver for user:', result.id, error);
            // Consider if you want this to fail silently or throw
          }
          
          return result;
        },
        
        createMany: async ({ args, query }) => {
          const result = await query(args);
          console.log('Bulk user creation - drivers need manual creation or iterate individually');
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

// Cache in development only
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;