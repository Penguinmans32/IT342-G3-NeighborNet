import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../backendApi/NotificationContext';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Get the URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // If this is a popup window, send message to opener
      if (window.opener) {
        window.opener.postMessage(
          { type: 'oauth2_success', token },
          window.location.origin
        );
        window.close();
      } else {
        // Normal redirect flow
        showNotification({
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome back!'
        });
        navigate('/homepage');
      }
    } else if (error) {
      showNotification({
        type: 'error',
        title: 'Login Failed',
        message: error || 'An error occurred during social login'
      });
      navigate('/');
    }
  }, [navigate, showNotification]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing your login...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;