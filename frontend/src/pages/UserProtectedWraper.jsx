import { useContext ,useEffect} from "react"
import React  from 'react'
import { UserDataContext } from '../context/UserContext';
import {useNavigate } from 'react-router-dom';

function UserProtectedWraper({
  children
}) {
   const token=localStorage.getItem('token')
   const navigate=useNavigate()
   useEffect(()=>{
      if(!token){
     navigate('/user-signup')
   }
   },[token])
       
  return (
    <>
      {children}
    </>

  )
}

export default UserProtectedWraper