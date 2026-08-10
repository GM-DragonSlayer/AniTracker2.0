import { useState, createContext, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Cookie helper functions (expires in 1 hour)
const setCookie = (name, value, hours = 1) => {
  let expires = "";
  if (hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
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

  // Restore session from cookie on initial app load
  useEffect(() => {
    const savedEmail = getCookie('animetracker_user_email');
    if (savedEmail) {
      api.login(savedEmail, '')
        .then(userData => {
          if (userData) setUser(userData);
        })
        .catch(() => {
          eraseCookie('animetracker_user_email');
        });
    }
  }, []);

  const login = async (email, password) => {
    const userData = await api.login(email, password);
    setUser(userData);
    setCookie('animetracker_user_email', email, 1); // 1 hour expiration
  };

  const signup = async (email, userName, password) => {
    const userData = await api.signup(email, userName, password);
    setUser(userData);
    setCookie('animetracker_user_email', email, 1); // 1 hour expiration
  };

  const logout = () => {
    setUser(null);
    eraseCookie('animetracker_user_email');
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
    <AuthContext.Provider value={{ user, login, signup, logout, addAnime, removeAnime }}>
      {children}
    </AuthContext.Provider>
  );
};