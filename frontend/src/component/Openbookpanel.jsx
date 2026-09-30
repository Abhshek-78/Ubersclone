import { FaCar, FaMotorcycle, FaTaxi, FaUserFriends } from "react-icons/fa";

function Openbookpanel({
  vehicalpanel,
  setVehicalpanel,
  setSelectedVehicle,
  setConfirmRidePanel,
  fares,
}) {
  const rideOptions = [
    {
      id: "uberGo",
      name: "UberGo",
      capacity: 4,
      description: "Affordable, compact rides",
      vehicleType: "car",
      icon: FaCar,
    },
    {
      id: "uberMoto",
      name: "Moto",
      capacity: 1,
      description: "Affordable motorcycle rides",
      vehicleType: "motorcycle",
      icon: FaMotorcycle,
    },
    {
      id: "uberAuto",
      name: "UberAuto",
      capacity: 3,
      description: "No haggling, doorstep pickup",
      vehicleType: "auto",
      icon: FaTaxi,
    },
  ];

  const handleSelectRide = (ride) => {
    setSelectedVehicle({
      ...ride,
      price: `₹${Number(fares[ride.vehicleType]).toFixed(2)}`,
    });
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
        {rideOptions.map((ride) => {
          const RideIcon = ride.icon;
          return (
            <div
              key={ride.id}
              onClick={() => handleSelectRide(ride)}
              className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="w-16 h-12 flex-shrink-0 flex items-center justify-center">
                {RideIcon ? <RideIcon aria-label={ride.name} className="h-8 w-8 text-slate-800 sm:h-9 sm:w-9" /> : <img src={ride.image} alt={ride.name} className="max-h-full max-w-full object-contain" />}
              </div>

            <div className="flex-1 ml-3">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-gray-900">
                  {ride.name}
                </span>
                <span className="text-xs text-gray-600 flex items-center">
                  <FaUserFriends aria-hidden="true" className="mr-1 h-3 w-3" /> {ride.capacity}
                </span>
              </div>
              <div className="text-xs text-gray-500">{ride.description}</div>
            </div>

            <div className="text-right">
              <span className="font-bold text-lg text-gray-900">
                ₹{Number(fares?.[ride.vehicleType] || 0).toFixed(2)}
              </span>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Openbookpanel;