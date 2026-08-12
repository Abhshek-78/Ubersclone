import React from "react";

function LocationSearchpanel({ onSelectLocation }) {
  const locations = [
    "24B, Near Kapoor's Cafe Coding School, Mumbai",
    "14B, Near Sharma's Cafe Coding School, Bhopal",
  ];

  return (
    <div>
      {locations.map((elem, index) => (
        <div
          key={index}
          onClick={() => onSelectLocation(elem)}
          className="flex items-center border active:border-black rounded-lg gap-4 mt-3 p-3 cursor-pointer hover:bg-gray-50"
        >
          <div className="bg-[#eee] h-10 w-10 rounded-full flex items-center justify-center shrink-0">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/marker.png"
              alt="location marker"
              className="w-5 h-5"
            />
          </div>
          <div>
            <h5 className="font-semibold text-black">{elem}</h5>
          </div>
        </div>
      ))}
    </div>
  );
}
export default LocationSearchpanel;