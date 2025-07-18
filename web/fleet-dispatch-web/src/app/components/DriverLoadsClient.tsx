import Link from 'next/link';
import { Load, User } from "@prisma/client";

interface Props {
    loads: Load[] | null;
}

export default function DriverLoads({loads} : Props) {
    
    if (!loads) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                    <h2 className="text-2xl font-bold mb-4">Your Loads</h2>
                    <p>No loads found.</p>
                </div>
            </div>
        );
    } 
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                <h2 className="text-2xl font-bold mb-4">Your Loads</h2>
                {loads.length === 0 ? (
                    <p>No loads found.</p>
                ) : (
                    <ul>
                        {loads.map((load) => (
                            <li key={load.id} className="mb-2">
                                <Link href={`/loads/${load.id}`} className="text-blue-600 hover:underline">
                                    {load.origin} - {load.destination}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}