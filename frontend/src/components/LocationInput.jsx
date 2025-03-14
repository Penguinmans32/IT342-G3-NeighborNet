import { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { MdMyLocation, MdLocationOn } from 'react-icons/md';

const LocationInput = ({ value, onChange }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'], // Add this
  });

  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [coordinates, setCoordinates] = useState({
    lat: 10.3157,
    lng: 123.8854
  });
  const [address, setAddress] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);

  const onLoad = useCallback((map) => {
    setMap(map);
    // Initialize geocoder
    if (window.google) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setGeocoder(null);
  }, []);

  // Updated to use Maps JavaScript API Geocoder
  const handleAddressSubmit = async () => {
    if (!address.trim() || !geocoder) return;
    
    setIsLoading(true);
    try {
      const result = await geocoder.geocode({
        address: address,
        componentRestrictions: { country: 'PH' },
        region: 'PH'
      });

      if (result.results && result.results[0]) {
        const location = {
          lat: result.results[0].geometry.location.lat(),
          lng: result.results[0].geometry.location.lng(),
          address: result.results[0].formatted_address
        };
        
        console.log('Location found:', location);
        
        setCoordinates({ 
          lat: location.lat, 
          lng: location.lng 
        });
        setAddress(location.address);
        onChange(location);
        
        if (map) {
          map.panTo({ lat: location.lat, lng: location.lng });
          map.setZoom(15);
        }
      } else {
        alert('Location not found. Please try a more specific address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('Error finding location. Please try a different address.');
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to use Maps JavaScript API Geocoder
  const getCurrentLocation = () => {
    if (navigator.geolocation && geocoder) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const result = await geocoder.geocode({
              location: { lat: latitude, lng: longitude }
            });

            if (result.results && result.results[0]) {
              const location = {
                lat: latitude,
                lng: longitude,
                address: result.results[0].formatted_address
              };
              setCoordinates({ lat: latitude, lng: longitude });
              setAddress(result.results[0].formatted_address);
              onChange(location);
              
              if (map) {
                map.panTo({ lat: latitude, lng: longitude });
                map.setZoom(15);
              }
            }
          } catch (error) {
            console.error('Error getting address:', error);
            alert('Error getting current location. Please try entering address manually.');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error getting current location. Please try entering address manually.');
          setIsLoading(false);
        }
      );
    }
  };

  if (loadError) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-xl">
        Error loading maps. Please try again later.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 border border-blue-300 bg-blue-50 rounded-xl">
        Loading maps...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSubmit()}
              placeholder="Enter location (e.g., SM City Cebu)"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       outline-none transition-all"
            />
            <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="button"
            onClick={handleAddressSubmit}
            disabled={isLoading || !address.trim()}
            className={`px-4 py-2 rounded-xl font-medium transition-all
              ${isLoading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {isLoading ? 'Setting...' : 'Set Location'}
          </button>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className={`p-2 rounded-xl transition-all
              ${isLoading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            <MdMyLocation className="text-xl" />
          </button>
        </div>
      </div>

      <div className="h-[300px] rounded-xl overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={coordinates}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          }}
        >
          <Marker
            position={coordinates}
            title="Selected Location"
          />
        </GoogleMap>
      </div>
    </div>
  );
};

export default LocationInput;