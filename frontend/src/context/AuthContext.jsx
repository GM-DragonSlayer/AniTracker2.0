import { useState, createContext, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Cookie helper functions (expires in 7 days)
const setCookie = (name, value, days = 7) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name) => {   
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Restore session from cookie on initial app load
  useEffect(() => {
    const initSession = async () => {
      const savedEmail = getCookie('animetracker_user_email');
      if (savedEmail) {
        try {
          // THE FIX: We bypass the POST /login (which requires a password) 
          // and instead hit the GET endpoint directly to fetch the user by email!
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/users';
          const response = await fetch(`${baseUrl}/${savedEmail}`);
          
          if (!response.ok) throw new Error("Session expired");
          
          const userData = await response.json();
          if (userData) setUser(userData);
        } catch (err) {
          console.error("Session restore failed:", err);
          eraseCookie('animetracker_user_email');
        }
      }
      setIsAuthLoading(false);
    };

    initSession();
  }, []);

  const login = async (email, password) => {
    const userData = await api.login(email, password);
    setUser(userData);
    setCookie('animetracker_user_email', email, 7); 
  };

  const signup = async (email, userName, password) => {
    const userData = await api.signup(email, userName, password);
    setUser(userData);
    setCookie('animetracker_user_email', email, 7); 
  };

  const logout = () => {
    setUser(null);
    eraseCookie('animetracker_user_email');
    localStorage.removeItem('animetracker_view'); 
  };

  const addAnime = async (animeData) => {
    if (!user) throw new Error("Must be logged in.");
    const updatedUser = await api.addAnimeToWatchlist(user.email, animeData);
    setUser(updatedUser); 
  };

  const removeAnime = async (animeId) => {
    if (!user) throw new Error("Must be logged in.");
    const updatedUser = await api.removeAnimeFromWatchlist(user.email, animeId);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, addAnime, removeAnime, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};