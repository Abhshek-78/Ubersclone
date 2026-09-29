import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RidePopupPanel from "../component/RidePopupPanel";
import { useSocket } from "../context/useSocket";
import LiveMap from "../component/LiveMap";
import ProfileAvatarUploader from "../component/ProfileAvatarUploader";
import { FaChartLine, FaClock, FaSignOutAlt, FaStar, FaRoute } from "react-icons/fa";

function getCaptainId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]))._id;
  } catch {
    return null;
  }
}

function formatOnlineTime(totalOnlineSeconds, onlineSince) {
  const activeSeconds = onlineSince
    ? Math.max(0, Math.floor((Date.now() - new Date(onlineSince).getTime()) / 1000))
    : 0;
  const totalMinutes = Math.floor((Number(totalOnlineSeconds) + activeSeconds) / 60);
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function CaptainHome() {
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(true);
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [captainProfile, setCaptainProfile] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const { sendMessage, receiveMessage, isConnected } = useSocket();
  const captainId = getCaptainId();
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!captainId || !isConnected) return undefined;

    let cancelled = false;
    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(({ data }) => {
      if (!cancelled) setCaptainProfile(data.captain);
    }).catch((error) => {
      console.error("Unable to load captain profile:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [captainId, isConnected]);

  useEffect(() => {
    if (!captainId) return undefined;

    const join = (location) => sendMessage("join", {
      userType: "captain",
      userId: captainId,
      location,
    });


    const removeRequestListener = receiveMessage("ride-request", (request) => {
      setRideRequest({
        ...request,
        user: {
          ...request.user,
          photo: request.user?.photo,
          rating: request.user?.rating || "New",
          trips: request.user?.trips || "New rider",
        },
        distanceToPickup: request.distanceToPickup || "Location unavailable",
        tripDistance: request.tripDistance || "Route",
        paymentType: "Cash / UPI",
      });
      setRidePopupPanel(true);
    });
    const removeAcceptedListener = receiveMessage("ride-accepted-captain", (ride) => {
      setRidePopupPanel(false);
      setRideRequest(ride);
      navigate("/Ongoing-ride", { state: { ride } });
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            const location = { ltd: coords.latitude, log: coords.longitude };
            setCaptainLocation(location);
          hasJoinedRef.current = true;
            join(location);
        },
        () => {
          hasJoinedRef.current = true;
          join(undefined);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    } else {
      hasJoinedRef.current = true;
      join(undefined);
    }

    const watchId = navigator.geolocation?.watchPosition(
      ({ coords }) => {
        const location = { ltd: coords.latitude, log: coords.longitude };
        setCaptainLocation(location);
        if (!hasJoinedRef.current) {
          hasJoinedRef.current = true;
          join(location);
          return;
        }
        sendMessage("captain-location", { captainId, location });
      },
      () => {},
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation?.clearWatch(watchId);
      hasJoinedRef.current = false;
      removeRequestListener();
      removeAcceptedListener();
    };
  }, [captainId, isConnected, navigate, receiveMessage, sendMessage]);

  useEffect(() => {
    if (captainId && isConnected) sendMessage("captain-status", { captainId, isOnline });
  }, [captainId, isOnline, isConnected, sendMessage]);

  useEffect(() => receiveMessage("socket-error", ({ message }) => {
    console.error("Socket registration failed:", message);
  }), [receiveMessage]);

  const captain = {
    name: `${captainProfile?.fullname?.firstname || "Captain"} ${captainProfile?.fullname?.lastname || ""}`.trim(),
    photo: captainProfile?.photo || "",
    rating: captainProfile?.rating || "New",
    vehicle: captainProfile?.vehical
      ? `${captainProfile.vehical.vehicaltype} • ${captainProfile.vehical.plate}`
      : "Vehicle details unavailable",
    todayEarnings: Number(captainProfile?.totalEarnings || 0).toFixed(2),
    hoursOnline: formatOnlineTime(captainProfile?.totalOnlineSeconds || 0, captainProfile?.onlineSince),
    tripsCompleted: captainProfile?.completedTrips || 0,
    acceptanceRate: `${Number(captainProfile?.acceptanceRate || 0).toFixed(1)}%`,
  };

  const handleLogout = () => {
    navigate("/captain-login");
  };

  const handleAcceptRide = () => {
    if (!rideRequest?.rideId || !captainId) return;
    sendMessage("accept-ride", { rideId: rideRequest.rideId, captainId });
    setRidePopupPanel(false);
  };

  const handleDeclineRide = () => {
    if (rideRequest?.rideId && captainId) {
      sendMessage("reject-ride", { rideId: rideRequest.rideId, captainId });
    }
    setRidePopupPanel(false);
    setRideRequest(null);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-100 ">
      <div className="h-dvh w-full">
        <LiveMap captainLocation={captainLocation} vehicleType={captainProfile?.vehical?.vehicaltype} />
      </div>

      {/* Top Floating Header: Status Toggle & Logout */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center max-w-md mx-auto">
        {/* Online / Offline Switch */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg transition-all duration-300 font-bold text-sm backdrop-blur-md ${
            isOnline
              ? "bg-emerald-600/90 hover:bg-emerald-700 text-white shadow-emerald-600/30"
              : "bg-gray-900/90 hover:bg-black text-gray-300 shadow-gray-900/30"
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              isOnline ? "bg-white animate-pulse" : "bg-gray-500"
            }`}
          />
          {isOnline ? "YOU'RE ONLINE" : "YOU'RE OFFLINE"}
        </button>

        <div className="flex items-center gap-2">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 border border-gray-100"
          >
            <FaSignOutAlt aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Bottom Captain Dashboard Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-lg p-5 shadow-[0_-6px_30px_rgba(0,0,0,0.18)] max-w-md mx-auto border-t border-gray-100">
        {/* Subtle grab bar indicator */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Captain Profile & Main Earnings Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ProfileAvatarUploader
                photo={captain.photo}
                name={captain.name}
                uploadPath="/captains/profile/photo"
                onUploaded={(photo) => setCaptainProfile((currentProfile) => ({ ...currentProfile, photo }))}
                className="h-14 w-14 rounded-full border-2 border-black"
              />
              <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <FaStar aria-hidden="true" className="h-2.5 w-2.5" /> {captain.rating}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">
                {captain.name}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {captain.vehicle}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Today's Earned
            </p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              ₹{captain.todayEarnings}
            </h2>
          </div>
        </div>

        {/* Daily Metric Highlights */}
        <div className="grid grid-cols-3 gap-2.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
          {/* Hours Online */}
          <div className="text-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-base mb-0.5 align-bottom">
              <FaClock aria-hidden="true" className="mx-auto h-6 w-6 text-slate-700 sm:h-8 sm:w-8" />
            </div>
            <h4 className="text-base font-bold text-gray-900">
              {captain.hoursOnline}{" "}
              <span className="text-[10px] text-gray-500 font-normal">hrs</span>
            </h4>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">
              Online
            </p>
          </div>

          {/* Trips Completed */}
          <div className="text-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-base mb-0.5">
              <FaRoute aria-hidden="true" className="mx-auto h-6 w-6 text-slate-700 sm:h-8 sm:w-8" />
            </div>
            <h4 className="text-base font-bold text-gray-900">
              {captain.tripsCompleted}
            </h4>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">
              Trips
            </p>
          </div>

          {/* Acceptance Rate */}
          <div className="text-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-base mb-0.5">
              <FaChartLine aria-hidden="true" className="mx-auto h-6 w-6 text-slate-700 sm:h-8 sm:w-8" />
            </div>
            <h4 className="text-base font-bold text-gray-900">
              {captain.acceptanceRate}
            </h4>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">
              Acceptance
            </p>
          </div>
        </div>

        {/* Live Status Notice */}
        <div className="mt-4 flex items-center justify-between px-2 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-500" : "bg-gray-400"
              }`}
            />
            {isOnline
              ? "Looking for nearby rides..."
              : "Go online to receive requests"}
          </span>
          <span className="text-gray-400 text-[11px]">Auto-accept: OFF</span>
        </div>
      </div>

      {/* Ride Popup Panel */}
      <RidePopupPanel
        rideRequest={rideRequest}
        ridePopupPanel={ridePopupPanel}
        setRidePopupPanel={setRidePopupPanel}
        onAcceptRide={handleAcceptRide}
        onDeclineRide={handleDeclineRide}
      />
    </div>
  );
}

export default CaptainHome;
