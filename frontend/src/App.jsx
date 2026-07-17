import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import CaptainSignup from './pages/CaptainSignup';
import CaptainLogin from './pages/CaptainLogin';
import UserSignup from './pages/UserSignup';
import UserLogin from './pages/UserLogin';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/captain-signup" element={<CaptainSignup />} />
      <Route path="/captain-login" element={<CaptainLogin />} />
      <Route path="/user-signup" element={<UserSignup />} />
      <Route path="/user-login" element={<UserLogin />} />
    </Routes>
  );
}

export default App;