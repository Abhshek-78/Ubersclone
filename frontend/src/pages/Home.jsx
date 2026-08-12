import React, { useState } from "react";
import { Link } from "react-router-dom";
import mapimage from "../assets/map.png";
import UserProtectedWraper from "./UserProtectedWraper";
import LocationSearchpanel from "../component/LocationSearchpanel";
import Openbookpanel from "../component/Openbookpanel";
import ConfirmRidePanel from "../component/Confirmridepanel";
import LookingForDriverPanel from "../component/LookingForDriverPanel";
import WaitingForDriverPanel from "../component/WaitingForDriverPanel";
function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [vehicalpanel, setVehicalpanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [lookingForDriverPanel, setLookingForDriverPanel] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Backend state template for assigned driver
  const [driverData, setDriverData] = useState(null);

  const handleConfirmRide = () => {
    setConfirmRidePanel(false);
    setLookingForDriverPanel(true);

    // Simulate backend driver acceptance after 3 seconds
    setTimeout(() => {
      setDriverData({
        name: "Rahul Verma",
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdl152hZG22-iND4L3133f9Bip_f9-iO4B1A&s",
        vehicleName: selectedVehicle?.name || "UberGo",
        vehicleNumber: "DL 01 CX 9988",
        vehicleImage: selectedVehicle?.image,
        price: selectedVehicle?.price || "₹193.20",
        otp: "7412",
        rating: "4.85",
      });
      setLookingForDriverPanel(false);
      setWaitingForDriver(true);
    }, 3000);
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background Map */}
      <div
        className="h-dvh w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${mapimage})` }}
      />

      {/* Main Search Panel */}
      <div
        className={`bg-white absolute bottom-0 w-full p-5 rounded-t-2xl transition-all duration-500 ease-in-out z-10 ${
          isExpanded ? "h-full" : "h-auto"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-2xl font-bold text-black">Find the place</h4>
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-black font-bold text-xl px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ↓
            </button>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <div className="line absolute h-16 w-1 left-4 top-6 bg-slate-600 rounded-full" />

          <input
            onFocus={() => {
              setIsExpanded(true);
              setVehicalpanel(false);
              setConfirmRidePanel(false);
              setLookingForDriverPanel(false);
              setWaitingForDriver(false);
            }}
            className="bg-[#eee] w-full px-8 text-black py-2 text-base mt-2 rounded-lg outline-none"
            type="text"
            placeholder="pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />

          <input
            onFocus={() => {
              setIsExpanded(true);
              setVehicalpanel(false);
              setConfirmRidePanel(false);
              setLookingForDriverPanel(false);
              setWaitingForDriver(false);
            }}
            className="bg-[#eee] w-full px-8 py-2 text-base mt-4 rounded-lg outline-none text-black"
            type="text"
            placeholder="destination location"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </form>

        {isExpanded && (
          <div className="mt-6">
            <p className="text-gray-500 text-sm font-semibold mb-2">
              Recent Searches / Suggestions
            </p>
            <LocationSearchpanel
              onSelectLocation={(loc) => {
                if (!pickup) setPickup(loc);
                else {
                  setDestination(loc);
                  setIsExpanded(false);
                  setVehicalpanel(true);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Ride Options Panel */}
      <Openbookpanel
        vehicalpanel={vehicalpanel}
        setVehicalpanel={setVehicalpanel}
        setSelectedVehicle={setSelectedVehicle}
        setConfirmRidePanel={setConfirmRidePanel}
      />

      {/* Confirm Ride Panel */}
      <ConfirmRidePanel
        confirmRidePanel={confirmRidePanel}
        setConfirmRidePanel={setConfirmRidePanel}
        selectedVehicle={selectedVehicle}
        pickup={pickup}
        destination={destination}
        onConfirm={handleConfirmRide}
      />

      {/* Searching Driver Panel */}
      <LookingForDriverPanel
        lookingForDriverPanel={lookingForDriverPanel}
        setLookingForDriverPanel={setLookingForDriverPanel}
        selectedVehicle={selectedVehicle}
        pickup={pickup}
        destination={destination}
      />

      {/* Accepted / Waiting for Driver Panel */}
      <WaitingForDriverPanel
        waitingForDriver={waitingForDriver}
        setWaitingForDriver={setWaitingForDriver}
        driverData={driverData}
        pickup={pickup}
        destination={destination}
      />
    </div>
  );
}

export default Home;