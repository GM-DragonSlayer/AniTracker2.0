import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onStartTrackingClick }) {
  return (
    <main className="relative z-10 w-full max-w-5xl px-4 flex-1 flex flex-col items-center mx-auto text-center py-20 min-h-[80vh] justify-center">
      <div className="relative w-full max-w-4xl mx-auto my-auto flex items-center justify-center">
        
        {/* --- THE GLOWING SPHERES (THE FIX) --- */}
        {/* Cyan Sphere - Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-[28rem] md:h-[28rem] bg-sky-500 rounded-full blur-[60px] md:blur-[100px] opacity-60 animate-pulse z-0"></div>
        
        {/* Orange Sphere - Offset Left */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-80 md:h-80 bg-orange-500 rounded-full blur-[60px] md:blur-[100px] opacity-40 animate-pulse z-0" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>

        {/* UPDATED: Changed from volumetric-glass-pill to structural-input to match the search bar */}
        <div className="structural-input backdrop-blur-xl shadow-2xl rounded-[3rem] md:rounded-[4rem] px-8 py-16 md:px-24 md:py-24 flex flex-col items-center relative w-full overflow-hidden z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 theme-text leading-tight">
            Track Anime <br/> with Precision.
          </h1>
          <p className="text-lg md:text-xl theme-text-muted max-w-2xl mb-12 font-medium leading-relaxed">
            A structured, high-fidelity dashboard for your watch history. Powered by Kitsu, designed for clarity.
          </p>
          <button onClick={onStartTrackingClick} className="cta-btn rounded-full px-10 py-4 text-lg font-bold flex items-center gap-3">
            Start Tracking
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        
      </div>
    </main>
  );
}