import React from "react";

function CancelRideModal({
  isOpen,
  onClose,
  customerName,
  cancelReason,
  setCancelReason,
  onConfirmCancel,
}) {
  if (!isOpen) return null;

  const reasons = [
    "Customer didn't show up",
    "Customer requested cancellation",
    "Vehicle breakdown / Flat tire",
    "Heavy traffic / Unable to reach",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Cancel Ride?</h3>
        <p className="text-xs text-gray-500 mb-4">
          Select a cancellation reason for {customerName}:
        </p>

        <div className="space-y-2 mb-5">
          {reasons.map((reason, idx) => (
            <label
              key={idx}
              onClick={() => setCancelReason(reason)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                cancelReason === reason
                  ? "border-rose-500 bg-rose-50/50 text-rose-900"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="cancelReason"
                checked={cancelReason === reason}
                onChange={() => setCancelReason(reason)}
                className="accent-rose-600"
              />
              <span>{reason}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-xs transition-colors"
          >
            Back
          </button>
          <button
            onClick={onConfirmCancel}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-rose-600/30"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelRideModal;
