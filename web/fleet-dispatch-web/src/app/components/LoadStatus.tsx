import { Load } from "@prisma/client";

interface miniLoadProps {
    load: Load
}

export default async function LoadStatus({ load }: miniLoadProps) {
    async function updateLoadStatus(loadId: string, status: string) {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (!response.ok) {
                throw new Error('Failed to update load status');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating load status:', error);
            return null;
        }
    }
    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Status
                </h3>
                <select 
                name="status" 
                value={load.status}
                className='text-sm border-gray-300 rounded-md 
                focus:ring-blue-500 focus:border-blue-500 
                disabled:opacity-50 disabled:cursor-not-allowed'
                onChange={(e) => updateLoadStatus(load.id, e.target.value)}>
                    <option value="PENDING">Pending</option>
                    <option value="IN PROGRESS">In Progress</option>
                    <option value="TERMINATED">Terminated</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>
        </div>
    )
}