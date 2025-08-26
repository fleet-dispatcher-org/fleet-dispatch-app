'use client'
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { Load } from "@prisma/client";
import Link from 'next/link';
import { createId } from '@paralleldrive/cuid2';
import { X, Plus, Loader2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface DateProps {
    range: DateRange | undefined
}

export default function TimeOffModal({range}: DateProps) {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState({type: '', message: ''});
    const [formData, setFormData] = useState({
        timeOffStart: new Date(),
        timeOffEnd: new Date(),
        reason: '',
        status: 'PENDING',
    });

    // Update form data when range changes
    useEffect(() => {
        if (range?.from && range?.to) {
            setFormData(prev => ({
                ...prev,
                timeOffStart: range.from!,
                timeOffEnd: range.to!
            }));
        }
    }, [range]);

    const openModal = () => {
        setOpen(true);
        document.body.style.overflow = 'hidden';
    };
    
    const closeModal = () => { 
        document.body.style.overflow = 'auto';
        setOpen(false);
        resetForm();
    };
    
    const resetForm = () => {
        setFormData({
            timeOffStart: new Date(),
            timeOffEnd: new Date(),
            reason: '',
            status: 'PENDING',
        });
        setMessage({type: '', message: ''});
        setLoading(false);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value // This was missing!
        });
    }

    const handleAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value // This was missing!
        });
    }

    const createRequest = async function(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setLoading(true);
    
        try {
            const response = await fetch('/api/timeoff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...formData, requesting_user: session?.user?.id}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            setMessage({type: 'success', message: 'Request submitted successfully!'});
        } catch (err) {
            console.error("Error submitting request:", err);
            setMessage({type: 'error', message: 'Error submitting request'});
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button onClick={openModal} className="btn btn-primary border rounded-lg border-gray-700 p-3 hover:bg-gray-700 hover:cursor-pointer">Request Time Off</button>
            {open && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}
                >
                    {/* Modal Content */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-900 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 15h6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-400">Request Time Off</h3>
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
                                {/* Reason Field */}
                                <div>
                                    <label htmlFor="reason" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Reason *
                                    </label>
                                    <textarea
                                        id="reason"
                                        name="reason"
                                        rows={4}
                                        value={formData.reason}
                                        onChange={handleAreaChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-600 transition-all duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                        placeholder="Enter reason for time off request"
                                    />
                                </div>

                                {/* Start Date Field */}
                                <div>
                                    <label htmlFor="start_date" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Start Date *
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg">
                                        {range?.from?.toLocaleDateString() || 'No date selected'}
                                    </div>
                                </div>

                                {/* End Date Field */}
                                <div>
                                    <label htmlFor="end_date" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        End Date *
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg">
                                        {range?.to?.toLocaleDateString() || 'No date selected'}
                                    </div>
                                </div>

                                {/* Status Field */}
                                <div>
                                    <label htmlFor="status" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Status
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg">
                                        {formData.status}
                                    </div>
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
                                        onClick={createRequest}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Request'
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
}