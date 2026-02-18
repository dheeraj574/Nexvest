import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMobileLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <span className="tracking-tight">Nexvest</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>

            <Link to="/about" className="text-slate-700 dark:text-slate-200 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              About
            </Link>
            
            {user ? (
              <>
                <Link to="/advisor" className="text-slate-700 dark:text-slate-200 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  New Plan
                </Link>
                <Link to="/history" className="text-slate-700 dark:text-slate-200 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  History
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{user.username}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-full font-bold transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 font-bold">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
            <button 
              className="p-2 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-2xl transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu with Smooth Transition */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link 
              to="/about" 
              onClick={handleMobileLinkClick} 
              className="flex items-center gap-3 px-4 py-3.5 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                 <i className="fa-solid fa-circle-info"></i>
              </div>
              About
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/advisor" 
                  onClick={handleMobileLinkClick} 
                  className="flex items-center gap-3 px-4 py-3.5 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <i className="fa-solid fa-plus"></i>
                  </div>
                  New Plan
                </Link>
                <Link 
                  to="/history" 
                  onClick={handleMobileLinkClick} 
                  className="flex items-center gap-3 px-4 py-3.5 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </div>
                  History
                </Link>
                <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </div>
                  Logout ({user.username})
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={handleMobileLinkClick} 
                  className="flex items-center gap-3 px-4 py-3.5 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                     <i className="fa-solid fa-right-to-bracket"></i>
                   </div>
                   Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={handleMobileLinkClick} 
                  className="flex items-center gap-3 px-4 py-3.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-all mt-2"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                     <i className="fa-solid fa-user-plus"></i>
                  </div>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;