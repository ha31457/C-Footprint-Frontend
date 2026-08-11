import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setAccessToken, setAuthHandlers } from '../api/apiClient';

const AUTH_BASE_URL = 'https://c-footprint-backend.onrender.com/api/auth';
// const AUTH_BASE_URL = 'http://localhost:8080/api/auth';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    google_signin_enabled: true,
    leaderboard_enabled: true,
    badges_enabled: true
  });

  const fetchSettings = useCallback(async () => {
    try {
      const SETTINGS_URL = AUTH_BASE_URL.replace('/auth', '/settings');
      const response = await axios.get(SETTINGS_URL);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('[Auth] Failed to fetch system settings:', err);
    }
  }, []);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');
    console.log('[Auth] logout called, rt token:', rt);
    try {
      if (rt) {
        await axios.post(`${AUTH_BASE_URL}/logout`, { refreshToken: rt });
      }
    } catch (e) {
      console.error('[Auth] logout API request failed:', e);
    } finally {
      console.log('[Auth] logout clean: clearing localStorage & state');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    }
  }, []);

  const doRefresh = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');
    console.log('[Auth] doRefresh: current rt in storage:', rt);
    if (!rt) throw new Error('No refresh token available');

    console.log('[Auth] doRefresh: POST to /refresh');
    const response = await axios.post(`${AUTH_BASE_URL}/refresh`, { refreshToken: rt });
    console.log('[Auth] doRefresh: raw response from backend:', response.data);

    const data = response.data || {};
    const newAccessToken = data.accessToken || data.access_token;
    const newRefreshToken = data.refreshToken || data.refresh_token || rt; // Preserve current rt if backend doesn't return a new one

    // Extract other fields (userData)
    const { accessToken, access_token, refreshToken, refresh_token, ...userData } = data;

    console.log('[Auth] doRefresh: updating localStorage, rt =', newRefreshToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const incomingTemp = data.isTempPassword !== undefined ? data.isTempPassword : data.tempPassword;
    const isTempPassword = incomingTemp !== undefined && incomingTemp !== null ? incomingTemp : (storedUser.isTempPassword || false);
    
    const mergedUser = { 
      ...storedUser, 
      ...userData, 
      isTempPassword,
      organizationName: userData.organizationName || storedUser.organizationName || null,
      avatar: userData.avatar || storedUser.avatar || null,
      avatarUrl: userData.avatarUrl || storedUser.avatarUrl || null,
    };
    localStorage.setItem('user', JSON.stringify(mergedUser));

    setAccessToken(newAccessToken);
    setAccessTokenState(newAccessToken);
    setUser(mergedUser);

    return newAccessToken;
  }, []);

  // Wire the axios interceptor to this context's refresh/logout logic
  useEffect(() => {
    setAuthHandlers(doRefresh, logout);
  }, [doRefresh, logout]);

  // On app load, try to restore a session from the stored refresh token
  useEffect(() => {
    const initAuth = async () => {
      const rt = localStorage.getItem('refreshToken');
      console.log('[Auth] initAuth: checking for rt in storage:', rt);
      if (rt) {
        try {
          console.log('[Auth] initAuth: calling doRefresh');
          await doRefresh();
          console.log('[Auth] initAuth: doRefresh complete');
        } catch (e) {
          console.error(
            '[Auth] initAuth: doRefresh failed! Error payload:',
            e.response?.data || e.message || e
          );
          await logout();
        }
      } else {
        console.log('[Auth] initAuth: no rt in storage, skipping doRefresh');
      }
      setLoading(false);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const login = async (usernameOrEmail, password) => {
    console.log('[Auth] login: starting for', usernameOrEmail);
    const response = await axios.post(`${AUTH_BASE_URL}/login`, { usernameOrEmail, password });
    console.log('[Auth] login raw response data:', response.data);

    const data = response.data || {};
    const token = data.accessToken || data.access_token;
    const rt = data.refreshToken || data.refresh_token;
    const { accessToken, access_token, refreshToken, refresh_token, ...userData } = data;

    const incomingTemp = data.isTempPassword !== undefined ? data.isTempPassword : data.tempPassword;
    const isTempPassword = incomingTemp !== undefined && incomingTemp !== null ? incomingTemp : false;

    const finalUserData = {
      ...userData,
      isTempPassword
    };

    console.log('[Auth] login: saving rt to localStorage:', rt);
    localStorage.setItem('refreshToken', rt);
    localStorage.setItem('user', JSON.stringify(finalUserData));
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(finalUserData);

    return finalUserData;
  };

  const signup = async (username, email, password, mobileNumber, age, gender, isOrgAdmin = false) => {
    const payload = {
      username,
      email,
      password,
      mobileNumber,
      age: parseInt(age, 10),
      gender,
      isOrgAdmin
    };
    const response = await axios.post(`${AUTH_BASE_URL}/signup`, payload);
    return response.data;
  };

  const verifyEmail = async (email, otp) => {
    const response = await axios.post(`${AUTH_BASE_URL}/verify-email`, { email, otp });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await axios.post(`${AUTH_BASE_URL}/forgot-password`, { email });
    return response.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const response = await axios.post(`${AUTH_BASE_URL}/reset-password`, { email, otp, newPassword });
    return response.data;
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const loginWithGoogle = async (idToken) => {
    console.log('[Auth] loginWithGoogle: sending POST /google');
    const response = await axios.post(`${AUTH_BASE_URL}/google`, { idToken });
    console.log('[Auth] loginWithGoogle raw response data:', response.data);

    const data = response.data || {};
    const token = data.accessToken || data.access_token;
    const rt = data.refreshToken || data.refresh_token;
    const { accessToken, access_token, refreshToken, refresh_token, ...userData } = data;

    localStorage.setItem('refreshToken', rt);
    localStorage.setItem('user', JSON.stringify(userData));
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(userData);

    return userData;
  };

  const value = {
    user,
    accessToken,
    loading,
    settings,
    refreshSettings: fetchSettings,
    updateSettingsState: setSettings,
    login,
    loginWithGoogle,
    signup,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUser,
    isAuthenticated: !!user && !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
