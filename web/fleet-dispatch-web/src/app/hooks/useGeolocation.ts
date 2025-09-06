"use client";
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  accuracy: number;
}

interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
  });
const { data: session } = useSession();

  const getLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser.'
      }));
      return;
    }

    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Reverse geocoding using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude as number}&lon=${longitude as number}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      const address = data.address || {};

      const locationData: LocationData = {
        latitude,
        longitude,
        city: address.city || address.town || address.village || 'Unknown',
        state: address.state || 'Unknown',
        country: address.country || 'Unknown',
        accuracy: accuracy || 0,
      };

      setState({
        location: locationData,
        loading: false,
        error: null,
      });

      const updateLocation = await fetch(`/api/dispatcher/drivers/${session?.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_coordinates: [{
            lat: locationData.latitude,
            long: locationData.longitude
          }],
          current_location: `${locationData.city}, ${locationData.state}`
        }),
      });

      if (!updateLocation.ok) {
        throw new Error('Failed to update location');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to get location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied by user';
      } else if (error.code === 2) {
        errorMessage = 'Location information is unavailable';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out';
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  return {
    ...state,
    getLocation,
  };
};