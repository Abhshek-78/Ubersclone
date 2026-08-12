import React, { useState } from 'react';

function Openbookpanel({
  vehicalpanel,
  setVehicalpanel,
  setSelectedVehicle,
  setConfirmRidePanel,
}) {
  const rideOptions = [
    {
      id: "uberGo",
      name: "UberGo",
      capacity: 4,
      description: "Affordable, compact rides",
      price: "₹193.20",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQCJRWXqN_BI1o00GppW5TLYY-2NLGpFsVAg3rOs4hlw&s=10",
    },
    {
      id: "uberMoto",
      name: "Moto",
      capacity: 1,
      description: "Affordable motorcycle rides",
      price: "₹65.00",
      image: "https://cdn-icons-png.flaticon.com/128/11432/11432322.png",
    },
    {
      id: "uberAuto",
      name: "UberAuto",
      capacity: 3,
      description: "No haggling, doorstep pickup",
      price: "₹118.50",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE_JyrWPd8oITTsdiEBAW9cmhLBcCU-GpR1Y6YXqfs2A&s=10",
    },
  ];

  const handleSelectRide = (ride) => {
    setSelectedVehicle(ride);
    setVehicalpanel(false);
    setConfirmRidePanel(true);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] max-w-md mx-auto border-t border-gray-100 transition-transform duration-500 ease-in-out ${
        vehicalpanel ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div
        onClick={() => setVehicalpanel(false)}
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
      />

      <h3 className="text-xl font-bold mb-3 px-2 text-gray-900">
        Choose a ride
      </h3>

      <div className="space-y-2 mb-4">
        {rideOptions.map((ride) => (
          <div
            key={ride.id}
            onClick={() => handleSelectRide(ride)}
            className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
          >
            <div className="w-16 h-12 flex-shrink-0 flex items-center justify-center">
              <img
                src={ride.image}
                alt={ride.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex-1 ml-3">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-gray-900">
                  {ride.name}
                </span>
                <span className="text-xs text-gray-600 flex items-center">
                  👤 {ride.capacity}
                </span>
              </div>
              <div className="text-xs text-gray-500">{ride.description}</div>
            </div>

            <div className="text-right">
              <span className="font-bold text-lg text-gray-900">
                {ride.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Openbookpanel;