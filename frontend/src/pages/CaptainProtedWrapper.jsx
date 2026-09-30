import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

function CaptainProtectedWraper({ children }) {
    const navigate = useNavigate();

    const { captain, setCaptain } = useContext(CaptainDataContext);

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

      
        if (!token) {
            setLoading(false);
            navigate("/captain-logout", { replace: true });
            return;
        }

    
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
               

                if (response.status === 200) {
                    setCaptain(response.data.captain);
                }
            })
            .catch((error) => {
                console.log("Captain authentication error:", error);

                localStorage.removeItem("token");
                setCaptain(null);

                navigate("/captain-login", { replace: true });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate, setCaptain]);

  
    if (isLoading) {
        return <div>Loading...</div>;
    }

  
    if (!captain) {
        return null;
    }

    return <>{children}</>;
}

export default CaptainProtectedWraper;