import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';

function UserSignup() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, Setemail] = useState('');
  const [password, setpassword] = useState('');
 

  const navigate = useNavigate();

  const { user, setUser } = React.useContext(UserDataContext);

  const submitHadlers = async (e) => {
    e.preventDefault();

    const newUser = {
      fullname: {
        firstname: firstname,
        lastname: lastname,
      },
      email: email,
      password: password
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser
      );
      console.log(response.data);

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
         localStorage.setItem('token',data.token)
        navigate('/home');
      }

      setFirstname('');
      setLastname('');
      Setemail('');
      setpassword('');

   

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='p-7 flex flex-col justify-between h-screen'>
      <img
        className='w-16 rounded mix-blend-difference'
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6UR4arY3Uf0cQ-X-jBCGKxhozmz_deTFf5dU1F4FEcA&s=10"
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
            className='text-2xl font-bold mb-6 text-black mt-8 text-left'>
            What's detail for register
          </h5>

          <div className='flex gap-2'>
            <input
              type="text"
              required
              className='bg-[#eeee] rounded px-4 py-4 border w-1/2 placeholder:text-base text-black'
              placeholder='First name'
              name='First-name'
              value={firstname}
              onChange={(e) => {
                setFirstname(e.target.value);
              }}
            />

            <input
              type="text"
              className='bg-[#eeee] rounded px-4 py-4 border w-1/2 placeholder:text-base text-black'
              placeholder='Last name'
              value={lastname}
              onChange={(e) => {
                setLastname(e.target.value);
              }}
            />
          </div>

          <input
            type="Email"
            placeholder='Email'
            required
            className='bg-[#eeee] rounded px-4 py-4 border w-full mt-6 placeholder:text-base text-black'
            value={email}
            onChange={(e) => {
              Setemail(e.target.value);
            }}
          />

          <input
            type="Password"
            placeholder='Password'
            required
            className='bg-[#eeee] rounded px-4 py-4 border w-full mt-6 placeholder:text-base text-black'
            value={password}
            onChange={(e) => {
              setpassword(e.target.value);
            }}
          />

          <button
            className='bg-[#111] p-10 mt-6 text-[#ffff] font-semibold rounded px-4 py-4 w-full placeholder:text-base'>
            Create Account
          </button>

        </form>

        <p className='text-center mt-4'>
          Alredy have account?
          <Link to={'/user-login'} className='text-blue-600'>
            Login here
          </Link>
        </p>

      </div>

      <div className='mt-32'>
        <p className='text-[7px] leading-tight'>
          By proceeding ,your consent to call WhatApp and SMS message,including by
          autometed mean from uber and It's afiliated to number provide .
        </p>
      </div>

    </div>
  );
}

export default UserSignup;