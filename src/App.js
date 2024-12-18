import React, { useState } from 'react';
import './App.css';
import Main from './pages/MainPage';
import Login from './pages/LoginPage'
import PrivateRoute from './components/PrivateRoute';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="login" element={<Login/>}/>
        <Route path="/" element={<PrivateRoute><Main /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
