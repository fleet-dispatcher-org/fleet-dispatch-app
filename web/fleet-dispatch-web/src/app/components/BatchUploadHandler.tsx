'use client';

import { Plus } from "lucide-react";
import { useState } from "react";
import Papa from "papaparse";

export default function BatchUploadHandler() {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Handles file submission
    async function handleOnSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!file) {
            setError("No file selected");
            setLoading(false);
            return;
        }

        // Parse the CSV file
        Papa.parse(file, {
            header: true,
            complete: async function(results: any) {     
                console.log("Parsed data:", results.data);
                
                try {
                    // Send parsed data to API route
                    const response = await fetch('/api/batch-upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ data: results.data }),
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setSuccess(`Successfully uploaded ${result.routesCreated} routes!`);
                        console.log("Upload successful:", result);
                    } else {
                        setError(result.error || 'Failed to upload data');
                        console.error("Upload failed:", result);
                    }
                } catch (err) {
                    setError('Network error: Failed to connect to server');
                    console.error("Network error:", err);
                } finally {
                    setLoading(false);
                }
            },
            error: function(error: any) {
                setError(`Failed to parse CSV: ${error.message}`);
                setLoading(false);
            }
        });
    }

    // Handles file input change event
    function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement & { files: FileList | null };
        setFile(target.files ? target.files[0] : undefined);
        setError(null);
        setSuccess(null);
    }
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Upload a CSV File</h3>
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-4 bg-green-900/50 border border-green-700 rounded text-green-200">
                        {success}
                    </div>
                )}
                
                <div className="flex flex-row items-center justify-center space-x-3 mb-8">
                    <div className="flex flex-col items-center gap-4 justify-center">
                        <label 
                            htmlFor="batch" 
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white hover:cursor-pointer p-6 rounded-lg font-semibold text-xl transition-colors duration-300 flex items-center justify-center mx-auto"
                        >
                            <Plus size={32} />
                        </label>
                        <input 
                            type="file" 
                            accept=".csv" 
                            name="batch" 
                            id="batch" 
                            onChange={handleOnChange} 
                            className="hidden"
                            disabled={loading}
                        />
                        <span className="text-gray-400 italic text-sm">
                            {file ? `File selected: ${file.name}` : ""}
                        </span>
                        <button 
                            onClick={handleOnSubmit} 
                            hidden={!file} 
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4 hover:cursor-pointer transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Uploading...' : 'Submit'}
                        </button>
                    </div>
                </div>    
            </div>
        </div>
    )
}