import React from 'react';
import { supabase } from '../lib/supabase';
import { BrandLogo } from './BrandLogo';

export const LoginDashboard: React.FC = () => {

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) {
        console.error(error);
        alert('Error signing in with Google');
      }
    } catch (error) {
      console.error(error);
      alert('Error signing in with Google');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0A] text-white p-6">
      <div className="mb-8">
        <BrandLogo />
      </div>
      <h1 className="text-4xl font-display font-bold mb-8">DeliveryPlus AI Dashboard</h1>
      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors"
      >
        Sign in with Google
      </button>
      <p className="mt-4 text-gray-500 text-sm italic">
        (For Email and Phone sign-in, please enable these providers in the Firebase Console.)
      </p>
    </div>
  );
};
