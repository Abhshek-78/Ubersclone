import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CaptainTopBar from "../component/CaptainTopBar";
import RiderDetailsSidebar from "../component/RiderDetailsSidebar";
import CancelRideModal from "../component/CancelRideModal";
import CaptainActionPanel from "../component/CaptainActionPanel";
import FinishRideModal from "../component/FinishRideModal";
import { useSocket } from "../context/useSocket";
import LiveMap from "../component/LiveMap";

function CaptainRiding() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { sendMessage, receiveMessage } = useSocket();
  const ride = state?.ride;
  const captainId = getCaptainId();

  // State Management
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rideStatus, setRideStatus] = useState("waiting_otp"); // 'waiting_otp' | 'ongoing' | 'completed'

  const [otp, setOtp] = useState (["", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [captainLocation, setCaptainLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [ridePhase, setRidePhase] = useState("pickup");

  // Accepted Ride Data
  const acceptedRide = {
    rideId: ride?.rideId,
    customer: {
      name: ride?.user?.name || "Rider",
      phone: ride?.user?.phone || "",
    },
    pickup: ride?.pickup || "Pickup location",
    destination: ride?.destination || "Destination",
    fare: ride?.fare || 0,
    paymentMode: "Cash / UPI",
    correctOtp: ride?.otp || "",
    distanceRemaining: ride?.distanceToPickup || "",
    vehicleType: ride?.vehicleType || ride?.captain?.vehicle?.vehicaltype || "car",
  };

  useEffect(() => {
    if (!captainId) return undefined;

    const removeLocationListener = receiveMessage("captain-location", (update) => {
      if (update?.location) setCaptainLocation(update.location);
      if (update?.route) setRoute(update.route);
      if (update?.phase) setRidePhase(update.phase);
    });

    const watchId = navigator.geolocation?.watchPosition(
      ({ coords }) => {
        const location = { ltd: coords.latitude, log: coords.longitude };
        setCaptainLocation(location);
        sendMessage("captain-location", { captainId, location });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation?.clearWatch(watchId);
      removeLocationListener();
    };
  }, [captainId, receiveMessage, sendMessage]);

  // OTP handlers
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleStartTrip = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      setErrorMsg("Please enter the 4-digit PIN provided by the customer");
      return;
    }

    if (enteredOtp === acceptedRide.correctOtp) {
      setErrorMsg("");
      setRideStatus("ongoing");
      setRidePhase("ongoing");
      sendMessage("start-ride", { rideId: acceptedRide.rideId, captainId });
    } else {
      setErrorMsg("Invalid PIN. Please ask customer to re-check.");
    }
  };

  // Opens the finish ride & payment collection popup
  const handleFinishTrip = () => {
    setShowFinishModal(true);
  };

  // Finalizes the trip and routes back to captain home
  const handlePaymentCollected = () => {
    setShowFinishModal(false);
    setRideStatus("completed");
    sendMessage("complete-ride", { rideId: acceptedRide.rideId, captainId });
    navigate("/captain-home");
  };

  const handleConfirmCancel = () => {
    if (!cancelReason) {
      alert("Please select a cancellation reason");
      return;
    }
    setShowCancelModal(false);
    setIsSidebarOpen(false);
    alert(`Ride cancelled. Reason: ${cancelReason}`);
    navigate("/captain-home");
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-100 font-sans">
      <div className="h-dvh w-full">
        <LiveMap
          pickup={acceptedRide.pickup}
          destination={acceptedRide.destination}
          captainLocation={captainLocation}
          route={route}
          vehicleType={acceptedRide.vehicleType}
        />
      </div>

      {/* Top Floating Navigation Header */}
      <CaptainTopBar
        customer={acceptedRide.customer}
        rideStatus={rideStatus}
        distanceRemaining={acceptedRide.distanceRemaining}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Customer Profile Sidebar */}
      <RiderDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ride={acceptedRide}
        rideStatus={rideStatus}
        onOpenCancelModal={() => setShowCancelModal(true)}
      />

      {/* Reason Selection Cancel Modal */}
      <CancelRideModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        customerName={acceptedRide.customer.name}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* Bottom Collapsible Action Panel */}
      <CaptainActionPanel
        isExpanded={isPanelExpanded}
        setIsExpanded={setIsPanelExpanded}
        ride={acceptedRide}
        rideStatus={rideStatus}
        otp={otp}
        onOtpChange={handleOtpChange}
        onKeyDown={handleKeyDown}
        errorMsg={errorMsg}
        onStartTrip={handleStartTrip}
        onFinishTrip={handleFinishTrip}
      />

      {/* Ride Complete & Collect Payment Modal */}
      <FinishRideModal
        isOpen={showFinishModal}
        fare={acceptedRide.fare}
        paymentMode={acceptedRide.paymentMode}
        customer={acceptedRide.customer}
        onCompleteAndRedirect={handlePaymentCollected}
      />
    </div>
  );
}

function getCaptainId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]))._id;
  } catch {
    return null;
  }
}

export default CaptainRiding;