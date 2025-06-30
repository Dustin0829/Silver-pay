import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 animate-slide-in-left">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 font-bold">&times;</button>
      </div>
      <style>{`
        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-100%) }
          100% { opacity: 1; transform: translateX(0) }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.4s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
};

export default Toast; 