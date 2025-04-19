import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import { 
    MdLockReset, 
    MdSecurity, 
    MdPassword,
    MdEmail,
    MdShield,
    MdWarning,
    MdVerified,
    MdVpnKey
  } from 'react-icons/md';
  import { HiExternalLink } from 'react-icons/hi';
  import { FcGoogle } from 'react-icons/fc';
  import { FaGithub, FaMicrosoft } from 'react-icons/fa';
  import { showSimpleNotification } from './SimpleNotification';

const ForgotPassword = () => {
  const [stage, setStage] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  const handleDismissOAuth = () => {
    setIsOAuthUser(false);
    setEmailError('');
    setEmail('');
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setIsLoading(true);
    setOtpError('');
    
    try {
      const response = await fetch('https://it342-g3-neighbornet.onrender.com/api/auth/password/forgot?email=' + encodeURIComponent(email), {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }
  
      // Start countdown
      let timeLeft = 30;
      setResendTimer(timeLeft);
      
      const timer = setInterval(() => {
        timeLeft -= 1;
        setResendTimer(timeLeft);
        
        if (timeLeft === 0) {
          clearInterval(timer);
          setCanResend(true);
        }
      }, 1000);
  
      // Clear OTP fields
      setOtp(['', '', '', '', '', '']);
      // Focus on first OTP input
      document.getElementById('otp-0')?.focus();
  
    } catch (error) {
      setOtpError('Failed to resend OTP. Please try again.');
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    
    if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        return;
    }
  
    setIsLoading(true);
    try {
        const response = await fetch(`https://it342-g3-neighbornet.onrender.com/api/auth/check-provider?email=${encodeURIComponent(email)}`, {
            method: 'GET',
        });
        const data = await response.json();
        
        if (data.provider === 'google' || data.provider === 'github' || data.provider === 'microsoft') {
            setEmailError(
                `This account uses ${data.provider} login. Please reset your password through ${data.provider}.`
            );
            // Show alternative instructions
            setIsOAuthUser(true);
            return;
        }

        // Continue with normal password reset flow for non-OAuth users
        const resetResponse = await fetch('https://it342-g3-neighbornet.onrender.com/api/auth/password/forgot?email=' + encodeURIComponent(email), {
            method: 'POST',
        });
        if (!resetResponse.ok) throw new Error('Failed to send reset email');
        setStage(2);
    } catch (error) {
        setEmailError('Failed to send OTP. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  

  const OAuthUserMessage = ({ provider, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 p-6 rounded-lg"
    >
        <div className="flex items-center space-x-3 mb-4">
            {provider === 'google' && <FcGoogle className="w-8 h-8" />}
            {provider === 'github' && <FaGithub className="w-8 h-8" />}
            {provider === 'microsoft' && <FaMicrosoft className="w-8 h-8" />}
            <h3 className="text-xl font-semibold">Social Login Account</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
            This account uses {provider} for authentication. To change your password:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Visit {provider}'s account settings</li>
            <li>Look for security or password settings</li>
            <li>Follow {provider}'s password reset process</li>
        </ol>

        <div className="mt-6 flex justify-between items-center">
            <a
                href={getProviderPasswordResetLink(provider)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
                <span>Go to {provider} Account Settings</span>
                <HiExternalLink className="w-5 h-5" />
            </a>
            
            <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200"
            >
                Try Different Email
            </button>
        </div>
    </motion.div>
);

  const getProviderPasswordResetLink = (provider) => {
    switch (provider) {
        case 'google':
            return 'https://myaccount.google.com/security';
        case 'github':
            return 'https://github.com/settings/security';
        case 'microsoft':
            return 'https://account.live.com/password/reset';
        default:
            return '#';
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
  
    if (otp.some(digit => digit === '')) {
      setOtpError('Please enter the complete OTP');
      return;
    }
  
    setIsLoading(true);
    try {
      const otpValue = otp.join('');
      const response = await fetch(`https://it342-g3-neighbornet.onrender.com/api/auth/password/verify-otp?email=${encodeURIComponent(email)}&otp=${otpValue}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Invalid OTP');
      setStage(3);
    } catch (error) {
      setOtpError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await fetch('https://it342-g3-neighbornet.onrender.com/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otp.join(''),
          currentPassword,
          newPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      showSimpleNotification('Password reset successful! Please login with your new password.', 'success');
      navigate('/');
      
    } catch (error) {
      setPasswordError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
};

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl flex w-full max-w-6xl overflow-hidden">
        {/* Form Section */}
        <motion.div 
          className="w-full md:w-1/2 p-8"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {stage === 1 && (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
                onSubmit={handleEmailSubmit}
              >
                <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                <p className="text-gray-600">Don't worry, we'll help you reset it.</p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {isOAuthUser ? (
                    <OAuthUserMessage 
                    provider={emailError.split(' ')[2]} 
                    onDismiss={handleDismissOAuth}
                  />
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors duration-200 disabled:bg-blue-400"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <MdEmail className="w-5 h-5" />
                          </motion.div>
                          <span>Sending OTP...</span>
                        </div>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  )}

                  {emailError && !isOAuthUser && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <MdWarning className="w-4 h-4 mr-1" />
                      {emailError}
                    </p>
                  )}
                </div>
              </motion.form>
            )}

            {stage === 2 && (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
                onSubmit={handleOtpSubmit}
              >
                <h2 className="text-3xl font-bold text-gray-900">Enter OTP</h2>
                <p className="text-gray-600">We've sent a code to {email}</p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center">
                    <MdEmail className="w-5 h-5 mr-2" />
                    Can't find the email? Please check your spam/junk folder.
                  </p>
                </div>
                            
                <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                        <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className={`w-12 h-12 text-center text-xl border ${
                            otpError ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 ${
                            otpError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        } focus:border-transparent`}
                        onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !digit && index > 0) {
                            document.getElementById(`otp-${index - 1}`).focus();
                            }
                        }}
                        />
                    ))}
                    </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors duration-200 disabled:bg-blue-400"
                    >
                    {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <MdVpnKey className="w-5 h-5" />
                        </motion.div>
                        <span>Verifying OTP...</span>
                        </div>
                    ) : (
                        "Verify OTP"
                    )}
                    </button>

                    {otpError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                        <MdWarning className="w-4 h-4 mr-1" />
                        {otpError}
                    </p>
                    )}
                
                <p className="text-center text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    {canResend ? (
                        <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                        >
                        Resend
                        </button>
                    ) : (
                        <span className="text-gray-500">
                        Resend in {resendTimer}s
                        </span>
                    )}
                    </p>
              </motion.form>
            )}

            {stage === 3 && (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
                onSubmit={handlePasswordSubmit}
              >
                <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
                <p className="text-gray-600">Create a strong password for your account</p>

                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors duration-200 disabled:bg-blue-400"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <MdPassword className="w-5 h-5" />
                        </motion.div>
                        <span>Resetting Password...</span>
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  {passwordError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <MdWarning className="w-4 h-4 mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          className="hidden md:block w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 text-white"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {stage === 1 && (
                <motion.div
                  key="email-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-block p-6 bg-blue-500 rounded-full mb-4"
                    >
                      <MdLockReset className="w-20 h-20 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">Secure Password Recovery</h3>
                    <p className="text-blue-100 text-lg">
                      We understand that security is paramount. That's why we've implemented
                      a robust password recovery system to ensure your account remains protected.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4 mt-8">
                    <div className="flex items-center space-x-2">
                      <MdSecurity className="w-6 h-6 text-blue-200" />
                      <span className="text-blue-100">Secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MdShield className="w-6 h-6 text-blue-200" />
                      <span className="text-blue-100">Protected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MdVerified className="w-6 h-6 text-blue-200" />
                      <span className="text-blue-100">Verified</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div
                  key="otp-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-block p-6 bg-blue-500 rounded-full mb-4"
                    >
                      <MdVpnKey className="w-20 h-20 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">Two-Step Verification</h3>
                    <p className="text-blue-100 text-lg">
                      For added security, we've sent a verification code to your email.
                      This extra step helps ensure that only you can reset your password.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4 mt-8">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360, 360]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="flex items-center space-x-2"
                    >
                      <MdEmail className="w-8 h-8 text-blue-200" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {stage === 3 && (
                <motion.div
                  key="password-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-block p-6 bg-blue-500 rounded-full mb-4"
                    >
                      <MdPassword className="w-20 h-20 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">Create a Strong Password</h3>
                    <p className="text-blue-100 text-lg">
                      Choose a strong password that you haven't used before. A good password
                      should include numbers, letters, and special characters.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-blue-500/30 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-300">
                        <MdVerified className="w-6 h-6" />
                        <span>8+ characters</span>
                      </div>
                    </div>
                    <div className="bg-blue-500/30 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-300">
                        <MdVerified className="w-6 h-6" />
                        <span>Numbers</span>
                      </div>
                    </div>
                    <div className="bg-blue-500/30 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-300">
                        <MdVerified className="w-6 h-6" />
                        <span>Special chars</span>
                      </div>
                    </div>
                    <div className="bg-blue-500/30 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-300">
                        <MdVerified className="w-6 h-6" />
                        <span>Uppercase</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;