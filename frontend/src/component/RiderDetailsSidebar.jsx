import React from "react";
import { FaCommentDots, FaMapMarkerAlt, FaPhone, FaStar, FaTimes } from "react-icons/fa";

function RiderDetailsSidebar({
  isOpen,
  onClose,
  ride,
  rideStatus,
  onOpenCancelModal,
}) {
  const { customer, fare, paymentMode, pickup, destination, tripDistance } =
    ride;

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        isOpen
          ? "bg-black/50 opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Trip Details</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm hover:bg-gray-200"
            >
              <FaTimes aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Customer Profile Card */}
          <div className="flex items-center gap-3.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100 mb-4">
            <div className="relative">
              <img
                src={customer.photo}
                alt={customer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-black"
              />
              <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                <FaStar aria-hidden="true" className="h-2.5 w-2.5" /> {customer.rating}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-base">
                {customer.name}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                {customer.totalTrips} completed
              </p>
              <p className="text-xs text-gray-700 font-mono mt-0.5 font-bold">
                {customer.phone}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Payment
              </p>
              <p className="text-xs text-gray-600 font-medium">{paymentMode}</p>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{fare}</h3>
          </div>

          {/* Customer Note */}
          {customer.notes && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4">
              <p className="text-[10px] text-amber-800 uppercase font-bold tracking-wider">
                Customer Note
              </p>
              <p className="text-xs text-amber-950 font-medium mt-0.5">
                "{customer.notes}"
              </p>
            </div>
          )}

          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <a
              href={`tel:${customer.phone}`}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <FaPhone aria-hidden="true" className="h-3.5 w-3.5" /> Call
            </a>
            <button
              onClick={() => alert("Opening chat...")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <FaCommentDots aria-hidden="true" className="h-3.5 w-3.5" /> Message
            </button>
          </div>

          {/* Location Path */}
          <div className="space-y-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 mb-6">
            <div className="flex items-start gap-2.5">
              <FaMapMarkerAlt aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Pickup
                </p>
                <p className="text-xs font-semibold text-gray-800">{pickup}</p>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-3" />

            <div className="flex items-start gap-2.5">
              <FaMapMarkerAlt aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Drop ({tripDistance})
                </p>
                <p className="text-xs font-semibold text-gray-800">
                  {destination}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation CTA */}
        {rideStatus !== "ongoing" && (
          <button
            onClick={onOpenCancelModal}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3.5 rounded-xl text-sm transition-colors border border-rose-200 active:scale-98"
          >
            Cancel Ride
          </button>
        )}
      </div>
    </div>
  );
}

export default RiderDetailsSidebar;
