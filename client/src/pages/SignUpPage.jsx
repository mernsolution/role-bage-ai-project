import React, { useState } from 'react';
import { Eye, EyeOff, Plus, X, Store, User, Lock } from 'lucide-react';
import axiosInstance from '../utility/baseURL';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    shopNames: ['', '', '']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [shopNameStatus, setShopNameStatus] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null);

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

    // Check username availability in real-time
    if (field === 'username') {
      checkUsernameAvailability(value);
    }
  };

  const checkUsernameAvailability = async (username) => {
    // Skip API call if empty
    if (!username.trim()) {
      setUsernameStatus(null);
      return;
    }

    try {
      const res = await axiosInstance.get(`/check-username?userName=${encodeURIComponent(username.trim())}`);
      setUsernameStatus(res.data.available ? 'available' : 'not available');
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameStatus('error');
    }
  };

  const handleShopNameChange = async (index, value) => {
    const newShopNames = [...formData.shopNames];
    newShopNames[index] = value;

    setFormData(prev => ({
      ...prev,
      shopNames: newShopNames
    }));

    // Skip API call if empty
    if (!value.trim()) {
      setShopNameStatus(prev => ({ ...prev, [index]: null }));
      return;
    }

    try {
      // Fixed: Send shopName as query parameter, not in body
      const res = await axiosInstance.get(`/check-shop-name?shopName=${encodeURIComponent(value.trim())}`);

      setShopNameStatus(prev => ({
        ...prev,
        [index]: res.data.available ? 'available' : 'not available'
      }));
    } catch (error) {
      console.error('Error checking shop name:', error);
      setShopNameStatus(prev => ({ ...prev, [index]: 'error' }));
    }
  };

  const addShopName = () => {
    if (formData.shopNames.length < 6) {
      setFormData(prev => ({
        ...prev,
        shopNames: [...prev.shopNames, '']
      }));
    }
  };

  const removeShopName = (index) => {
    if (formData.shopNames.length > 3) {
      const newShopNames = formData.shopNames.filter((_, i) => i !== index);
      const newStatus = { ...shopNameStatus };
      delete newStatus[index];

      setFormData(prev => ({
        ...prev,
        shopNames: newShopNames
      }));
      setShopNameStatus(newStatus);
    }
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
    } else if (usernameStatus === 'not available') {
      newErrors.username = 'Username is already taken. Please choose a different username.';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must be at least 8 characters, contain at least one number, and one special character.';
      }
    }

    const filledShops = formData.shopNames.filter(name => name.trim());
    if (filledShops.length < 3) {
      newErrors.shopNames = 'At least 3 shop names are required';
    }

    // Check if any shop names are not available
    const unavailableShops = formData.shopNames.some((name, index) =>
      name.trim() && shopNameStatus[index] === 'not available'
    );
    if (unavailableShops) {
      newErrors.shopNames = 'Some shop names are not available. Please choose different names.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const filledShopNames = formData.shopNames.filter(name => name.trim());

      try {
        const response = await axiosInstance.post('/signup', {
          username: formData.username,
          password: formData.password,
          shopNames: filledShopNames
        });
        navigate("/", { replace: true });
        // alert(response.data.message || 'Account created!');
        toast.success(response.data.message);
      } catch (error) {
        toast.error(error.response?.data?.message);
        // alert(error.response?.data?.message || 'Error creating account');
      }
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join us and start managing your shops</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.username ? 'border-red-500' :
                  usernameStatus === 'not available' ? 'border-red-300' :
                    usernameStatus === 'available' ? 'border-green-300' : 'border-gray-300 hover:border-gray-400'
                  }`}
                placeholder="Enter your username"
              />
              {/* Username Status Messages */}
              {formData.username.trim() && (
                <div className="px-1">
                  {usernameStatus === 'available' && (
                    <span className="text-green-600 text-xs flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      This username is available
                    </span>
                  )}
                  {usernameStatus === 'not available' && (
                    <span className="text-red-600 text-xs flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      This username is already taken
                    </span>
                  )}
                  {usernameStatus === 'error' && (
                    <span className="text-orange-600 text-xs flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Error checking availability
                    </span>
                  )}
                </div>
              )}
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
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
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.password ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${passwordValidation.isLongEnough ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.isLongEnough ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    Contains at least one number
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    Contains at least one special character
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Shop Names */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Shop Names (minimum 3)
                </label>
                <button
                  type="button"
                  onClick={addShopName}
                  disabled={formData.shopNames.length >= 6}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700 disabled:text-gray-400 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Shop
                </button>
              </div>

              <div className="space-y-3">
                {formData.shopNames.map((shopName, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shopName}
                        onChange={(e) => handleShopNameChange(index, e.target.value)}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-400 transition-all duration-200 ${shopNameStatus[index] === 'not available' ? 'border-red-300' :
                          shopNameStatus[index] === 'available' ? 'border-green-300' : 'border-gray-300'
                          }`}
                        placeholder={`Shop ${index + 1} name`}
                      />
                      {formData.shopNames.length > 3 && (
                        <button
                          type="button"
                          onClick={() => removeShopName(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {/* Status Messages */}
                    {shopName.trim() && (
                      <div className="px-1">
                        {shopNameStatus[index] === 'available' && (
                          <span className="text-green-600 text-xs flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            This name is available
                          </span>
                        )}
                        {shopNameStatus[index] === 'not available' && (
                          <span className="text-red-600 text-xs flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            This name is already taken
                          </span>
                        )}
                        {shopNameStatus[index] === 'error' && (
                          <span className="text-orange-600 text-xs flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Error checking availability
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {errors.shopNames && (
                <p className="text-red-500 text-sm">{errors.shopNames}</p>
              )}

              <p className="text-xs text-gray-500">
                Filled shops: {formData.shopNames.filter(name => name.trim()).length} / {formData.shopNames.length}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Account
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Dark Section */}
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

export default SignupPage;
