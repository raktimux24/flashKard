import React, { useState } from 'react';
import { Camera, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { PatternCard, PatternCardBody } from '../ui/card-with-ellipsis-pattern';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';

export function ProfileHeader() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <PatternCard 
      className="bg-[#2A2A2A]/80 border-[#404040] transition-colors duration-300 backdrop-blur-sm"
      gradientClassName="from-[#2A2A2A]/90 via-[#2A2A2A]/40 to-[#2A2A2A]/10"
    >
      <PatternCardBody>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Avatar className="h-24 w-24 ring-2 ring-[#00A6B2]/20">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&fit=crop&crop=face" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <button 
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "bg-black/50 rounded-full transition-opacity",
                isHovering ? "opacity-100" : "opacity-0"
              )}
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#EAEAEA]">John Doe</h1>
                <p className="text-[#C0C0C0]">john.doe@example.com</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </PatternCardBody>
    </PatternCard>
  );
}