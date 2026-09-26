import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export default function Hero({ title = 'ElearnMath', subtitle = 'Belajar Matematika dengan cara yang terstruktur, interaktif, dan mudah dipahami.' }) {
  const { own, setCurrentPage } = useApp();
  const user = own();

  return (
    <div className="hero">
      <div style={{ zIndex: 2 }}>
        <div className="greet">Halo, {user?.namaLengkap}!</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button 
          type="button" 
          className="btn-accent" 
          onClick={() => setCurrentPage('materi')}
        >
          Mulai Belajar
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="hero-vector" style={{ zIndex: 1 }}>
        <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle math grid & geometric diagram */}
          <line x1="20" y1="100" x2="160" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          {/* Smooth bell curve / normal distribution */}
          <path 
            d="M 20 100 C 60 100 70 30 90 30 C 110 30 120 100 160 100" 
            stroke="#FFB454" 
            strokeWidth="3.5" 
            fill="none" 
            strokeLinecap="round" 
          />
          {/* Minimalist data nodes */}
          <circle cx="90" cy="30" r="5" fill="#FFF" />
          <circle cx="65" cy="70" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="115" cy="70" r="4" fill="rgba(255,255,255,0.8)" />
          {/* Coordinate tick marks */}
          <line x1="55" y1="97" x2="55" y2="103" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <line x1="90" y1="97" x2="90" y2="103" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <line x1="125" y1="97" x2="125" y2="103" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
