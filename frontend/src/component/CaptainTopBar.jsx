import { FaUser } from "react-icons/fa";

function CaptainTopBar({
  customer,
  rideStatus,
  distanceRemaining,
  onOpenSidebar,
}) {
  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center max-w-md mx-auto">
      <button
        onClick={onOpenSidebar}
        className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg border border-gray-100 text-gray-900 font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all"
      >
        {customer.photo ? <img src={customer.photo} alt={customer.name} className="h-7 w-7 rounded-full object-cover border-2 border-black" /> : <FaUser aria-hidden="true" className="h-5 w-5" />}
        <span>Customer</span>
      </button>

      <div className="bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            rideStatus === "ongoing"
              ? "bg-amber-400 animate-ping"
              : "bg-emerald-400 animate-pulse"
          }`}
        />
        {rideStatus === "ongoing" ? "Trip in Progress" : distanceRemaining}
      </div>
    </div>
  );
}

export default CaptainTopBar;
