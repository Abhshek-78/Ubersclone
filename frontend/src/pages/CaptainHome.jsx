import React from 'react'
import mapimage from "../assets/map.png";
function CaptainHome() {
  return (
    <div className="h-screen relative overflow-hidden">
      <div
              className="h-dvh w-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${mapimage})` }}
            />
    </div>
  )
}

export default CaptainHome