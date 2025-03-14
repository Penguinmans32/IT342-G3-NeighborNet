import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { MdMyLocation, MdLocationOn } from 'react-icons/md';

const LocationInput = ({ value, onChange }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [coordinates, setCoordinates] = useState({
    lat: 10.3157,
    lng: 123.8854
  });
  const [address, setAddress] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const onLoad = useCallback((map) => {
    setMap(map);
    setIsMapReady(true);
    if (window.google) {
      setGeocoder(new window.google.maps.Geocoder());
      // Set initial position
      map.setCenter(coordinates);
      map.setZoom(15);
    }
  }, [coordinates]);


  useEffect(() => {
    if (isMapReady && coordinates) {
      console.log('Map is ready and coordinates are set:', {
        lat: coordinates.lat,
        lng: coordinates.lng,
        mapCenter: map?.getCenter()?.toJSON(),
        zoom: map?.getZoom()
      });
    }
  }, [isMapReady, coordinates, map]);

  const onUnmount = useCallback(() => {
    setMap(null);
    setGeocoder(null);
  }, []);

  // Handle address submission
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

  // Get current location
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

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  const markerOptions = {
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null,
    },
    zIndex: 1000,
    visible: true,
    optimized: false,
    draggable: false
  };

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

      <div className="h-[300px] rounded-xl overflow-hidden shadow-lg relative">
      {/* Map Container */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={coordinates}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: true,
          styles: [] // Show all POIs
        }}
      />

      {/* Fixed Marker Container - Outside of GoogleMap component */}
      {isMapReady && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {/* Pin Container */}
          <div style={{ transform: 'translate(0, -50%)' }}>
            {/* Pin head */}
            <div
              style={{
                width: '20px',
                height: '20px',
                background: '#FF0000',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
            {/* Pin tail */}
            <div
              style={{
                width: '2px',
                height: '10px',
                background: '#FF0000',
                margin: '-2px auto 0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>
      )}
    </div>

    {/* Debug info */}
    <div className="text-xs space-y-1 bg-gray-50 p-2 rounded-lg">
      <div>Location: {address}</div>
      <div>Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</div>
      <div className="text-gray-500">
        ℹ️ The red pin shows your selected location. You can move the map to see nearby places.
      </div>
    </div>
    </div>
  );
};

export default LocationInput;