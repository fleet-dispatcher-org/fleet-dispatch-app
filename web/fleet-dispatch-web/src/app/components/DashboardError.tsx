import { error } from "console";

interface DashboardErrorProps {
    error: string
    onclick: Promise<void>
}

export default async function DashboardError(error: string, onclick: Promise<void>) {
    return (
        <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Error loading dashboard: {error}</strong>
                    </div>
                    <button 
                        onClick={() => onclick}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
    )
}