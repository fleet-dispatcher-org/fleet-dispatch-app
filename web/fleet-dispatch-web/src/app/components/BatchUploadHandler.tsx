'use client';

import { Plus } from "lucide-react";
import { useState } from "react";
import Papa from "papaparse";
import { set } from "zod";
import { send } from "process";

export default function BatchUploadHandler() {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [data, setData] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [columns, setColumns] = useState<string[][]>([]);
    const [values, setValues] = useState<string[][]>([]);
    const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
    
    async function handleOnSubmit(e: React.SyntheticEvent) {
        e.preventDefault();

        console.log("Submitting file:", file);

        if (!file) {
            console.error("No file selected");
            return;
        }

        if (file) {
            Papa.parse(file, {
                header: true,
                complete: function(results: any, file: File) {
                    const newColumns = [];
                    const newValues: ((prevState: string[][]) => string[][]) | unknown[][] = [];
                    console.log("Parsing complete:", results);
                    setData(results.data);
                    console.log("Results Data:", results.data);
                    results.data[0] && newColumns.push(Object.keys(results.data[0]));
                    setColumns(newColumns);
                    results.data.map((row: any) => {
                        newValues.push(Object.values(row));
                    });
                    setValues(newValues as string[][]);
                }
            });
            console.log("Parsed Data:", data);
            setIsOpen(true);
            setLoading(false);

            console.log("Columns:", columns);
            console.log("Values:", values);
        }

    }

    async function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement & { files: FileList | null };

        // console.log(target.files);

        setFile(target.files ? target.files[0] : undefined);
    }

    async function handleCellClick(rowIndex: number, colIndex: number) {
        setEditingCell({ row: rowIndex, col: colIndex });
    }

    async function handleCellChange(rowIndex: number, colIndex: number, newValue: string) {
        const newValues = [...values];
        newValues[rowIndex][colIndex] = newValue;
        setValues(newValues);
    }

    async function handleCellBlur() {
        setEditingCell(null);
    }

    async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) {
        if (e.key === 'Enter') {
            setEditingCell(null);
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    }

    async function sendToDatabase() {
        // Implement database sending logic here
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
                
                <div className="flex flex-col items-center justify-center space-x-3 mb-8">
                    <div>
                        <label htmlFor="batch" className="cursor-pointer"> <Plus size={32} /></label>
                        <input type="file" accept=".csv" name="batch" id="batch" onChange={handleOnChange}></input>
                        <button onClick={handleOnSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4">
                            Upload
                        </button>
                    </div>
                </div>
                
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 items-center justify-center p-4">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-300 mb-4">Parsed CSV Data Preview (Click cells to edit)</h4>
                        <div className="flex gap-4">
                            <button 
                                onClick={sendToDatabase}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                            >
                                Save info
                            </button>
                            <h4 className="text-lg font-semibold text-gray-300 mb-4 cursor-pointer" onClick={() => setIsOpen(false)}>X</h4>
                        </div>
                    </div>
                    <div className="overflow-scroll max-h-[80vh] max-w-full" onClick={(e) => e.stopPropagation()}>
                        <table className="min-w-full bg-gray-900 border border-gray-700 scroll-auto">
                            <thead>
                                <tr>
                                    {columns[0] && columns[0].map((col, index) => (
                                        <th key={index} className="px-4 py-2 border-b border-gray-700 text-left text-gray-400">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {values.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-800">
                                        {row.map((cell, colIndex) => (
                                            <td 
                                                key={colIndex} 
                                                className="px-4 py-2 border-b border-gray-700 text-left text-gray-400 cursor-pointer"
                                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                            >
                                                {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                                                    <input
                                                        type="text"
                                                        value={cell}
                                                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                        onBlur={handleCellBlur}
                                                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                                        autoFocus
                                                        className="w-full bg-gray-800 text-gray-200 px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="hover:bg-gray-700 px-2 py-1 rounded block">{cell}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}