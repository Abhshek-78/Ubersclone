import React, { createContext, useState,useContext } from 'react'
export const CaptainDataContext=createContext()




function CaptainContext({children}) {
    const [captain,setCaptain]=useState(null);
    const [isLoding,setIsLoding]=useState(false);
    const [error,setError]=useState(null);

    const updateCaptain=(CaptainData)=>{
      setCaptain(CaptainData)
    };
    const value={
      captain,
      setCaptain,
      isLoding,
      setIsLoding,
      error,
      setError,
      updateCaptain
    }
  return (
    <CaptainDataContext.Provider value={value}>
      {children}
    </CaptainDataContext.Provider>
  )
}

export default CaptainContext