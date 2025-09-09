'use client'
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { Load } from "@prisma/client";
import Link from 'next/link';
import { createId } from '@paralleldrive/cuid2';
import { X, Plus, Loader2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useCityState } from '../hooks/useCityState';
import { get } from 'http';

export default function CreateLoadCard() {
    const { data: session, status } = useSession()
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState({type: '', message: ''});
    const { setNewCoordinates } = useCityState();
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        due_by: new Date(),
        weight: 0,
        assigned_fleet: '',
    });

    // DatePicker state
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const datePickerRef = useRef<HTMLDivElement>(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Set default fleet value when session loads
    useEffect(() => {
        if (session?.user?.assigned_fleet && formData.assigned_fleet === '') {
            setFormData(prev => ({
                ...prev,
                assigned_fleet: session.user.assigned_fleet || ''
            }));
        }
    }, [session?.user?.assigned_fleet, formData.assigned_fleet]);

    const openModal = () => {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };
    
    const closeModal = () => { 
        document.body.style.overflow = 'auto';
        setIsOpen(false);
        setIsDatePickerOpen(false);
    };
    
    const resetForm = () => {
        setFormData({
            origin: '',
            destination: '',
            due_by: new Date(),
            weight: 0,
            assigned_fleet: session?.user?.assigned_fleet || '', // Reset to default
        });
        setMessage({type: '', message: ''});
        setLoading(false);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'weight' ? Number(value) : value,
        });
    }

    // DatePicker functions
    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const handleDateSelect = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        setFormData(prev => ({
            ...prev,
            due_by: date
        }));
        setIsDatePickerOpen(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const renderCalendarDays = () => {
        const days = [];
        const daysCount = daysInMonth(currentMonth, currentYear);
        const startingDay = firstDayOfMonth(currentMonth, currentYear);
        const today = new Date();
        const selectedDate = formData.due_by;

        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysCount; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isSelected = selectedDate && 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === currentMonth && 
                selectedDate.getFullYear() === currentYear;
            const isToday = today.getDate() === day && 
                today.getMonth() === currentMonth && 
                today.getFullYear() === currentYear;
            
            days.push(
                <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`p-2 text-sm rounded hover:bg-gray-600 transition-colors ${
                        isSelected 
                            ? 'bg-gray-600 text-white' 
                            : isToday 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'text-gray-300'
                    }`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function createLoad(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        if(!formData.origin || !formData.destination || !formData.due_by || !formData.weight || !formData.assigned_fleet) {
            setMessage({type: 'error', message: 'All fields are required'});
            return;
        }

        setMessage({type: '', message: ''});
        
        try {
            setLoading(true);
            
            const response = await fetch('/api/dispatcher/loads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: createId(),
                    origin: formData.origin,
                    destination: formData.destination,
                    due_by: formData.due_by,
                    weight: formData.weight,
                    // Only connect fleet if ID is provided and not empty
                    ...(formData.assigned_fleet && formData.assigned_fleet.trim() !== '' && {
                        fleet: {
                            connect: { id: formData.assigned_fleet }
                        }
                    }),
                    origin_coordinates: await setNewCoordinates(formData.origin),
                    destination_coordinates: await setNewCoordinates(formData.destination),
                    status: "UNASSIGNED",
                    createdAt: new Date(),
                })
            })
            
            if (!response.ok) {
                throw new Error('Failed to create load');
            }
            
            const data = await response.json();
            console.log("Load created:", data);

            setMessage({type: 'success', message: 'Load created successfully'});

            setTimeout(() => {
                setMessage({type: '', message: ''});
                closeModal();
            }, 2000);

            resetForm();
            
        } catch (err) {
            setMessage({type: 'error', message: err instanceof Error ? err.message : 'Unknown error'});
        } finally {
            setLoading(false);
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
                    <h3 className="text-xl font-bold text-gray-400">Create New Load</h3>
                </div>
                <button
                    onClick={openModal}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white hover:cursor-pointer p-6 rounded-lg font-semibold text-xl transition-colors duration-300 flex items-center justify-center mx-auto"
                >
                    <Plus size={32} />
                </button>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}
                >
                    {/* Modal Content */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-400">Create New Load</h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-300 transition-colors"
                                disabled={loading}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Origin Field */}
                                <div>
                                    <label htmlFor="origin" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Origin *
                                    </label>
                                    <input
                                        type="text"
                                        id="origin"
                                        name="origin"
                                        value={formData.origin}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-600 transition-all duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                        placeholder="Enter origin location"
                                    />
                                </div>

                                {/* Destination Field */}
                                <div>
                                    <label htmlFor="destination" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Destination *
                                    </label>
                                    <input
                                        type="text"
                                        id="destination"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-600 transition-all duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                        placeholder="Enter destination location"
                                    />
                                </div>

                                {/* Weight Field */}
                                <div>
                                    <label htmlFor="weight" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Weight (lbs) *
                                    </label>
                                    <input
                                        type="number"
                                        id="weight"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="1"
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-600 transition-all duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                        placeholder="Enter weight in pounds"
                                    />
                                </div>

                                {/* Fleet Field - Fixed */}
                                <div>
                                    <label htmlFor="assigned_fleet" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Assigned Fleet *
                                    </label>
                                    <input
                                        type="text"
                                        id="assigned_fleet"
                                        name="assigned_fleet"
                                        value={formData.assigned_fleet}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-600 transition-all duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                        placeholder="Enter fleet assignment"
                                    />
                                </div>

                                {/* Custom DatePicker Field */}
                                <div className="relative" ref={datePickerRef}>
                                    <label htmlFor="due_by" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Due By *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="due_by"
                                            value={formData.due_by ? formData.due_by.toLocaleDateString() : ''}
                                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                            readOnly
                                            placeholder="Select a date"
                                            disabled={loading}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-600 transition-all duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed cursor-pointer"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    {isDatePickerOpen && (
                                        <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                                            {/* Header */}
                                            <div className="flex items-center justify-between p-4 border-b border-gray-600">
                                                <button
                                                    onClick={() => navigateMonth('prev')}
                                                    className="p-1 hover:bg-gray-600 rounded"
                                                    type="button"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                <span className="font-medium text-gray-300">
                                                    {months[currentMonth]} {currentYear}
                                                </span>
                                                <button
                                                    onClick={() => navigateMonth('next')}
                                                    className="p-1 hover:bg-gray-600 rounded"
                                                    type="button"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Days of week */}
                                            <div className="grid grid-cols-7 border-b border-gray-600">
                                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                    <div key={day} className="p-2 text-center text-xs font-medium text-gray-400">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar grid */}
                                            <div className="grid grid-cols-7 p-2">
                                                {renderCalendarDays()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Message Display */}
                                {message.message && (
                                    <div className={`flex items-center gap-2 p-4 rounded-lg border ${
                                        message.type === 'success' 
                                            ? 'bg-green-900 text-green-300 border-green-700' 
                                            : 'bg-red-900 text-red-300 border-red-700'
                                    }`}>
                                        {message.type === 'success' ? (
                                            <CheckCircle size={20} className="text-green-400" />
                                        ) : (
                                            <AlertCircle size={20} className="text-red-400" />
                                        )}
                                        <span className="font-medium">{message.message}</span>
                                    </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createLoad}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={20} />
                                                Create Load
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};