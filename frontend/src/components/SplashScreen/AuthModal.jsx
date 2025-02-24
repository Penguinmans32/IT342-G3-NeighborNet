  import { motion } from 'framer-motion';
  import { FaGoogle, FaGithub, FaMicrosoft, FaBookReader, FaUsers, FaChalkboardTeacher, FaHandshake } from 'react-icons/fa';
  import { MdEmail, MdLock, MdPerson } from 'react-icons/md';
  import Modal from './Modal';
  import FormInput from './FormInput';
  import { useNavigate } from 'react-router-dom';
  import { useState } from 'react';
  import { useAuth } from '../../backendApi/AuthContext';
  import { useNotification } from '../../backendApi/NotificationContext';
  import axios from 'axios';

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const checkPasswordStrength = (password) => {
    let strength = 0;
    const messages = [];

    if(password.length < 8) {
      messages.push('Password must be at least 8 characters long');
    }else {
      strength += 1;
    }

    if(!/[A-Z]/.test(password)) {
      messages.push('Password must contain at least one uppercase letter');
    }else {
      strength += 1;
    }

    if (!/[a-z]/.test(password)) {
      messages.push("Include at least one lowercase letter");
    } else {
      strength += 1;
    }

    if (!/\d/.test(password)) {
      messages.push("Include at least one number");
    } else {
      strength += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      messages.push("Include at least one special character");
    } else {
      strength += 1;
    }

    return {
      score: strength,
      messages,
      isStrong: strength >= 4
    };
  }

  const isLoginFormValid = (form) => {
    return form.username.trim() !== '' && form.password.trim() !== '';
  }


  const AuthModals = ({ isSignInOpen, isSignUpOpen, closeSignInModal, closeSignUpModal, setIsSignInOpen, setIsSignUpOpen }) => {
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const { login, register, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const [socialLoading, setSocialLoading] = useState({
      google: false,
      github: false,
      facebook: false
    });


    const [validationErrors, setValidationErrors] = useState({
      email: '',
      password: [],
    });

    const [passwordStrength, setPasswordStrength] = useState({
      score: 0,
      isStrong: false
    });


    const handleSocialLog = (e, provider, authUrl) => {
      e.preventDefault();
      e.stopPropagation();
      
      setSocialLoading((prev) => ({ ...prev, [provider]: true }));
      
      const width = 500;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
    
      try {
        const popup = window.open(
          authUrl,
          'socialLogin',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=1`
        );
    
        if (!popup) {
          showNotification({
            type: 'error',
            title: 'Popup Blocked',
            message: 'Please allow popups for this site to use social login.'
          });
          setSocialLoading((prev) => ({ ...prev, [provider]: false }));
          return;
        }
    
        const messageHandler = async (event) => {
          // Debug logging
          console.log('Message received:', event);
          console.log('Origin:', event.origin);
          console.log('Expected origin:', window.location.origin);
          
          // Accept messages from both backend and frontend URLs
          if (event.origin !== window.location.origin && 
              event.origin !== import.meta.env.VITE_APP_API_URL) {
            console.log('Invalid origin:', event.origin);
            return;
          }
    
          if (event.data?.type === 'oauth2_success') {
            const token = event.data.token;
            console.log('Received token:', token);
        
            if (token) {
              try {
                localStorage.setItem('token', token);
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                const response = await axios.get('http://localhost:8080/api/auth/user');
                const userData = response.data;
                
                localStorage.setItem('user', JSON.stringify(userData));
                
                setUser(userData); 
        
                window.removeEventListener('message', messageHandler);
                if (popup && !popup.closed) {
                  popup.close();
                }
        
                showNotification({
                  type: 'success',
                  title: 'Login Successful',
                  message: 'Welcome back!'
                });
        
                setSocialLoading((prev) => ({ ...prev, [provider]: false }));
        
                closeSignInModal();
        
                setTimeout(() => {
                  navigate('/homepage');
                }, 500);
              } catch (error) {
                console.error('Error fetching user data:', error);
                showNotification({
                  type: 'error',
                  title: 'Login Error',
                  message: 'Failed to fetch user data'
                });
              }
            }
          }
        };
    
        window.addEventListener('message', messageHandler);
    
        // Check popup status
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            window.removeEventListener('message', messageHandler);
            setSocialLoading((prev) => ({ ...prev, [provider]: false }));
          }
        }, 1000);
    
        // Cleanup after timeout
        setTimeout(() => {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkPopup);
          if (popup && !popup.closed) {
            popup.close();
          }
          setSocialLoading((prev) => ({ ...prev, [provider]: false }));
        }, 300000); // 5 minutes timeout
    
      } catch (error) {
        console.error('Social login error:', error);
        showNotification({
          type: 'error',
          title: 'Login Failed',
          message: 'An error occurred during social login'
        });
        setSocialLoading((prev) => ({ ...prev, [provider]: false }));
      }
    };
    


    const handleLoginSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      console.log('Login attempt with:', loginForm);
  
      try {
          const userData = await login(loginForm.username, loginForm.password);
          console.log('Login successful:', userData);
          
          closeSignInModal();
          showNotification({
              type: 'success',
              title: 'Welcome back!',
              message: 'You have successfully logged in'
          });
          navigate('/homepage');
      } catch (err) {
          console.error('Login error:', err);
          const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
          
          setError(errorMessage);
          
          if (errorMessage.includes('verify your email')) {
              showNotification({
                  type: 'warning',
                  title: 'Email Not Verified',
                  message: 'Please check your inbox and verify your email address to continue.',
                  duration: 8000
              });
          } else {
              showNotification({
                  type: 'error',
                  title: 'Login Failed',
                  message: errorMessage,
                  duration: 6000
              });
          }
      } finally {
          setLoading(false);
      }
  };

    const handleRegisterSubmit = async (e) => {
      e.preventDefault();
      setError('');

      if (!isValidEmail(registerForm.email)) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
        showNotification({
          type: 'error',
          title: 'Invalid Email',
          message: 'Please enter a valid email address',
          duration: 4000
        });
        return;
      }

    const passwordCheck = checkPasswordStrength(registerForm.password);
      if (!passwordCheck.isStrong) {
        setValidationErrors(prev => ({
          ...prev,
          password: passwordCheck.messages
        }));
        showNotification({
          type: 'error',
          title: 'Weak Password',
          message: 'Please create a stronger password',
          duration: 4000
        });
        return;
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        setError('Passwords do not match');
        showNotification({
          type: 'error',
          title: 'Password Mismatch',
          message: 'Please make sure your passwords match.',
          duration: 4000
        });
        return;
      }

      setLoading(true);
      try {
        await register(
          registerForm.username,
          registerForm.email,
          registerForm.password
        );
        closeSignUpModal();
        showNotification({
          type: 'success',
          title: 'Hi There!',
          message: 'Welcome to NeighborNet! Please check your email to verify your account.',
          duration: 8000
        });

        setTimeout(() => {
          showNotification({
            type: 'info',
            title: 'Check Your Inbox',
            message: `We've sent a verification link to ${registerForm.email}. Please verify your email to continue.`,
            duration: 10000
          });
        }, 1000);

        setIsSignInOpen(true);
      } catch (err) {
        setError(err.response?.data || 'An error occurred during registration');
        showNotification({
          type: 'error',
          title: 'Registration Failed',
          message: err.response?.data || 'An error occurred during registration',
          duration: 6000
        });
      } finally {
        setLoading(false);
      }
    };

      const handlePasswordChange = (e) => {
      const newPassword = e.target.value;
      setRegisterForm({ ...registerForm, password: newPassword });
      
      // Check password strength as user types
      const strengthCheck = checkPasswordStrength(newPassword);
      setPasswordStrength({
        score: strengthCheck.score,
        isStrong: strengthCheck.isStrong
      });
      setValidationErrors(prev => ({
        ...prev,
        password: strengthCheck.messages
      }));
    };

    const handleEmailChange = (e) => {
      const newEmail = e.target.value;
      setRegisterForm({ ...registerForm, email: newEmail });
      
      if (newEmail) {
        if (!isValidEmail(newEmail)) {
          setValidationErrors(prev => ({
            ...prev,
            email: 'Please enter a valid email (example@domain.com)'
          }));
        } else {
          setValidationErrors(prev => ({
            ...prev,
            email: ''
          }));
        }
      } else {
        // Clear validation if field is empty
        setValidationErrors(prev => ({
          ...prev,
          email: ''
        }));
      }
    };

    const inputVariants = {
      focus: { scale: 1.02, transition: { duration: 0.2 } },
      tap: { scale: 0.98 }
    };

    const switchToSignUp = () => {
      closeSignInModal();
      setTimeout(() => setIsSignUpOpen(true), 100);
    };

    const switchToSignIn = () => {
      closeSignUpModal();
      setTimeout(() => setIsSignInOpen(true), 100);
    };

    const socialButtons = [
      { 
        icon: FaGoogle, 
        text: 'Continue with Google',
        bgColor: 'hover:bg-red-50',
        iconColor: 'text-red-500',
        provider: 'google',
        authUrl: `${import.meta.env.VITE_APP_API_URL}/oauth2/authorize/google`
      },
      { 
        icon: FaGithub, 
        text: 'Continue with Github',
        bgColor: 'hover:bg-gray-50',
        iconColor: 'text-gray-700',
        provider: 'github',
        authUrl: `${import.meta.env.VITE_APP_API_URL}/oauth2/authorize/github`
      },
      { 
        icon: FaMicrosoft, 
        text: 'Continue with Microsoft',
        bgColor: 'hover:bg-blue-50',
        iconColor: 'text-blue-600',
        provider: 'microsoft',
        authUrl: `${import.meta.env.VITE_APP_API_URL}/oauth2/authorize/microsoft`
      }
    ];

    return (
      <>
        {/* Sign In Modal */}
        <Modal isOpen={isSignInOpen} onClose={closeSignInModal}>
          <div className="grid md:grid-cols-2">
          {/* Left Side - Image/Branding */}
              <div className="hidden md:block bg-gradient-to-br from-blue-500 to-purple-500 p-8 text-white">
              <div className="h-full flex flex-col justify-between max-w-sm">
                  {/* Header */}
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                    <p className="text-white/90">Continue your learning journey with your neighbors</p>
                  </div>

                  {/* Center Image with animation */}
                  <div className="flex justify-center items-center my-8">
                  <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-72 h-72 md:w-96 md:h-96"
                  >
                      <motion.img
                      src="/images/girl.jpg"
                      alt="Welcome back illustration"
                      className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110 rounded-lg" // Added rounded corners
                      whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                      />
                      {/* Enhanced glow effect */}
                      <div className="absolute inset-0 bg-white/20 rounded-lg blur-3xl -z-10 group-hover:bg-white/30 transition-colors duration-300" />
                  </motion.div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FaBookReader className="text-white" />
                      </div>
                      <p className="text-sm">Access to all community classes</p>
                  </div>
                  <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FaUsers className="text-white" />
                      </div>
                      <p className="text-sm">Connect with local experts</p>
                  </div>
                  </div>
              </div>
              </div>

            {/* Right Side - Form */}
            <div className="p-8 max-w-md mx-auto w-full">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">Welcome Back!</h3>
                  <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
                </div>

                {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                  {error}
                </div>
                )}

              <div className="space-y-4">
              <motion.div
                  animate={{
                    scale: loginForm.username.trim() !== '' ? 1 : 0.98,
                    opacity: loginForm.username.trim() !== '' ? 1 : 0.9
                  }}
                  transition={{ duration: 0.2 }}
                >
              <FormInput
                  icon={MdEmail}
                  placeholder="Username or Email"
                  type="text"
                  name="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value.trim() })}
                  className={`
                    ${loginForm.username.trim() === '' ? 'border-gray-200' : 'border-green-500'}
                  `}
                />
              </motion.div>

              <motion.div
              animate={{
                scale: loginForm.password !== '' ? 1 : 0.98,
                opacity: loginForm.password !== '' ? 1 : 0.9
              }}
              transition={{ duration: 0.2 }}
              >
                <FormInput
                  icon={MdLock}
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className={`
                    ${loginForm.password === '' ? 'border-gray-200' : 'border-green-500'}
                  `}
                />
              </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !isLoginFormValid(loginForm)}
                className={`w-full py-3 bg-gradient-to-r ${
                  isLoginFormValid(loginForm) 
                    ? 'from-blue-500 to-purple-500' 
                    : 'from-gray-400 to-gray-500'
                } text-white rounded-xl font-medium shadow-lg
                  hover:shadow-xl transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {socialButtons.map((button, index) => (
                    <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={(e) => handleSocialLog(e, button.provider, button.authUrl)}
                    disabled={socialLoading[button.provider]}
                    className={`w-full py-3 px-6 border border-gray-200 rounded-xl 
                              flex items-center justify-center space-x-3 ${button.bgColor} 
                              transition-all duration-300 hover:shadow-md bg-white
                              disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {socialLoading[button.provider] ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500" />
                    ) : (
                      <>
                        <button.icon className={`text-xl ${button.iconColor}`} />
                        <span className="font-medium text-gray-700">{button.text}</span>
                      </>
                    )}
                  </motion.button>
                  ))}
                </div>

                <p className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={switchToSignUp}
                    className="text-blue-500 hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
              </div>
            </div>
        </Modal>

        {/* Sign Up Modal */}
          <Modal isOpen={isSignUpOpen} onClose={closeSignUpModal}>
          <div className="grid md:grid-cols-2">
              {/* Left Side - Image/Branding */}
                  <div className="hidden md:block bg-gradient-to-br from-blue-500 to-purple-500 p-8 text-white">
                  <div className="h-full flex flex-col justify-between">
                      {/* Header */}
                      <div>
                      <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                      <p className="text-white/90">Start sharing and learning with neighbors</p>
                      </div>

                      {/* Center Image with animation */}
                      <div className="flex justify-center items-center my-8">
                      <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="relative w-100 h-100"
                      >
                          <img
                          src="/images/SharingSkills.jpeg" //
                          alt="Community illustration"
                          className="w-full h-full object-contain filter drop-shadow-lg"
                          />
                          {/* Optional: Add a subtle glow effect */}
                          <div className="absolute inset-0 bg-white/10 rounded-full blur-xl -z-10" />
                      </motion.div>
                      </div>

                      {/* Features */}
                      <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <FaChalkboardTeacher className="text-white" />
                          </div>
                          <p className="text-sm">Teach or learn from others</p>
                      </div>
                      <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <FaHandshake className="text-white" />
                          </div>
                          <p className="text-sm">Build meaningful connections</p>
                      </div>
                      </div>
                  </div>
                  </div>

             {/* Right Side - Form */}
              <div className="p-8 max-w-md mx-auto w-full">
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800">Create Account</h3>
                    <p className="text-gray-600 mt-2">Join our community today</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Username Input */}
                    <FormInput
                      icon={MdPerson}
                      placeholder="Username"
                      type="text"
                      name="username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    />

                   {/* Email Input with Validation */}
                    <div className="space-y-2">
                      <div className="relative">
                        <FormInput
                          icon={MdEmail}
                          placeholder="Email address"
                          type="email"
                          name="email"
                          value={registerForm.email}
                          onChange={handleEmailChange}
                          className={`
                            ${validationErrors.email ? 'border-red-500' : ''}
                            ${registerForm.email && !validationErrors.email ? 'border-green-500' : ''}
                            pr-10
                          `}
                        />
                        {/* Success checkmark */}
                        {registerForm.email && !validationErrors.email && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
                          >
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </div>

                      {/* Error message */}
                      {validationErrors.email && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-500 flex items-center gap-2"
                        >
                          <span>•</span>
                          {validationErrors.email}
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <FormInput
                        icon={MdLock}
                        placeholder="Password"
                        type="password"
                        name="password"
                        value={registerForm.password}
                        onChange={handlePasswordChange}
                      />
                      
                      {/* Password Strength Indicator */}
                      {registerForm.password && (
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-2 w-full rounded-full transition-colors duration-300 ${
                                  passwordStrength.score >= level
                                    ? [
                                        'bg-red-500',
                                        'bg-orange-500',
                                        'bg-yellow-500',
                                        'bg-lime-500',
                                        'bg-green-500'
                                      ][passwordStrength.score - 1]
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Password Requirements List */}
                          <ul className="text-sm space-y-1">
                            {validationErrors.password.map((message, index) => (
                              <li key={index} className="text-gray-600 flex items-center gap-2">
                                <span className={passwordStrength.isStrong ? "text-green-500" : "text-red-500"}>•</span>
                                {message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <FormInput
                      icon={MdLock}
                      placeholder="Confirm password"
                      type="password"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !passwordStrength.isStrong || validationErrors.email}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                              text-white rounded-xl font-medium shadow-lg
                              hover:shadow-xl transition-all duration-300
                              disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>

                  {/* Replace social buttons with a message */}
                  <div className="text-center text-sm text-gray-500">
                  <p>Want to use social sign-in?</p>
                  <button 
                      onClick={switchToSignIn}
                      className="text-blue-500 hover:underline font-medium"
                  >
                      Sign in with social accounts
                  </button>
                  </div>

                  <p className="text-center text-sm text-gray-500">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-blue-500 hover:underline">Terms</a>
                  {' • '}
                  <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
                  </p>

                  <p className="text-center text-gray-600">
                  Already have an account?{' '}
                  <button 
                      type="button"
                      onClick={switchToSignIn}
                      className="text-blue-500 hover:underline font-medium"
                  >
                      Sign In
                  </button>
                  </p>
              </form>
              </div>
          </div>
          </Modal>
      </>
    );
  };

  export default AuthModals;