import Link from 'next/link';
import { Load } from "@prisma/client";

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
            <h2 className="text-2xl font-bold mb-4 text-white">Your Loads</h2>
            {loads.length === 0 ? (
                <p className="text-gray-300">No loads found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-600">
                        <thead>
                            <tr className="bg-gray-800">
                                <th className="border border-gray-600 px-4 py-2 text-left text-white">Origin</th>
                                <th className="border border-gray-600 px-4 py-2 text-left text-white">Destination</th>
                                <th className="border border-gray-600 px-4 py-2 text-left text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loads.map((load) => (
                                <tr key={load.id} className="hover:bg-gray-800">
                                    <td className="border border-gray-600 px-4 py-2 text-gray-300">{load.origin}</td>
                                    <td className="border border-gray-600 px-4 py-2 text-gray-300">{load.destination}</td>
                                    <td className="border border-gray-600 px-4 py-2">
                                        <Link 
                                            href={`/loads/${load.id}`} 
                                            className="text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
)
}