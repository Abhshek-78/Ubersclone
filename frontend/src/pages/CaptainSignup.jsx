import uberLogo from "../assets/Uberlogo.png";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";



function CaptainSignup() {
  const navigate = useNavigate();
  const [Firstname, SetFirstname] = useState("");
  const [Lastname, SetLastname] = useState("");
  const [email, Setemail] = useState("");
  const [password, setpassword] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicaleColor, setvehicaleColor] = useState("");
  const [vehicalePlate, setvehicalePlate] = useState("");
  const [vehicaleCapacity, setvehicaleCapacity] = useState("");
  const [vehicaleType, setvehicaleType] = useState("");

  const { Captain, setCaptain } = React.useContext(CaptainDataContext);

  const submitHadlers = async (e) => {
    e.preventDefault();

    const payload = {
      fullname: {
        firstname: Firstname,
        lastname: Lastname,
      },
      email,
      phone,
      password,
      vehical: {
        color: vehicaleColor,
        plate: vehicalePlate,
        capacity: Number(vehicaleCapacity),
        vehicaltype: vehicaleType,
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        payload
      );

      if (response.status === 201) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem('token', data.token);
        navigate('/Captain-home');
      }
    } catch (error) {
      console.error(error?.response?.data || error.message);
      alert(error?.response?.data?.message || 'Captain registration failed');
      return;
    } finally {
      SetFirstname("");
      SetLastname("");
      Setemail("");
      setpassword("");
      setPhone("");
      setvehicaleColor("");
      setvehicalePlate("");
      setvehicaleCapacity("");
      setvehicaleType("");
    }
  };
  return (
    <div className="p-3 flex flex-col justify-between h-screen">
      <img
        className="w-16   rounded mix-blend-multiply"
        src={uberLogo}
        alt=""
      />
      <div>
        <form
          action=""
          onSubmit={(e) => {
            submitHadlers(e);
          }}
        >
          <h5
            className="text-2xl 
                font-bold mb-6 
                text-black  
                text-left"
          >
            What's detail for Captain-register
          </h5>

          <div className="flex gap-2">
            <input
              type="text"
              required
              className="bg-[#eeee] rounded px-4 py-4 border w-1/2 placeholder:text-base text-black"
              placeholder="First name"
              name="First-name"
              value={Firstname}
              onChange={(e) => {
                SetFirstname(e.target.value);
              }}
            />
            <input
              type="text"
              className="bg-[#eeee] rounded px-4 py-4 border w-1/2 placeholder:text-base text-black"
              placeholder="Last name"
              value={Lastname}
              onChange={(e) => {
                SetLastname(e.target.value);
              }}
            />
          </div>

          <input
            type="Email"
            placeholder="Email"
            required
            className="bg-[#eeee] rounded px-4 py-4 border w-full mt-4 placeholder:text-base text-black"
            value={email}
            onChange={(e) => {
              Setemail(e.target.value);
            }}
          />
          <input
            type="Password"
            placeholder="Password"
            required
            className="bg-[#eeee] rounded px-4 py-4 border w-full mt-4 placeholder:text-base text-black"
            value={password}
            onChange={(e) => {
              setpassword(e.target.value);
            }}
          />
          <input
            type="tel"
            placeholder="Phone number"
            className="bg-[#eeee] rounded px-4 py-4 border w-full mt-4 placeholder:text-base text-black"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/*  new input fom here ane ke bad ye bnana hi*/}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              className="bg-[#eeee] rounded px-4 py-4 border w-1/2 text-black"
              placeholder="Vehicle Color"
              value={vehicaleColor}
              onChange={(e) => setvehicaleColor(e.target.value)}
            />

            <input
              type="text"
              className="bg-[#eeee] rounded px-4 py-4 border w-1/2 text-black"
              placeholder="Vehicle Number"
              value={vehicalePlate}
              onChange={(e) => setvehicalePlate(e.target.value)}
            />
          </div>

        
          <div className="flex gap-2 mt-4" >
            <input
              type="number"
              className="bg-[#eeee] rounded px-4 py-4 border w-1/2 text-black"
              placeholder="Vehicle Capacity"
              value={vehicaleCapacity}
              onChange={(e) => setvehicaleCapacity(e.target.value)}
            />

            <select
              className="bg-[#eeee] rounded px-4 py-4 border w-1/2 text-black"
              value={vehicaleType}
              onChange={(e) => setvehicaleType(e.target.value)}
            >
              <option value="">Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
              
            </select>
          </div>

          <button className="bg-[#111] p-10 mt-6 text-[#ffff] font-semibold rounded px-4 py-4  w-full placeholder:text-base ">
            Register_Captain
          </button>
        </form>

        <p className="text-center mt-4">
          Alredy have account?{" "}
          <Link to={"/captain-login"} className="text-blue-600">
            Login_captain here
          </Link>
        </p>
      </div>

      <div className="mt-3">
        <p className="text-[8px] leading-tight">
          The site generated by reCaptha and the{" "}
          <span className="underline">goolge privacy policies</span>
          <span className="underline">and Term of Service </span>
        </p>
      </div>
    </div>
  );
}

export default CaptainSignup;
