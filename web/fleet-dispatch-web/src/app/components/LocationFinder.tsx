"use client";
import React from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import Button from "./Button";

const LocationFinder: React.FC = () => {
    const { loading, error, getLocation } = useGeolocation();

    return (<div>
        <Button type="hollow" onClick={getLocation} disabled={loading} className="border border-gray-300 rounded-md p-3 hover:cursor-pointer">
            {loading ? "Loading..." : `Find my location ` }
           &rarr;
        </Button>
        { error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>)
}

export default LocationFinder