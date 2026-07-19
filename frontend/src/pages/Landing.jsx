import React from 'react'
import { Link } from "react-router-dom";

import bgImage from "../assets/landing.png";


function Landing() {
  return (
    <div>
      <div className=' h-screen w-full pt-5 flex justify-between flex-col bg-cover bg-center bg-no-repeat' 
        style={{
          backgroundImage: `url(${bgImage})`,   
        }}  
      >
        <img className='w-16 ml-4  mix-blend-screen' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK89Kvd8MeWsUHmy36tpZHsTb5aXF2H6VzdMtNJMHdjA&s=10" alt="" />
         
        <div className='bg-white pb-5 py-5 px-5'>
          <h2 className='text-3xl font-bold'>Get Started with Uber </h2>
          <Link to="/user-login" className=' inline-block w-full bg-black text-white py-4 mt-4 rounded' >Continue</Link>
        </div>
      </div>

    </div>
  )
}

export default Landing;