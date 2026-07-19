import React from 'react'
import axios from 'axios'
import { data } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

function UserLogout() {
    const token=localStorage.getItem('token')
    const navigate=useNavigate()
     axios.get(
        `${import.meta.env.VITE_BASE_URL}/users//user-logout`,{
        headers: {
            Authorization :`Bearer ${token}`
        }
    }).then((response)=>{
        if (response.status===200) {
            localStorage.removeItem('token')
            navigate('/user-login')

        }
        
    })

  return (
    <div>UserLogout</div>
  )
}

export default UserLogout