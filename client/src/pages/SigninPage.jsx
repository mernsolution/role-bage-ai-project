

import React, { useState } from 'react';
import { Eye, EyeOff, Store, User, Lock } from 'lucide-react';
import axiosInstance from '../utility/baseURL';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const SigninPage = () => {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
 const handleSignUpClick = () => {
    navigate('/sign-up');
  };

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    const isLongEnough = password.length >= 8;

    return {
      isValid: hasNumber && hasSpecialChar && isLongEnough,
      hasNumber,
      hasSpecialChar,
      isLongEnough
    };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must be at least 8 characters.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axiosInstance.post("/sign-in", {
          username: formData.username,
          password: formData.password,
          rememberMe: agreeTerms,
        });

        if (response.status === 200) {
          toast.success(response.data.message);
          setIsAuthenticated(true);
          navigate("/dashboard");
        }
      } catch (error) {
        toast.error(error.response?.data?.message);
      }
    }
  };


  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In Account</h2>
            <p className="text-gray-600">Join us and start managing your shops</p>
          </div>

          <div className="space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                id="agreeTerms"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                Remember Me
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
            >
              Create Account
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button     onClick={handleSignUpClick} className="text-purple-600 hover:text-purple-800 font-medium">Sign Up</button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-32 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content */}
        <div className="text-center z-10 px-8">
          <div className="mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Store className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Manage Your
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Business Empire
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
            Connect all your shops in one powerful platform and take control of your retail success
          </p>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-16 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
