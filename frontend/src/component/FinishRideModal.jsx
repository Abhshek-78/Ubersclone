import { FaCheck } from "react-icons/fa";

function FinishRideModal({
  isOpen,
  fare,
  paymentMode,
  customer,
  onCompleteAndRedirect,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Green Checkmark Badge */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
          <FaCheck aria-hidden="true" className="h-8 w-8 text-emerald-600 sm:h-10 sm:w-10" />
        </div>

        {/* Success Header */}
        <h3 className="text-2xl font-black text-gray-900 mb-1">
          Ride Completed!
        </h3>
        <p className="text-xs text-gray-500 font-medium mb-5">
          Trip with{" "}
          <span className="font-bold text-gray-800">{customer?.name}</span>{" "}
          ended successfully.
        </p>

        {/* Amount to Collect Card */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-5">
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            Total Amount to Collect
          </p>
          <h2 className="text-4xl font-black text-emerald-600 tracking-tight mb-2">
            {fare}
          </h2>
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {paymentMode || "Cash to Collect"}
          </span>
        </div>

        {/* Payment Confirmation CTA */}
        <button
          onClick={onCompleteAndRedirect}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-black/20 active:scale-[0.98] transition-all"
        >
          Collect & Complete
        </button>
      </div>
    </div>
  );
}

export default FinishRideModal;
