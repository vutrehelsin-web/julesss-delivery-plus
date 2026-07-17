import React from 'react';
import { Sparkles } from 'lucide-react';

interface BrandLogoProps {
  variant?: 'main' | 'repartidor' | 'comercio' | 'emprendedor' | 'admin';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'main',
  size = 'md',
  animated = false
}) => {
  // Color presets matching user specs:
  // Azul eléctrico (#007BFF), Verde éxito (#00D27F), Amarillo alerta (#FFC107), Rojo urgencia (#FF3B30)
  const getThemeColors = () => {
    switch (variant) {
      case 'repartidor':
        return {
          primary: '#007BFF', // Electric blue
          accent: '#A5F3FC',  // Cyan/Light blue accents
          bg: '#141414'
        };
      case 'comercio':
        return {
          primary: '#FFC107', // Alert / warning yellow accent
          accent: '#007BFF',  // Electric blue support
          bg: '#141414'
        };
      case 'emprendedor':
        return {
          primary: '#00D27F', // Success green
          accent: '#FFFFFF',
          bg: '#141414'
        };
      case 'admin':
        return {
          primary: '#7C3AED', // Premium purple accent (or deep admin color)
          accent: '#007BFF',  // Electric blue
          bg: '#111111'
        };
      case 'main':
      default:
        return {
          primary: '#007BFF', // Electric Blue
          accent: '#FFFFFF',  // Pure White
          bg: '#0A0A0A'       // Deep Black
        };
    }
  };

  const colors = getThemeColors();

  // Dimension helpers
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      case 'xl':
        return 'w-24 h-24';
      case 'md':
      default:
        return 'w-12 h-12';
    }
  };

  const dimClass = getDimensions();

  return (
    <div className={`relative ${dimClass} flex items-center justify-center shrink-0`}>
      {/* 1. AI Circle (outer rotation ring/radial gradient glow) */}
      <div 
        className={`absolute inset-0 rounded-full border-2 border-dashed opacity-60 ${
          animated ? 'animate-[spin_10s_linear_infinite]' : ''
        }`}
        style={{ borderColor: colors.primary }}
      />
      
      {/* Dynamic glow halo */}
      <div 
        className="absolute inset-1 rounded-full blur-[8px] opacity-25"
        style={{ backgroundColor: colors.primary }}
      />

      {/* SVG rendering lightning bolt ⚡ combined with map pin 📍 */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[80%] h-[80%] relative z-10 drop-shadow-md"
      >
        {/* Map Pin silhouette background */}
        <path
          d="M50 8C31.2 8 16 23.2 16 42C16 58.7 34.5 82.5 46.2 90.8C48.5 92.4 51.5 92.4 53.8 90.8C65.5 82.5 84 58.7 84 42C84 23.2 68.8 8 50 8Z"
          fill={colors.bg}
          stroke={colors.primary}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small center pin glow circle (representing the AI core/neuron junction) */}
        <circle 
          cx="50" 
          cy="38" 
          r="16" 
          fill={`${colors.primary}1A`} 
          stroke={colors.accent} 
          strokeWidth="2.5" 
        />

        {/* Dynamic Electric Lightning Bolt slicing down the center */}
        <path
          d="M56 22L36 45H51L44 68L64 45H49L56 22Z"
          fill={colors.primary}
          stroke={colors.accent}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? "animate-pulse" : ""}
        />
      </svg>

      {/* Dynamic role indicator dot */}
      {variant !== 'main' && (
        <span 
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-bold shadow-lg"
          style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
        >
          {variant === 'repartidor' && 'R'}
          {variant === 'comercio' && 'C'}
          {variant === 'emprendedor' && 'E'}
          {variant === 'admin' && 'A'}
        </span>
      )}
    </div>
  );
};
