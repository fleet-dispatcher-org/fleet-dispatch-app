'use client';

import { Plus } from "lucide-react";
import { useState } from "react";
import Papa from "papaparse";
import { set } from "zod";

export default function BatchUploadHandler() {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [data, setData] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [columns, setColumns] = useState<string[][]>([]);
    const [values, setValues] = useState<string[][]>([]);
    
    async function handleOnSubmit(e: React.SyntheticEvent) {
        e.preventDefault();

    }

    async function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement & { files: FileList | null };

        setFile(target.files ? target.files[0] : undefined);

        if (target.files && target.files[0]) {
            Papa.parse(target.files[0], {
                header: true,
                complete: function(results: { data: any; }) {
                    const columns = [];
                    const values = [];
                    setData(results.data);

                    results.data.map((row: any) => {
                        columns.push(Object.keys(row));
                        values.push(Object.values(row));
                    });
                }
            });

            setData(data);
            setIsOpen(true);
            setLoading(false);
            setColumns(columns);
            setValues(values);
        }
    }
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Main Container */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Upload a CSV File</h3>
                </div>
                <input type="file" accept=".csv" name="batch" onChange={handleOnChange}></input>
            </div>
        </div>
    )
}