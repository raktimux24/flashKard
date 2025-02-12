import React from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { logOut } from '../../lib/firebase';

export function DashboardNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    const { error } = await logOut();
    if (!error) {
      navigate('/login');
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      hasScrolled 
        ? "bg-[#2A2A2A]/80 backdrop-blur-md shadow-lg border-b border-[#404040]" 
        : "bg-transparent"
    )}>
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
              <Link 
                to="/dashboard" 
                className="text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
              >
                Profile
              </Link>
              <Button 
                variant="ghost" 
                className="gap-2 hover:text-[#00A6B2]"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
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
        <div className={cn(
          "md:hidden",
          hasScrolled 
            ? "bg-[#2A2A2A]/80 backdrop-blur-md border-b border-[#404040]" 
            : "bg-[#2A2A2A]/95"
        )}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/profile" 
              className="block px-3 py-2 text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
            >
              Profile
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 hover:text-[#00A6B2]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}