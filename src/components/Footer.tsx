import React from 'react';

export function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-[#C0C0C0] mb-4 md:mb-0">
          © 2025 FlashAI
        </p>
        <p className="text-[#C0C0C0] hidden md:block">
          Made with <span className="text-red-500">❤️</span> in Bengaluru, India
        </p>
        <div className="flex space-x-6">
          <a href="#" className="text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}