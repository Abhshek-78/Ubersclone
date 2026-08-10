import React, { useState } from "react";
import { Link } from "react-router-dom";
import mapimage from "../assets/map.png";
import UserProtectedWraper from "./UserProtectedWraper";

function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background Map Image */}
      <div
        className="h-dvh w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${mapimage})`,
        }}
      ></div>

      {/* Slide-Up Container */}
      <div
        className={`bg-white absolute bottom-0 w-full p-5 rounded-t-2xl transition-all duration-500 ease-in-out z-10 ${
          isExpanded ? "h-full" : "h-auto"
        }`}
      >
        {/* Header with Title and Close Button */}
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-2xl font-bold">Find the place</h4>
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-600 font-bold text-xl px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ↓
            </button>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={submitHandler} className="relative">
          <div className="line absolute h-14 w-1 left-3 top-4 bg-slate-600 rounded-full"></div>

          <input
            onFocus={() => setIsExpanded(true)}
            className="bg-[#eee] w-full px-8 py-2 text-base mt-2 rounded-lg outline-none"
            type="text"
            placeholder="pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />

          <input
            onFocus={() => setIsExpanded(true)}
            className="bg-[#eee] w-full px-8 py-2 text-base mt-4 rounded-lg outline-none"
            type="text"
            placeholder="destination location"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </form>

        {/* Dynamic Search Results / Content Area */}
        {isExpanded && (
          <div className="mt-6">
            <p className="text-gray-500 text-sm font-semibold mb-2">
              Recent Searches / Suggestions
            </p>
            {/* Add your location results list here */}
            <div className="flex items-center gap-4 p-3 border-b-2 active:bg-[#eee] rounded-xl cursor-pointer">
              <div className="bg-[#eee] h-10 w-10 rounded-full flex items-center justify-center">
                📍
              </div>
              <div>
                <h5 className="font-semibold text-base">24B, Near Kapoor's Cafe</h5>
                <p className="text-sm text-gray-500">Coding School, Bhopal</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;