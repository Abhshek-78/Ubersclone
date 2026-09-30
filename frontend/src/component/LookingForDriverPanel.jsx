import { FaCar, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

function LookingForDriverPanel({
  lookingForDriverPanel,
  setLookingForDriverPanel,
  selectedVehicle,
  pickup,
  destination,
}) {
  if (!selectedVehicle) return null;
  const VehicleIcon = selectedVehicle.icon || FaCar;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl p-5 shadow-[0_-4px_25px_rgba(0,0,0,0.2)] max-w-md mx-auto border-t border-gray-100 transition-transform duration-500 ease-in-out ${
        lookingForDriverPanel ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Header & Cancel Icon */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Looking for a Driver</h3>
        <button
          onClick={() => setLookingForDriverPanel(false)}
          className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full text-sm font-bold"
        >
          <FaTimes aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {/* Radar Animation & Vehicle Image */}
      <div className="relative flex justify-center items-center py-6 my-2">
        {/* Pulsing Radar Rings */}
        <div className="absolute w-36 h-36 bg-black/10 rounded-full animate-ping" />
        <div className="absolute w-28 h-28 bg-black/5 rounded-full animate-pulse" />

        {/* Vehicle Image */}
        {selectedVehicle.icon || !selectedVehicle.image ? (
          <VehicleIcon aria-label={selectedVehicle.name} className="relative z-10 h-16 w-16 text-slate-800 sm:h-20 sm:w-20" />
        ) : (
          <img src={selectedVehicle.image} alt={selectedVehicle.name} className="relative z-10 h-20 object-contain" />
        )}
      </div>

      {/* Ride Details Card */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-4 mb-6">
        {/* Vehicle Info */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div>
            <span className="font-bold text-lg text-gray-900">
              {selectedVehicle.name}
            </span>
            <p className="text-xs text-gray-500">{selectedVehicle.description}</p>
          </div>
          <span className="font-extrabold text-xl text-black">
            {selectedVehicle.price}
          </span>
        </div>

        {/* Pickup Location */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Pickup
            </p>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {pickup || "Current Location"}
            </p>
          </div>
        </div>

        {/* Destination Location */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt aria-hidden="true" className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Destination
            </p>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {destination || "Select Destination"}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Request Button */}
      <button
        onClick={() => setLookingForDriverPanel(false)}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl text-sm transition-colors"
      >
        Cancel Request
      </button>
    </div>
  );
}

export default LookingForDriverPanel;