import { FaCar, FaCommentDots, FaMapMarkerAlt, FaMotorcycle, FaPhone, FaStar, FaArrowDown, FaTaxi, FaUserCircle } from "react-icons/fa";

function VehicleIcon({ vehicleType, ...props }) {
  const normalizedType = String(vehicleType || "car").toLowerCase();
  if (["bike", "motorcycle", "motorbike", "moto"].includes(normalizedType)) return <FaMotorcycle {...props} />;
  if (["auto", "autorickshaw"].includes(normalizedType)) return <FaTaxi {...props} />;
  return <FaCar {...props} />;
}

function WaitingForDriverPanel({
  waitingForDriver,
  setWaitingForDriver,
  driverData,
  pickup,
  destination,
  etaText,
  onCancelRide,
}) {
  // Default fallback data template (overridden by dynamic driverData prop)
  const driver = driverData || {
    name: "Sarthak Sharma",
    photo: "",
    vehicleName: "Maruti Suzuki Swift",
    vehicleType: "car",
    vehicleNumber: "MH 04 AB 1234",
    vehicleImage: "",
    price: "₹193.20",
    otp: "5821",
    rating: "4.9",
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 shadow-[0_-4px_25px_rgba(0,0,0,0.2)] max-w-md mx-auto border-t border-gray-100 transition-transform duration-500 ease-in-out ${
        waitingForDriver ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Top Handle Bar */}
      <div
        onClick={() => setWaitingForDriver(false)}
        className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 cursor-pointer hover:bg-gray-400"
      />

      {/* Header Status & OTP Badge */}
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Driver is on the way</h3>
          <p className="text-xs text-gray-500 font-medium">
            {etaText ? `Arriving in ${etaText}` : "Waiting for captain location"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWaitingForDriver(false)}
          aria-label="Hide current ride"
          className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-800 hover:bg-gray-200"
        >
          <FaArrowDown aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        {/* OTP Container */}
        <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
          <p className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">
            OTP
          </p>
          <p className="text-lg font-extrabold text-amber-900 tracking-widest leading-none">
            {driver.otp}
          </p>
        </div>
      </div>

      {/* Driver & Vehicle Profile */}
      <div className="flex items-center justify-between mb-5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
        {/* Driver Details */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {driver.photo ? <img src={driver.photo} alt={driver.name} className="h-14 w-14 rounded-full object-cover border-2 border-black" /> : <FaUserCircle aria-label={driver.name} className="h-14 w-14 text-slate-400" />}
            <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <FaStar aria-hidden="true" className="h-2.5 w-2.5" /> {driver.rating}
            </span>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-base">{driver.name}</h4>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              {driver.vehicleNumber}
            </p>
            <p className="text-xs text-gray-500">{driver.vehicleName}</p>
            {driver.vehicleColor && (
              <p className="text-xs text-gray-500">Color: {driver.vehicleColor}</p>
            )}
            {driver.email && (
              <p className="text-xs text-gray-500">{driver.email}</p>
            )}
          </div>
        </div>

        {/* Vehicle Image & Price */}
        <div className="text-right flex flex-col items-end">
          {driver.vehicleImage ? <img src={driver.vehicleImage} alt={driver.vehicleName} className="mb-1 h-12 object-contain" /> : <VehicleIcon vehicleType={driver.vehicleType || driver.vehicleName} aria-label={driver.vehicleName} className="mb-1 h-10 w-10 text-slate-700 sm:h-12 sm:w-12" />}
          <span className="font-extrabold text-lg text-black">{driver.price}</span>
        </div>
      </div>

      {/* Trip Address Details */}
      <div className="space-y-3 mb-5 border-b pb-4">
        {/* Pickup */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Pickup Location
            </p>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {pickup || "Current Location"}
            </p>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt aria-hidden="true" className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Destination Location
            </p>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {destination || "Select Destination"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Call & Message */}
      <div className="flex gap-3">
        <a href={driver.phone ? `tel:${driver.phone}` : undefined} className="flex-1 bg-black text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
          <FaPhone aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Call Driver
        </a>
        <button className="flex-1 bg-gray-100 text-gray-800 font-bold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <FaCommentDots aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Message
        </button>
      </div>
      <button
        type="button"
        onClick={onCancelRide}
        className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
      >
        Cancel Ride
      </button>
    </div>
  );
}

export default WaitingForDriverPanel;