import React from "react";

function LocationSearchpanel() {
  const locations = [
    "24B, Near Kapoor's Cafe Coding School, mumbai",
    "14B, Near Sharma's Cafe Coding School, Bhopal",
  ];
  return (
    <div className="">
      {locations.map(function (elem) {
        return (
          <div className="flex items-center  border active:border-black  rounded-lg gap-4 mt-3 p-3">
            <div className="bg-[#eee] h-10 w-10 rounded-full flex items-center justify-center">
              <img
                src="https://img.icons8.com/ios-filled/50/000000/marker.png"
               
                className="w-5 h-5"
              />
            </div>
            <div>
              <h5 className="font-semibold text-black">
               { elem}
              </h5>
              
            </div>
          </div>
        );
      })}

      
    </div>
  );
}

export default LocationSearchpanel;
