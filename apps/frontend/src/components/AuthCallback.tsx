import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const query = useQuery();

  useEffect(() => {
    const token = query.get('token');
    console.log('token', token);
    if (token) {
      setToken(token);
      navigate('/');
    } else {
      message.error('Authentication failed.');
      navigate('/');
    }
  }, [navigate, setToken, query]);

  return <div>Authenticating...</div>;
};

export default AuthCallback; 