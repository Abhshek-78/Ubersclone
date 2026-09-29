import { useEffect, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";

function LocationSearchpanel({ query, onSelectLocation }) {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      return undefined;
    }

    const controller = new AbortController();
    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/maps/get-suggestion`,
            {
              params: { suggestion: trimmedQuery },
              signal: controller.signal,
              headers:{
                Authorization:`Bearer ${localStorage.getItem('token')}`
              },
            },
          );

          setLocations(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          if (error.name !== "CanceledError" && error.name !== "AbortError") {
            setLocations([]);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query]);

  return (
    <div>
      {isLoading && query.trim().length >= 3 && (
        <p className="text-gray-500 text-sm mt-3">Finding locations...</p>
      )}

      {!isLoading && query.trim().length >= 3 && locations.length === 0 && (
        <p className="text-gray-500 text-sm mt-3">No locations found.</p>
      )}

      {locations.map((location) => (
        <div
          key={location.place_id || location.description}
          onClick={() => onSelectLocation(location.description)}
          className="flex items-center border active:border-black rounded-lg gap-4 mt-3 p-3 cursor-pointer hover:bg-gray-50"
        >
          <div className="bg-[#eee] h-10 w-10 rounded-full flex items-center justify-center shrink-0">
            <FaMapMarkerAlt aria-hidden="true" className="h-4 w-4 text-slate-700 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h5 className="font-semibold text-black">
              {location.structured_formatting?.main_text || location.description}
            </h5>
            {location.structured_formatting?.secondary_text && (
              <p className="text-sm text-gray-500">
                {location.structured_formatting.secondary_text}
              </p>
            )}
          </div>
          
        </div>
      ))}
      
    </div>

  );
}
export default LocationSearchpanel;