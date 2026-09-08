import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

function UserProtectedWraper({ children }) {
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserDataContext);

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

       

        // No token
        if (!token) {
            setLoading(false);
            navigate("/user-login", { replace: true });
            return;
        }

        axios
            .get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                

                if (response.status === 200) {
                    setUser(response.data);
                }
            })
            .catch((error) => {
                console.log(
                    "Profile error:",
                    
                );

                localStorage.removeItem("token");
                setUser(null);

                navigate("/user-login", { replace: true });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate, setUser]);

  
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h2 className="text-2xl font-bold">
                    Loading...
                </h2>
            </div>
        );
    }

 
    if (!user) {
        return null;
    }

   
    return children;
}

export default UserProtectedWraper;