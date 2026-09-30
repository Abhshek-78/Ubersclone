import { useContext, useEffect, useState } from "react";
import LocationSearchpanel from "../component/LocationSearchpanel";
import Openbookpanel from "../component/Openbookpanel";
import ConfirmRidePanel from "../component/Confirmridepanel";
import LookingForDriverPanel from "../component/LookingForDriverPanel";
import WaitingForDriverPanel from "../component/WaitingForDriverPanel";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useSocket } from "../context/useSocket";
import { UserDataContext } from "../context/UserContext";
import LiveMap from "../component/LiveMap";
import ProfileAvatarUploader from "../component/ProfileAvatarUploader";
import { FaArrowDown, FaArrowUp, FaChevronDown, FaChevronUp } from "react-icons/fa";

function getUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]))._id;
  } catch {
    return null;
  }
}

function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHomePanelMinimized, setIsHomePanelMinimized] = useState(false);
  const [vehicalpanel, setVehicalpanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [lookingForDriverPanel, setLookingForDriverPanel] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [activeLocationField, setActiveLocationField] = useState("pickup");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fares, setFares] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [etaSeconds, setEtaSeconds] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [ridePhase, setRidePhase] = useState("pickup");
  const [profileOpen, setProfileOpen] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const { sendMessage, receiveMessage, isConnected } = useSocket();

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation || locationRequested || pickup.trim()) return;

    setLocationRequested(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/maps/get-address`, {
          params: { latitude: coords.latitude, longitude: coords.longitude },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPickup(response.data.placeName || "Current location");
      } catch {
        setPickup("Current location");
      }
    }, () => {
      setLocationRequested(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  };

  const loadRideHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRideHistory(Array.isArray(response.data) ? response.data : []);
    } catch {
      setRideHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isConnected) return undefined;

    const userId = getUserId();
    if (userId) sendMessage("join", { userType: "user", userId });

    const removeAcceptedListener = receiveMessage("ride-accepted", (ride) => {
      if (!ride?.captain) return;

      setDriverData({
        rideId: ride.rideId,
        name: ride.captain.name || "Captain",
        email: ride.captain.email || "",
        vehicleColor: ride.captain.vehicle?.color || "",
        vehicleCapacity: ride.captain.vehicle?.capacity || "",
        vehicleName: ride.captain.vehicle?.vehicaltype || "",
        vehicleNumber: ride.captain.vehicle?.plate || "",
        vehicleType: ride.captain.vehicle?.vehicaltype || "car",
        phone: ride.captain.phone || "",
        price: ride.fare,
        otp: ride.otp || "",
        rating: ride.captain.rating || "New",
      });
      setEtaSeconds(null);
      setCaptainLocation(ride.captain.location || null);
      setRoute(ride.route || null);
      setRidePhase("pickup");
      setIsHomePanelMinimized(true);
      setLookingForDriverPanel(false);
      setWaitingForDriver(true);
    });

    const removeLocationListener = receiveMessage("captain-location", (update) => {
      if (update?.location) setCaptainLocation(update.location);
      if (update?.route) setRoute(update.route);
      if (update?.phase) setRidePhase(update.phase);
      if (update?.etaSeconds !== undefined) setEtaSeconds(update.etaSeconds);
    });

    const removeCompletedListener = receiveMessage("ride-completed", () => {
      setDriverData(null);
      setEtaSeconds(null);
      setCaptainLocation(null);
      setRoute(null);
      setWaitingForDriver(false);
    });

    const removeCancelledListener = receiveMessage("ride-cancelled", () => {
      setDriverData(null);
      setEtaSeconds(null);
      setCaptainLocation(null);
      setRoute(null);
      setRidePhase("pickup");
      setWaitingForDriver(false);
    });

    return () => {
      removeAcceptedListener();
      removeLocationListener();
      removeCompletedListener();
      removeCancelledListener();
    };
  }, [isConnected, receiveMessage, sendMessage]);

  useEffect(() => receiveMessage("ride-rejected", () => {
    setLookingForDriverPanel(false);
    setWaitingForDriver(false);
    alert("A nearby captain declined this ride. Please try again.");
  }), [receiveMessage]);
  const handleConfirmRide = async () => {
    setConfirmRidePanel(false);
    setLookingForDriverPanel(true);
    try {
      await createRide(selectedVehicle?.vehicleType || selectedVehicle?.type || "car");
    } catch (error) {
      setLookingForDriverPanel(false);
      alert(error.response?.data?.message || "Unable to book this ride.");
    }
  };

  async function findTrip(e) {
    if (e) e.preventDefault();

    if (!pickup.trim() || !destination.trim()) {
      alert("Please enter both pickup and destination locations.");
      return;
    }

    setIsExpanded(false);
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/getFare`, {
        params: { pickup, destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setFares(response.data);
      setVehicalpanel(true);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to calculate the fare.");
    }

  }
  async function createRide(vehicleType){
    return axios.post(`${API_BASE_URL}/rides/create`,{
      pickup,
      destination,
      vehicleType
    },{
      headers:{
        Authorization:`Bearer ${localStorage.getItem('token')}`
      }
    })
  }

  const handleCancelRide = () => {
    if (!driverData?.rideId || !window.confirm("Are you sure you want to cancel this ride?")) return;

    sendMessage("cancel-ride", { rideId: driverData.rideId, userId: getUserId() });
    setDriverData(null);
    setEtaSeconds(null);
    setCaptainLocation(null);
    setRoute(null);
    setRidePhase("pickup");
    setWaitingForDriver(false);
  };

  useEffect(() => {
    if (!waitingForDriver || etaSeconds === null || etaSeconds <= 0) return undefined;
    const interval = setInterval(() => setEtaSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(interval);
  }, [waitingForDriver, etaSeconds]);

  const etaText = etaSeconds === null
    ? null
    : etaSeconds < 60 ? `${etaSeconds}s` : `${Math.ceil(etaSeconds / 60)} min`;

  return (
    <div className="h-screen relative overflow-hidden">
      <div className="h-dvh w-full">
        <LiveMap
          pickup={pickup}
          destination={destination}
          captainLocation={captainLocation}
          route={route}
          vehicleType={driverData?.vehicleType || selectedVehicle?.vehicleType || "car"}
          followCaptain={ridePhase === "pickup"}
        />
      </div>

      {/* Main Search Panel */}
      <div
        className={`bg-white absolute bottom-0 w-full p-5 rounded-t-2xl transition-[transform,height] duration-500 ease-in-out z-10 ${
          isHomePanelMinimized ? "translate-y-full pointer-events-none" : "translate-y-0"
        } ${isExpanded ? "h-full" : "h-auto"}`}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-2xl font-bold text-black">Find the place</h4>
          <div className="flex items-center gap-2">
            {isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Collapse search"
                title="Collapse search"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black hover:bg-gray-200"
              >
                <FaArrowDown aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsHomePanelMinimized(true);
                setIsExpanded(false);
              }}
              aria-label="Minimize home panel"
              title="Minimize home panel"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black hover:bg-gray-200"
            >
              <FaChevronDown aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={findTrip} className="relative">
          <div className="line absolute h-16 w-1 left-4 top-6 bg-slate-600 rounded-full" />

          <input
            onFocus={() => {
              setActiveLocationField("pickup");
              setIsHomePanelMinimized(false);
              setIsExpanded(true);
              fetchCurrentLocation();
              setVehicalpanel(false);
              setConfirmRidePanel(false);
              setLookingForDriverPanel(false);
            }}
            className="bg-[#eee] w-full px-8 text-black py-2 text-base mt-2 rounded-lg outline-none"
            type="text"
            placeholder="pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />

          <input
            onFocus={() => {
              setActiveLocationField("destination");
              setIsHomePanelMinimized(false);
              setIsExpanded(true);
              setConfirmRidePanel(false);
              setLookingForDriverPanel(false);
            }}
            className="bg-[#eee] w-full px-8 py-2 text-base mt-4 rounded-lg outline-none text-black"
            type="text"
            placeholder="destination location"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />

          <button
            type="submit"
            className="bg-black mt-4 w-full px-8 py-2 rounded font-bold text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            Find ride
          </button>
        </form>

        {isExpanded && (
          <div className="mt-6">
            <p className="text-gray-500 text-sm font-semibold mb-2">
              Recent Searches / Suggestions
            </p>
            <LocationSearchpanel
              query={activeLocationField === "pickup" ? pickup : destination}
              onSelectLocation={(loc) => {
                if (activeLocationField === "pickup") {
                  setPickup(loc);
                  setActiveLocationField("destination");
                } else {
                  setDestination(loc);
                  // Only sets destination now; does not auto-open the ride panel
                }
              }}
            />
          </div>
        )}
      </div>

      {isHomePanelMinimized && (
        <button
          type="button"
          onClick={() => setIsHomePanelMinimized(false)}
          aria-label="Restore home panel"
          title="Restore home panel"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] left-1/2 z-40 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl ring-1 ring-black/10 transition hover:bg-gray-50 active:scale-95 sm:h-12 sm:w-12"
        >
          <FaChevronUp aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}

      <div className="absolute top-4 right-4 z-30">
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-gray-900 shadow-lg">
          <ProfileAvatarUploader
            photo={user?.photo}
            name={user?.fullname?.firstname || "Profile"}
            uploadPath="/users/profile/photo"
            onUploaded={(photo) => setUser((currentUser) => ({ ...currentUser, photo }))}
            className="h-8 w-8"
          />
          <button
            type="button"
            onClick={() => {
              const nextOpen = !profileOpen;
              setProfileOpen(nextOpen);
              if (nextOpen) loadRideHistory();
            }}
            className="max-w-24 truncate"
          >
            {user?.fullname?.firstname || "Profile"}
          </button>
        </div>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="border-b border-gray-100 pb-3">
              <p className="font-bold text-gray-900">
                {user?.fullname?.firstname} {user?.fullname?.lastname || ""}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              {user?.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
            </div>
            <div className="py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Current ride</p>
              {waitingForDriver && driverData ? (
                <p className="mt-1 text-sm font-semibold text-gray-800">With {driverData.name} • {driverData.vehicleName}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">No active ride</p>
              )}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Ride history</p>
              {historyLoading && <p className="mt-2 text-sm text-gray-500">Loading rides...</p>}
              {!historyLoading && rideHistory.length === 0 && <p className="mt-2 text-sm text-gray-500">No rides yet</p>}
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                {rideHistory.map((ride) => (
                  <div key={ride._id} className="rounded-lg bg-gray-50 p-2 text-xs">
                    <p className="font-semibold text-gray-800">{ride.pickup} to {ride.destination}</p>
                    <p className="mt-1 text-gray-500">{ride.vehicleType} • ₹{ride.fare} • {ride.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ride Options Panel */}
      <Openbookpanel
        fares={fares}
        vehicalpanel={vehicalpanel}
        setVehicalpanel={setVehicalpanel}
        setSelectedVehicle={setSelectedVehicle}
        setConfirmRidePanel={setConfirmRidePanel}

      />

      {/* Confirm Ride Panel */}
      <ConfirmRidePanel
        confirmRidePanel={confirmRidePanel}
        setConfirmRidePanel={setConfirmRidePanel}
        selectedVehicle={selectedVehicle}
        pickup={pickup}
        destination={destination}
        onConfirm={handleConfirmRide}
      />

      {/* Searching Driver Panel */}
      <LookingForDriverPanel
        lookingForDriverPanel={lookingForDriverPanel}
        setLookingForDriverPanel={setLookingForDriverPanel}
        selectedVehicle={selectedVehicle}
        pickup={pickup}
        destination={destination}
        confirmRidePanel={confirmRidePanel}
        setConfirmRidePanel={setConfirmRidePanel}
        onConfirm={handleConfirmRide}
      />

      {/* Accepted / Waiting for Driver Panel */}
      <WaitingForDriverPanel
        waitingForDriver={waitingForDriver}
        setWaitingForDriver={setWaitingForDriver}
        driverData={driverData}
        pickup={pickup}
        destination={destination}
        etaText={etaText}
        ridePhase={ridePhase}
        onCancelRide={handleCancelRide}
      />

      {driverData && !waitingForDriver && (
        <button
          type="button"
          onClick={() => setWaitingForDriver(true)}
          aria-label="Open active ride"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black"><FaArrowUp aria-hidden="true" className="h-3.5 w-3.5" /></span>
          <span>Active ride{etaText ? ` · ${etaText}` : ""}</span>
        </button>
      )}
    </div>
  );
}

export default Home;