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
            ...formData
        });
    }

    const handleAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData
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
            <button onClick={openModal} className="btn btn-primary">Request Time Off</button>
            {open && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-5xl">
                        <h3 className="font-bold text-lg">Request Time Off</h3>
                        <div className="modal-action">
                            <button onClick={closeModal} className="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="label">
                                    <span className="label-text">Reason</span>
                                </label>
                                <textarea rows={4} placeholder="Reason" className="input input-bordered w-full" name="reason" value={formData.reason} onChange={handleAreaChange} />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text">Start Date</span>
                                </label>
                                <p>{range?.from?.toISOString().split('T')[0]}</p>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text">End Date</span>
                                </label>
                                <p>{range?.to?.toISOString().split('T')[0]}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="label">
                                    <span className="label-text">Status</span>
                                </label>
                                <p>{formData.status}</p>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button onClick={createRequest} className="btn btn-primary">Submit</button>
                            <button onClick={closeModal} className="btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}