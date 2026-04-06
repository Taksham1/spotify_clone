import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';

const AuthManager = ({ onLogin }) => {
  const [view, setView] = useState('landing'); 
  // views: landing, login, signup, forgot_password

  if (view === 'landing') return <LandingPage onNavigate={setView} />;
  if (view === 'login') return <Login onLogin={onLogin} onNavigate={setView} />;
  if (view === 'signup') return <Signup onNavigate={setView} />;
  if (view === 'forgot_password') return <ForgotPassword onNavigate={setView} />;

  return null;
};

export default AuthManager;
