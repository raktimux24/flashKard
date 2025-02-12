import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      hasScrolled ? 'bg-[#2A2A2A]/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/FlashCardAI Logo.svg" alt="Flash Karao Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">Flash Karao</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#features" className="hover:text-[#00A6B2] transition-colors">Features</a>
              <a href="#pricing" className="hover:text-[#00A6B2] transition-colors">Pricing</a>
              <a href="#about" className="hover:text-[#00A6B2] transition-colors">About</a>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2 text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="px-4 py-2 bg-[#00A6B2] hover:bg-[#008C96] rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#EAEAEA]">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`md:hidden ${
          hasScrolled ? 'bg-[#2A2A2A]/80 backdrop-blur-md' : 'bg-[#2A2A2A]'
        } p-4`}>
          <div className="flex flex-col space-y-4">
            <a href="#features" className="hover:text-[#00A6B2] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#00A6B2] transition-colors">Pricing</a>
            <a href="#about" className="hover:text-[#00A6B2] transition-colors">About</a>
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-4 py-2 bg-[#00A6B2] hover:bg-[#008C96] rounded-lg transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}