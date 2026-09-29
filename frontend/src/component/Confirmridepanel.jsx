import React from "react";
import { FaMapMarkerAlt, FaUserFriends } from "react-icons/fa";

function ConfirmRidePanel({
  confirmRidePanel,
  setConfirmRidePanel,
  selectedVehicle,
  pickup,
  destination,
  onConfirm,
}) {
  if (!selectedVehicle) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl p-5 shadow-[0_-4px_25px_rgba(0,0,0,0.2)] max-w-md mx-auto border-t border-gray-100 transition-transform duration-500 ease-in-out ${
        confirmRidePanel ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Drag handle / Close button */}
      <div
        onClick={() => setConfirmRidePanel(false)}
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer hover:bg-gray-400"
      />

      <h3 className="text-xl font-bold mb-4 text-gray-900">Confirm your Ride</h3>

      {/* Selected Vehicle Preview */}
      <div className="flex flex-col items-center border-b pb-4 mb-4">
        {selectedVehicle.icon ? (
          <selectedVehicle.icon aria-label={selectedVehicle.name} className="mb-2 h-20 w-20 text-slate-800 sm:h-24 sm:w-24" />
        ) : (
          <img src={selectedVehicle.image} alt={selectedVehicle.name} className="mb-2 h-24 object-contain" />
        )}
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-900">
            {selectedVehicle.name}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">
            <FaUserFriends aria-hidden="true" className="h-3 w-3" /> {selectedVehicle.capacity}
          </span>
        </div>
        <p className="text-2xl font-extrabold text-black mt-1">
          {selectedVehicle.price}
        </p>
      </div>

      {/* Address Details */}
      <div className="space-y-4 mb-6">
        {/* Pickup Location */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt aria-hidden="true" className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Pickup Location
            </p>
            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
              {pickup || "Current Location"}
            </p>
          </div>
        </div>

        <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4 -my-2" />

        {/* Destination Location */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt aria-hidden="true" className="h-4 w-4 text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Destination
            </p>
            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
              {destination || "Select Destination"}
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-base transition-colors shadow-md active:scale-[0.98]"
      >
        Confirm {selectedVehicle.name}
      </button>
    </div>
  );
}

export default ConfirmRidePanel;