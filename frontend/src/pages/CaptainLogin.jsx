import React, { useState } from 'react'
import { Link } from "react-router-dom";
function CaptainLogin() {
  const [email,setemail]=useState('');
  const [password,setpassword]=useState('')
  const [captainData,setCaptaindata]=useState({})
  
  const submitHadler = (e) => {
  e.preventDefault();

  const data = {
    email,
    password
  };

  console.log(data);

  setCaptaindata(data); 
  setemail('');
  setpassword('');
  };
  return (
    
    <div className='p-7 flex flex-col justify-between h-screen'>
          <img className='w-16   rounded mix-blend-multiply' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYHo1ccLWKoeQ7KSWkeLAUmSC0xyDNJD3Dz5GqSZMqCQ&s=10" alt="" />
          <div>
            <form onSubmit={(e)=>{
              submitHadler(e)
            }}>
    
            <h5 
              className='text-2xl 
                font-bold mb-6 
                text-black  mt-2
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
    
            <p className='text-center mt-4'>Join a fleet? <Link to={'/captain-signup'} className='text-blue-600'>Register as captain</Link></p>
    
          </div>
    
          <div className='mt-32'>
            <Link to={'/user-login'} className='w-full bg-orange-400  flex items-center justify-center text-[#ffff] font-semibold  px-4 py-4  rounded text-lg placeholder:text-base'>Sign in  as user</Link>
          </div>
        </div>
  )
}

export default CaptainLogin