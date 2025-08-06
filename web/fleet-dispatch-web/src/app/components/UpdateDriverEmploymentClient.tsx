"use client";
import { Availability_Status, Driver, Employment_Status } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
    driver: Driver;
}

export default function UpdateDriverEmploymentClient({ driver }: Props) {
    const router = useRouter();
    const [employmentStatus, setEmploymentStatus] = useState<Employment_Status>(driver.employment_status);

    const updateEmploymentStatus = async  (newStatus: Employment_Status ) => {
        try {
            const response = await fetch(`/api/driver/${driver.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ employment_status: newStatus }),
            })
            if (!response.ok) {
                throw new Error("Failed to update driver employment status");
            }
        } catch (error) {
            console.error("Error updating driver employment status:", error);
        }
        router.refresh();
    }


    return (
        <div>
            <select value="Current Employment Status" 
            onChange={(e) => updateEmploymentStatus(e.target.value as Employment_Status)}
            className="block w-full overflow-y-scroll rounded-md border-gray-300 text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm hover:underline"
            >
                <option value={Employment_Status.HIRED}>Hired</option>
                <option value={Employment_Status.SECONDARY_DUTY}>Secondary Duty</option>
                <option value={Employment_Status.SUSPENDED_WITH_PAY}>Suspended With Pay</option>
                <option value={Employment_Status.SUSPENDED_NO_PAY}>Suspended Without Pay</option>
                <option value={Employment_Status.TERMINATED}>Terminated</option>
                
            </select>
        </div>
    )
}
