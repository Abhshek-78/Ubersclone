import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapimage from "../assets/map.png";
import RidePopupPanel from "../component/RidePopupPanel";
import { useSocket } from "../context/useSocket";

function getCaptainId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]))._id;
  } catch {
    return null;
  }
}

function CaptainHome() {
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(true);
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const { sendMessage, receiveMessage, isConnected } = useSocket();
  const captainId = getCaptainId();
  const hasJoinedRef = useRef(false);

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => join({ ltd: coords.latitude, log: coords.longitude }),
        ({ coords }) => {
          hasJoinedRef.current = true;
          join({ ltd: coords.latitude, log: coords.longitude });
        },
        () => {
          hasJoinedRef.current = true;
          join(undefined);
        },
      );
    } else {
      hasJoinedRef.current = true;
      join(undefined);
    }

    const watchId = navigator.geolocation?.watchPosition(
      ({ coords }) => {
        const location = { ltd: coords.latitude, log: coords.longitude };
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
    };
  }, [captainId, receiveMessage, sendMessage]);

  useEffect(() => {
    if (captainId) sendMessage("captain-status", { captainId, isOnline });
  }, [captainId, isOnline, isConnected, sendMessage]);

  useEffect(() => receiveMessage("socket-error", ({ message }) => {
    console.error("Socket registration failed:", message);
  }), [receiveMessage]);

  const captain = {
    name: "Harsh Sharma",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRka8OSfIO41jxvfWrBFooMaesx6XulbwxE3MClQYZ0nA&s=10",
    rating: "4.92",
    vehicle: "Swift Dzire • UP 16 AB 4521",
    todayEarnings: "1,845.50",
    hoursOnline: "6.5",
    tripsCompleted: 11,
    acceptanceRate: "94%",
  };

  const handleLogout = () => {
    navigate("/captain-login");
  };

  const handleAcceptRide = () => {
    if (!rideRequest?.rideId || !captainId) return;
    sendMessage("accept-ride", { rideId: rideRequest.rideId, captainId });
    setRidePopupPanel(false);
    navigate("/Ongoing-ride", { state: { ride: rideRequest } });
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
      {/* Background Map View */}
      <div
        className="h-dvh w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${mapimage})` }}
      />

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
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
              <img
                src={captain.photo}
                alt={captain.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-black"
              />
              <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                ★ {captain.rating}
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
              <img
                src="https://cdn-icons-png.flaticon.com/128/11138/11138644.png"
                className="h-8 ml-4 w-8 align"
                alt="online hours"
              />
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
              <img
                src="https://cdn-icons-png.flaticon.com/128/7571/7571054.png"
                alt="trips"
                className="h-8 ml-4 w-8 align"
              />
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
              <img
                src="https://cdn-icons-png.flaticon.com/128/12095/12095494.png"
                alt="acceptance"
                className="h-8 ml-4 w-8 align"
              />
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
