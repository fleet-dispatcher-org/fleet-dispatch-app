"use client";
import { useSession } from 'next-auth/react';
import { useState } from 'react';


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

export const useCityState = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
  });
  const { data: session } = useSession();

  const expandState = (abbreviation: string): string => {
  const abbreviationToState: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming'
  };
  
  return abbreviationToState[abbreviation] || abbreviation;
};

  const getCoordinates = async (value: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    try {
        
        const city = value.split(",")[0];
        const state = value.split(",")[1];
        
        const coordinatesResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}+${expandState(state)}&format=json`);
        const coordinates = await coordinatesResponse.json();
        const latitude = coordinates[0].lat;
        const longitude = coordinates[0].lon;
        const accuracy = coordinates[0].accuracy;
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          location: { latitude, longitude, city, state, country: coordinates[0].country, accuracy },
        }));

        const locationData = {
          latitude,
          longitude,
          city,
          state,
          country: coordinates[0].country,
          accuracy,
        };

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
      
  } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  };

  const setNewCoordinates = async (value: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const city = value.split(",")[0];
    const state = value.split(",")[1];

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }
    
    const coordinatesResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}+${expandState(state)}&format=json`);
    const coordinates = await coordinatesResponse.json();
    const latitude = coordinates[0].lat;
    const longitude = coordinates[0].lon;
    // const accuracy = coordinates[0].accuracy;

    return { lat: latitude, long: longitude };

  }
  return { state, getCoordinates, setNewCoordinates };
}