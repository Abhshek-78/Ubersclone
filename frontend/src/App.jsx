import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserProtectedWraper from './pages/UserProtectedWraper';
import CaptainProtectedWraper from './pages/CaptainProtedWrapper';

import Home from './pages/Home';
import CaptainSignup from './pages/CaptainSignup';
import CaptainLogin from './pages/CaptainLogin';
import UserSignup from './pages/UserSignup';
import UserLogin from './pages/UserLogin';
import Landing from './pages/Landing';
import UserLogout from './pages/UserLogout';
import CaptainHome from './pages/CaptainHome';
import CaptainLogout from './pages/CaptainLogout';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/captain-signup" element={<CaptainSignup />} />
      <Route path="/captain-login" element={<CaptainLogin />} />
      <Route path="/user-signup" element={<UserSignup />} />
      <Route path="/user-login" element={<UserLogin />} />
      <Route path="/home" 
        element={<UserProtectedWraper><Home /></UserProtectedWraper>} />

      <Route path="/User-logout" element={<UserProtectedWraper><UserLogout /></UserProtectedWraper>} />
      <Route path="/Captain-home" element={<CaptainProtectedWraper><CaptainHome/></CaptainProtectedWraper  >} />
      <Route path="/captain-logout" element={<CaptainLogout/>}></Route>
    </Routes>
  );
}

export default App;