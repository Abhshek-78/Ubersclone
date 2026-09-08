import React, { useState } from "react";
import { Link } from "react-router-dom";
import mapimage from "../assets/map.png";
import UserProtectedWraper from "./UserProtectedWraper";
import LocationSearchpanel from "../component/LocationSearchpanel";
import Openbookpanel from "../component/Openbookpanel";
import ConfirmRidePanel from "../component/Confirmridepanel";
import LookingForDriverPanel from "../component/LookingForDriverPanel";
import WaitingForDriverPanel from "../component/WaitingForDriverPanel";
import axios from "axios";
import {SocketContext} from "../context/socketContext";
import { useContext } from "react";
import { useEffect } from "react";
function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [vehicalpanel, setVehicalpanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [lookingForDriverPanel, setLookingForDriverPanel] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [activeLocationField, setActiveLocationField] = useState("pickup");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fares, setFares] = useState(null);
  const {sendMessage,receiveMessage}=useContext(SocketContext);
  
  useEffect(()=>{
    sendMessage("join",{usertype:'user',userId:localStorage.getItem('useId')})
  },[])
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
        price: selectedVehicle?.price,
        otp: "7412",
        rating: "4.85",
      });
      setLookingForDriverPanel(false);
      setWaitingForDriver(true);
    }, 3000);
  };

  async function findTrip(e) {
    if (e) e.preventDefault();

    if (!pickup.trim() || !destination.trim()) {
      alert("Please enter both pickup and destination locations.");
      return;
    }

    setIsExpanded(false);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/getFare`, {
        params: { pickup, destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setFares(response.data);
      setVehicalpanel(true);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to calculate the fare.");
    }

  }
  async function createRide(vehicleType){
    const response =await axios.post(`${import.meta.env.VITE_BASE_URL}.rides/create`,{
      pickup,
      destination,
      vehicleType
    },{
      headers:{
        Authorization:`Bearer${localStorage.getItem('token')}`
      }
    })
  }

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
              className="text-black font-bold text-xl px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
            >
              ↓
            </button>
          )}
        </div>

        <form onSubmit={findTrip} className="relative">
          <div className="line absolute h-16 w-1 left-4 top-6 bg-slate-600 rounded-full" />

          <input
            onFocus={() => {
              setActiveLocationField("pickup");
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
              setActiveLocationField("destination");
              setIsExpanded(true);
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

          <button
            type="submit"
            className="bg-black mt-4 w-full px-8 py-2 rounded font-bold text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            Find ride
          </button>
        </form>

        {isExpanded && (
          <div className="mt-6">
            <p className="text-gray-500 text-sm font-semibold mb-2">
              Recent Searches / Suggestions
            </p>
            <LocationSearchpanel
              query={activeLocationField === "pickup" ? pickup : destination}
              onSelectLocation={(loc) => {
                if (activeLocationField === "pickup") {
                  setPickup(loc);
                  setActiveLocationField("destination");
                } else {
                  setDestination(loc);
                  // Only sets destination now; does not auto-open the ride panel
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Ride Options Panel */}
      <Openbookpanel
        fares={fares}
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
        confirmRidePanel={confirmRidePanel}
        setConfirmRidePanel={setConfirmRidePanel}
        onConfirm={handleConfirmRide}
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