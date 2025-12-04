'use client';

import { Plus } from "lucide-react";
import { useState } from "react";
import Papa from "papaparse";
import { Driver, User } from "@prisma/client";
import { set } from "zod";

export default function BatchUploadHandler() {
    // State variables. At some point or another all of these will be used.
    const [file, setFile] = useState<File | undefined>(undefined);
    const [data, setData] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [columns, setColumns] = useState<string[][]>([]);
    const [values, setValues] = useState<string[][]>([]);
    const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
    const [userInfo, setUserInfo] = useState<any[]>([]);
    const [selecting, setSelecting] = useState<boolean>(false);
    const [userColumns, setUserColumns] = useState<string[]>([]);
    const [userOpen, setUserOpen] = useState<boolean>(false);
    const [truckOpen, setTruckOpen] = useState<boolean>(false);
    const [trailerOpen, setTrailerOpen] = useState<boolean>(false);
    const [columnMappings, setColumnMappings] = useState<{[key: string]: string}>({});
    const [columnToMap, setColumnToMap] = useState<string>('');
    const [expectedUserColumns, setExpectedUserColumns] = useState<string[]>(['name', 'email', 'current_location']); // [...olumns, ]
    const [expectedTruckColumns, setExpectedTruckColumns] = useState<string[]>(['license_plate', 'make', 'model', 'year', 
        'current_location', 'next_maintenance_date', 'next_admin_date', 'truck_admin_designator']);
    const [expectedTrailerColumns, setExpectedTrailerColumns] = useState<string[]>(['trailer_number', 'type', 'capacity', 'current_location', 
        'next_maintenance_date', 'next_admin_date', 'trailer_admin_designator']);
    
    // Handles file submission and is sentinel for opening the data preview modal.
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

    // Handles file input change event. This sends the file to state.
    async function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement & { files: FileList | null };
        // const display = target.getAttribute("className")
        // console.log(target.files);
        setFile(target.files ? target.files[0] : undefined);
    }

    // Handles cell click event. Basically sends the position of the cell to state for editing.
    async function handleCellClick(rowIndex: number, colIndex: number) {
        if (!selecting) {
            setEditingCell({ row: rowIndex, col: colIndex });
        }
        else {
            return null;
        }
    }

    // Handles cell change event. This stores teh new value in its original position.
    async function handleCellChange(rowIndex: number, colIndex: number, newValue: string) {
        const newValues = [...values];
        newValues[rowIndex][colIndex] = newValue;
        setValues(newValues);
    }

    // This andles the column change event. When selecting a column to map, it will update the selected column with the mapped value.
    // It will also remove the mapped value from the expected columns list.
    // It updates the columns state with the new mapping.
    async function handleColumnChange(colIndex: number) {
        if (selecting) {
            const newColumns = [...columns];
            newColumns[0][colIndex] = columnToMap;
            if (expectedUserColumns.includes(columnToMap)) {
                setExpectedUserColumns(expectedUserColumns.filter(col => col !== columnToMap));
            }
            else if (expectedTruckColumns.includes(columnToMap)) {
                setExpectedTruckColumns(expectedTruckColumns.filter(col => col !== columnToMap));
            }
            else if (expectedTrailerColumns.includes(columnToMap)) {
                setExpectedTrailerColumns(expectedTrailerColumns.filter(col => col !== columnToMap));
            }
            setColumns(newColumns);
            setSelecting(false);
            setColumnToMap('');
        }
        else {
            return null;
        }
        
    }

    // Handles the column to map change event. Looks through expected columns and closes the appropriate modal.
    async function handleColumnToMapChange(e: React.MouseEvent<HTMLDivElement>) {
        const newValue = e.currentTarget.textContent.toLocaleLowerCase() || ''; 
        if (expectedTruckColumns.includes(newValue)) {
            setTruckOpen(false);
        } else if (expectedUserColumns.includes(newValue)) {
            setUserOpen(false);
        } else if (expectedTrailerColumns.includes(newValue)) {
            setTrailerOpen(false);
        }
        setColumnToMap(newValue);
    }

    // Handles the cell blur event. This sets the editing cell to null.
    async function handleCellBlur() {
        setEditingCell(null);
    }

    // Handles the key down event. This sets the editing cell to null.
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

    async function selectInfo(e: React.MouseEvent<HTMLButtonElement>) {
        setSelecting(true);
        const value = e.currentTarget.textContent
        console.log(value);
        switch (value) {
            case "Drivers":
                setUserOpen(true);
                break;
            case "Trucks":
                setTruckOpen(true);
                break;
            case "Trailers":
                setTrailerOpen(true);
                break;
            default:
                break;
         }
    }

    function toTitleCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
                
                <div className="flex flex-row items-center justify-center space-x-3 mb-8">
                    <div className="flex flex-col items-center gap-4 justify-center">
                        <label htmlFor="batch" className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white hover:cursor-pointer p-6 rounded-lg font-semibold text-xl transition-colors duration-300 flex items-center justify-center mx-auto"> <Plus size={32} /></label>
                        <input type="file" accept=".csv" name="batch" id="batch" onChange={handleOnChange} className="hidden" />
                        <span className="text-gray-400 italic text-sm"> {file ? `File selected: ${file.name}` : ""}</span>
                        <button onClick={handleOnSubmit} hidden={!file} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4">
                            View
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
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium cursor-pointer"
                            >
                                Verify Info &rarr;
                            </button>
                            <h4 className="text-lg font-semibold text-gray-300 mb-4 cursor-pointer" onClick={() => {
                                setIsOpen(false)
                                setSelecting(false);
                                setEditingCell(null);
                                }}>X</h4>
                        </div>
                    </div>
                    <div className="overflow-scroll max-h-[80vh] max-w-full" onClick={(e) => e.stopPropagation()}>
                        <table className="min-w-full bg-gray-900 border border-gray-700 scroll-auto">
                            <thead>
                                <tr>
                                    {columns[0] && columns[0].map((col, index) => (
                                        <th key={index} className={`px-4 py-2 border-b border-gray-700 text-left text-gray-400 ${selecting ? 'cursor-pointer' : ''}`} onClick={() => handleColumnChange(index)}>{col}</th>
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
                    <span className="mt-4 italic">The following tables need to be mapped:</span>
                    <div className="flex flex-row justify-beginning mt-4 gap-4">
                        {expectedUserColumns.length > 0 && (
                            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium cursor-pointer" onClick={selectInfo}>Drivers</button>
                        )
                        }
                        {expectedTruckColumns.length > 0 && (
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium cursor-pointer" onClick={selectInfo}>Trucks</button>
                        )}
                        {expectedTrailerColumns.length > 0 && (
                            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium cursor-pointer" onClick={selectInfo}>Trailers</button>
                        )}                                                
                    </div>
                    {userOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-3xl w-full">
                                <div className="flex flex-row justify-between items-center mb-4">
                                    <h4 className="text-lg font-semibold text-gray-300 mb-4">Select Column to Map</h4>
                                    <h4 className="text-lg font-semibold text-gray-300 mb-4 cursor-pointer" onClick={() => setUserOpen(false)}>X</h4>
                                </div>
                                <div>
                                    {expectedUserColumns.map((column, index) => (
                                        <div key={index} className="text-gray-400 py-2 cursor-pointer hover:bg-gray-800 px-4 rounded mb-2" onClick={handleColumnToMapChange}>
                                            {toTitleCase(column)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {truckOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-3xl w-full">
                                <div className="flex flex-row justify-between items-center mb-4">
                                    <h4 className="text-lg font-semibold text-gray-300 mb-4">Select Column to Map</h4>
                                    <h4 className="text-lg font-semibold text-gray-300 mb-4 cursor-pointer" onClick={() => setTruckOpen(false)}>X</h4>
                                </div>
                                <div>
                                    {expectedTruckColumns.map((column, index) => (
                                        <div key={index} className="text-gray-400 py-2 cursor-pointer hover:bg-gray-800 px-4 rounded mb-2" onClick={handleColumnToMapChange}>
                                            {toTitleCase(column)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {trailerOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-3xl w-full">
                                <div className="flex flex-row justify-between items-center mb-4">
                                    <h4 className="text-lg font-semibold text-gray-300 mb-4">Select Column to Map</h4>
                                    <h4 className="text-lg font-semibold text-gray-300 mb-4 cursor-pointer" onClick={() => setTrailerOpen(false)}>X</h4>
                                </div>
                                <div>
                                    {expectedTrailerColumns.map((column, index) => (
                                        <div key={index} className="text-gray-400 py-2 cursor-pointer hover:bg-gray-800 px-4 rounded mb-2" onClick={handleColumnToMapChange}>
                                            {toTitleCase(column)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
            )}
        </div>
    )
}