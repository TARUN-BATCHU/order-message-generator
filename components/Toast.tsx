
import React from 'react';

interface ToastProps {
  message: string;
  show: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, show }) => {
  if (!show) return null;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {message}
    </div>
  );
};
