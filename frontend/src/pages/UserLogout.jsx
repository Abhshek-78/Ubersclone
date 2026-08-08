import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserProtectedWraper from "./UserProtectedWraper";

function UserLogout() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                const token = localStorage.getItem("token");

                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/users/logout`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                localStorage.removeItem("token");
                navigate("/user-login");
            } catch (error) {
                console.error(error.response?.data || error.message);
            }
        };

        logout();
    }, [navigate]);

    return <div>Logging out...</div>;
}

export default UserLogout;