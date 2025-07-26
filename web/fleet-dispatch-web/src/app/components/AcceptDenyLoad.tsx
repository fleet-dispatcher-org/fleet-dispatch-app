"use client";

interface AcceptDenyButtonsProps {
    loadId: string;
}

export default function AcceptDenyButtons({ loadId }: AcceptDenyButtonsProps) {
    const handleAccept = async (loadId: string) => {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: loadId,
                    status: "PENDING"
                })
            })
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to update load'}`);
            }
            // Optionally reload the page or redirect
            window.location.reload();
        } catch (err) {
            console.error('Error updating load:', err);
            alert('Failed to update load');
        }
    }

    const handleDeny = async (loadId: string) => {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: loadId,
                    status: "UNASSIGNED"
                })
            })
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to update load'}`);
            }
            // Optionally reload the page or redirect
            window.location.reload();
        } catch (err) {
            console.error('Error updating load:', err);
            alert('Failed to update load');
        }
    }

    return (
        <div className="flex gap-4 mb-4">
            <button 
                onClick={() => handleAccept(loadId)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                Accept
            </button>
            <button 
                onClick={() => handleDeny(loadId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                Deny
            </button>
        </div>
    );
}   