import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { message } from 'antd';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    console.log('token', token);
    if (token) {
      setToken(token);
      navigate('/dashboard'); // Redirect to your desired page within /dailystories
    } else {
      message.error('Authentication failed.');
      navigate('/');
    }
  }, [navigate, setToken]);

  return <div>Authenticating...</div>;
};

export default AuthCallback; 