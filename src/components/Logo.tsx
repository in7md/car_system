import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-12 w-auto", showText = true }: LogoProps) {
  return (
    <div className="flex items-center justify-center select-none">
      <div className={`relative ${className} flex items-center justify-center overflow-hidden rounded-xl`}>
        <Image 
          alt="CarOps Logo" 
          className="object-contain w-full h-full" 
          height={200} 
          priority 
          src="/logo.jpg" 
          width={400} 
        />
      </div>
    </div>
  );
}
