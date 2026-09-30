import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import uberLogo from "../assets/Uberlogo.png";
import { API_BASE_URL } from "../config";

function CaptainLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setCaptain } = useContext(CaptainDataContext);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();

        const captainData = {
            email: email,
            password: password,
        };

        try {
            const response = await axios.post(
                `${API_BASE_URL}/captains/login`,
                captainData
            );

           

            if (response.status === 200) {
                const data = response.data;

             
                setCaptain(data.captain);

                localStorage.setItem("token", data.token);

                navigate("/Captain-home");
            }
        } catch (error) {
            console.error("Captain login failed:", error);

            if (error.response) {
                console.error(
                    "Server error:",
                    error.response.data
                );
            } else if (error.request) {
                console.error(
                    "No response from server. Check backend/server."
                );
            } else {
                console.error(
                    "Request error:",
                    error.message
                );
            }
        }

        
        setEmail("");
        setPassword("");
    };

    return (
        <div className="p-7 flex flex-col justify-between h-screen">

          
            <img
                className="w-16 rounded mix-blend-multiply"
                src={uberLogo}
                alt="Captain"
            />

            <div>

              
                <form onSubmit={submitHandler}>

                    <h5
                        className="
                            text-2xl
                            font-bold
                            mb-6
                            text-black
                            mt-2
                            text-left
                        "
                    >
                        What's your email & password
                    </h5>

              
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                            bg-[#eeee]
                            rounded
                            px-4
                            py-4
                            border
                            w-full
                            placeholder:text-base
                            text-black
                        "
                        placeholder="demo123@example.com"
                        name="email"
                    />

                 
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                            bg-[#eeee]
                            rounded
                            px-4
                            py-4
                            border
                            w-full
                            mt-6
                            placeholder:text-base
                            text-black
                        "
                        placeholder="Demo@321"
                        name="password"
                    />

               
                    <button
                        type="submit"
                        className="
                            bg-[#111]
                            mt-8
                            text-white
                            font-semibold
                            rounded
                            px-4
                            py-4
                            w-full
                        "
                    >
                        Login
                    </button>

                </form>

             
                <p className="text-center mt-4">
                    Join a fleet?{" "}

                    <Link
                        to="/captain-signup"
                        className="text-blue-600"
                    >
                        Register as captain
                    </Link>
                </p>

            </div>

       
            <div className="mt-32">

                <Link
                    to="/user-login"
                    className="
                        w-full
                        bg-orange-400
                        flex
                        items-center
                        justify-center
                        text-white
                        font-semibold
                        px-4
                        py-4
                        rounded
                        text-lg
                    "
                >
                    Sign in as user
                </Link>

            </div>

        </div>
    );
}

export default CaptainLogin;