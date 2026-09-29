import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

function RidePopupPanel({
  rideRequest,
  ridePopupPanel,
  setRidePopupPanel,
  onAcceptRide,
  onDeclineRide,
}) {
  // Default template data fallback
  const ride = rideRequest || {
    user: {
      name: "Rohit Verma",
      phone: "+91 98765 43210",
      photo:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      rating: "4.85",
      trips: "36 trips",
    },
    fare: "193.20",
    distanceToPickup: "1.8 km (4 mins away)",
    tripDistance: "7.5 km",
    pickup: "24B, Near Kapoor's Cafe Coding School, Mumbai",
    destination: "14B, Near Sharma's Cafe Coding School, Bhopal",
    paymentType: "Cash / UPI",
  };

  // 15-second countdown timer for captain response
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!ridePopupPanel) {
      setTimeLeft(15);
      return;
    }

    if (timeLeft === 0) {
      if (onDeclineRide) onDeclineRide();
      else setRidePopupPanel(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [ridePopupPanel, timeLeft, onDeclineRide, setRidePopupPanel]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] max-w-md mx-auto border-t border-gray-100 transition-transform duration-500 ease-in-out ${
        ridePopupPanel ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Grab Handle */}
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

      {/* Top Request Status & Auto-Dismiss Timer */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
          New Ride Request ({timeLeft}s)
        </span>
        <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
          {ride.paymentType}
        </span>
      </div>

      {/* Customer Profile & Fare Header */}
      <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={ride.user.photo}
              alt={ride.user.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-black"
            />
            <span className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
              <FaStar aria-hidden="true" className="h-2.5 w-2.5" /> {ride.user.rating}
            </span>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-base leading-tight">
              {ride.user.name}
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              {ride.user.trips} •{" "}
              <span className="text-emerald-600 font-bold">
                {ride.distanceToPickup}
              </span>
            </p>
            {ride.user.phone && (
              <p className="text-xs text-gray-600 mt-1">{ride.user.phone}</p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">
            You Earn
          </p>
          <h3 className="text-pretty font-black text-gray-900 tracking-tight">
            ₹{ride.fare}
          </h3>
        </div>
      </div>

      {/* Ride Addresses: Pickup & Destination */}
      <div className="space-y-3  bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm">
        {/* Pickup */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <FaMapMarkerAlt aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Pickup ({ride.distanceToPickup})
            </p>
            <p className="text-xs font-bold text-gray-800 line-clamp-1">
              {ride.pickup}
            </p>
          </div>
        </div>

        {/* Dashed connector line */}
        <div className="ml-3 border-l-2 border-dashed border-neutral-900 h-4 -my-1" />

        {/* Drop Destination */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
            <FaMapMarkerAlt aria-hidden="true" className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Destination ({ride.tripDistance})
            </p>
            <p className="text-xs font-bold text-gray-800 line-clamp-1">
              {ride.destination}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Ignore vs Accept */}
      <div className="flex gap-3">
        <button
          onClick={
            onDeclineRide ? onDeclineRide : () => setRidePopupPanel(false)
          }
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.98]"
        >
          Ignore
        </button>

        <button
          onClick={onAcceptRide ? onAcceptRide : () => setRidePopupPanel(false)}
          className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/20"
        >
          Accept Ride
        </button>
      </div>
    </div>
  );
}

export default RidePopupPanel;
