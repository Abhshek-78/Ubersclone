import React, { useState } from "react";
import { Link } from "react-router-dom";
import mapimage from "../assets/map.png";
import UserProtectedWraper from "./UserProtectedWraper";
import LocationSearchpanel from "../component/LocationSearchpanel";
import Openbookpanel from "../component/Openbookpanel";
function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen relative overflow-hidden">
     
      <div
        className="h-dvh w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${mapimage})`,
        }}
      ></div>

   
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

     
        <form onSubmit={submitHandler} className="relative">
          <div className="line absolute h-16 w-1 left-4 top-6 bg-slate-600 rounded-full"></div>

          <input
            onFocus={() => setIsExpanded(true)}
            className="bg-[#eee] w-full px-8  text-black py-2 text-base mt-2 rounded-lg outline-none"
            type="text"
            placeholder="pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />

          <input
            onFocus={() => setIsExpanded(true)}
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
           
            <LocationSearchpanel  ></LocationSearchpanel>
            <Openbookpanel></Openbookpanel>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;