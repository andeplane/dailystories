import React, { useState } from 'react';
import { Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { login, logout, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
    } catch (error) {
      message.error('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      message.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.displayName || user?.email}</span>
          <Button onClick={handleLogout} loading={loading}>
            Logout
          </Button>
        </>
      ) : (
        <Button type="primary" onClick={handleLogin} loading={loading}>
          Login with Google
        </Button>
      )}
    </div>
  );
};

export default LoginButton; 