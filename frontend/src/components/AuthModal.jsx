import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthModal({ onClose }) {
  const { login, signup } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(email, userName, password);
      }
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || "An error occurred connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-200/60 backdrop-blur-sm transition-all">
      <div className="volumetric-glass-pill p-10 rounded-[3rem] max-w-md w-full shadow-2xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-3xl font-bold mb-2 text-slate-800 text-center">
          {isLoginMode ? 'Welcome Back' : 'Create Account'}
        </h3>
        <p className="text-slate-500 mb-8 text-center font-medium">
          {isLoginMode ? 'Sign in to access your tracking dashboard.' : 'Start tracking anime with precision today.'}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="structural-input w-full px-5 py-3 rounded-2xl text-slate-700 font-medium placeholder:text-slate-400"
          />
          
          {/* Only show username field if signing up! */}
          {!isLoginMode && (
            <input 
              type="text" 
              placeholder="Username"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="structural-input w-full px-5 py-3 rounded-2xl text-slate-700 font-medium placeholder:text-slate-400"
            />
          )}

          <input 
            type="password" 
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="structural-input w-full px-5 py-3 rounded-2xl text-slate-700 font-medium placeholder:text-slate-400"
          />

          <button 
            type="submit"
            disabled={loading}
            className="mt-4 bg-slate-800 text-white hover:bg-cyan-600 transition-colors px-8 py-4 rounded-2xl font-bold w-full disabled:opacity-50"
          >
            {loading ? 'Connecting to Server...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-slate-500 font-medium">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
            className="text-cyan-600 font-bold hover:text-cyan-700"
          >
            {isLoginMode ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AuthModal;