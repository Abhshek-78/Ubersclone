import uberLogo from "../assets/Uberlogo.png";
import React, { useState } from 'react'
import { Link } from "react-router-dom";
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import {useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../config";



function userLogin() {
  const [email,setemail]=useState('');
  const [password,setpassword]=useState('')
  const [userData,setUserdata]=useState({})
  const { user, setUser } = React.useContext(UserDataContext);

   const navigate = useNavigate();

  const submitHadlers=async (e)=>{
    e.preventDefault();
    const userData={
      email:email,
      password:password
    }
    const response = await axios.post(
        `${API_BASE_URL}/users/login`,
        userData
    );
    if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token',data.token)
        navigate('/home');
      }
      
  }
  
  return (
    <div className='p-7 flex flex-col justify-between h-screen'>
      <img className='w-16 rounded mix-blend-difference' src={uberLogo} alt="Uber" />
      <div>
        <form action=""  onSubmit={(e)=>{
          submitHadlers(e)
        }}>

        <h5 
          className='text-2xl 
            font-bold mb-6 
            text-black  mt-8
            text-left'>What's your email  & password
        </h5>

        <input type="text"
          required
          value={email}
          onChange={(e)=>{
            setemail(e.target.value);
          }}

          className='bg-[#eeee] rounded px-4 py-4 border w-full placeholder:text-base text-black'
          placeholder='demo123@example.com'
          name='mail'
        />
       
        <input type="password"
          placeholder='Demo@321' 
          required

          value={password}
          onChange={(e)=>{
            setpassword(e.target.value);
          }}

          className='bg-[#eeee] rounded px-4 py-4 border w-full mt-6 placeholder:text-base text-black'
        />
        <button 
           className='bg-[#111] p-10 mt-8 text-[#ffff] font-semibold rounded px-4 py-4  w-full placeholder:text-base '>
          Login
        </button> 
      </form>

        <p className='text-center mt-4'>New here? <Link to={'/user-signup'} className='text-blue-600'>Create new user account</Link></p>

      </div>

      <div className='mt-32'>
        <Link to={'/captain-login'} className='w-full bg-green-600   flex items-center justify-center text-[#ffff] font-semibold  px-4 py-4  rounded text-lg placeholder:text-base'>Sign in  as captain</Link>
      </div>
    </div>
  )
}

export default userLogin