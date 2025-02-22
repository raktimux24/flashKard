import React from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { logOut } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

export function DashboardNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  React.useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    const { error } = await logOut();
    if (!error) {
      navigate('/login');
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      hasScrolled 
        ? "bg-[#2A2A2A]/80 backdrop-blur-md shadow-lg border-b border-[#404040]" 
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <a 
              href="#"
              onClick={handleLogoClick}
              className="flex items-center"
            >
              <img src="/Flash AI 01.svg" alt="Flash Karao Logo" className="h-8 w-auto sm:h-12" />
             
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <Link 
                to="/dashboard" 
                className={cn(
                  "text-[#EAEAEA] hover:text-[#00A6B2] transition-colors",
                  isActive('/dashboard') ? "text-[#00A6B2]" : undefined
                )}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className={cn(
                  "text-[#EAEAEA] hover:text-[#00A6B2] transition-colors",
                  isActive('/profile') ? "text-[#00A6B2]" : undefined
                )}
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
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 -mr-2 text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={cn(
          "md:hidden absolute w-full",
          hasScrolled 
            ? "bg-[#2A2A2A]/95 backdrop-blur-md border-b border-[#404040]" 
            : "bg-[#2A2A2A]/95 backdrop-blur-md"
        )}>
          <div className="px-4 pt-2 pb-3 space-y-2">
            <Link 
              to="/dashboard" 
              className={cn(
                "flex items-center px-3 py-2 text-[#EAEAEA] hover:text-[#00A6B2] transition-colors rounded-lg",
                isActive('/dashboard') ? "bg-[#404040]/50 text-[#00A6B2]" : undefined
              )}
            >
              Dashboard
            </Link>
            <Link 
              to="/profile" 
              className={cn(
                "flex items-center px-3 py-2 text-[#EAEAEA] hover:text-[#00A6B2] transition-colors rounded-lg",
                isActive('/profile') ? "bg-[#404040]/50 text-[#00A6B2]" : undefined
              )}
            >
              Profile
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 hover:text-[#00A6B2] rounded-lg"
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