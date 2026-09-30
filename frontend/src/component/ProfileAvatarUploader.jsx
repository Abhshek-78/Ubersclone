import { useRef, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function resolvePhotoUrl(photo) {
  if (!photo) return "";
  if (/^https?:\/\//i.test(photo)) return photo;
  return `${API_BASE_URL}${photo.startsWith("/") ? photo : `/${photo}`}`;
}

function DefaultAvatar() {
  return <FaUserCircle aria-hidden="true" className="h-1/2 w-1/2" />;
}

function ProfileAvatarUploader({ photo, name, uploadPath, onUploaded, className = "" }) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const photoUrl = resolvePhotoUrl(photo);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      setError("Use a JPEG or PNG image up to 5 MB.");
      return;
    }

    setError("");
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}${uploadPath}`,
          { imageData: reader.result },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
        );
        onUploaded(response.data.photo);
      } catch (uploadError) {
        setError(uploadError.response?.data?.message || "Unable to upload profile picture.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setError("Unable to read that image.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        title="Change profile picture"
        aria-label={`Change profile picture for ${name || "profile"}`}
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500 transition hover:ring-2 hover:ring-black disabled:cursor-wait disabled:opacity-70"
      >
        {photoUrl ? <img src={photoUrl} alt={name || "Profile"} className="h-full w-full object-cover" /> : <DefaultAvatar />}
        <span className="absolute inset-x-0 bottom-0 bg-black/65 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-white">{isUploading ? "..." : "Edit"}</span>
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
      {error && <span role="alert" className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg bg-red-50 p-2 text-left text-[11px] font-semibold text-red-700 shadow-lg">{error}</span>}
    </div>
  );
}

export default ProfileAvatarUploader;
