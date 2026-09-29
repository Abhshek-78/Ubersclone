import React from "react";
import { FaArrowDown, FaArrowUp, FaCommentDots, FaPhone, FaFlagCheckered } from "react-icons/fa";


function CaptainActionPanel({
  isExpanded,
  setIsExpanded,
  ride,
  rideStatus,
  otp,
  onOtpChange,
  onKeyDown,
  errorMsg,
  onStartTrip,
  onFinishTrip,
}) {
  const { customer, fare, destination, tripDistance, paymentMode } = ride;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] max-w-md mx-auto border-t border-gray-100 transition-all duration-500 ease-in-out ${
        isExpanded ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
      }`}
    >
      {/* Clickable Drag & Arrow Toggle Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col items-center justify-center cursor-pointer group pb-2"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors" />
        <button className="text-gray-500 text-xs font-bold mt-1.5 flex items-center gap-1">
          {isExpanded ? <FaArrowDown aria-hidden="true" className="h-3 w-3" /> : <FaArrowUp aria-hidden="true" className="h-3 w-3" />}
          <span>{isExpanded ? "Tap to hide" : "View Ride Controls"}</span>
        </button>
      </div>

      {/* Collapsed Top Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1 mr-2">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {rideStatus === "ongoing"
              ? "Destination in Progress"
              : "Drop-off Location"}
          </p>
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
            {destination}
          </h4>
        </div>
        <span className="font-black text-lg text-black shrink-0">{fare}</span>
      </div>

      {/* Expanded Actions & Workflows */}
      <div className="mt-2">
        {/* Quick Customer Strip */}
        <div className="flex items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <img
              src={customer.photo}
              alt={customer.name}
              className="w-9 h-9 rounded-full object-cover border border-black"
            />
            <div>
              <span className="text-sm font-bold text-gray-800 block leading-tight">
                {customer.name}
              </span>
              <span className="text-[11px] text-gray-500 font-semibold">
                {paymentMode}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`tel:${customer.phone}`}
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-100"
            >
              <FaPhone aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
            <button
              onClick={() => alert("Opening Chat")}
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-100"
            >
              <FaCommentDots aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* State Flow: OTP Entry VS End Ride */}
        {rideStatus === "waiting_otp" ? (
          <div>
            <label className="block text-center text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Enter 4-Digit Rider PIN
            </label>

            <div className="flex justify-center gap-3 mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpChange(e.target.value, index)}
                  onKeyDown={(e) => onKeyDown(e, index)}
                  className="w-12 h-12 text-center text-xl font-bold bg-[#f3f3f3] border-2 border-transparent focus:border-black rounded-xl outline-none transition-all"
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-rose-500 text-xs font-semibold text-center mb-3">
                {errorMsg}
              </p>
            )}

            <button
              onClick={onStartTrip}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
            >
              Start Ride
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-900">
                  Navigating to destination
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800">
                {tripDistance}
              </span>
            </div>

            <button
              onClick={onFinishTrip}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-rose-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <FaFlagCheckered aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" /> Stop / Complete Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CaptainActionPanel;
