import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-10 w-auto", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`relative ${className} min-w-[120px]`}>
        <Image 
          alt="CarOps Logo" 
          className="object-contain w-full h-full mix-blend-multiply" 
          height={200} 
          priority 
          src="/logo.jpg" 
          width={400} 
        />
      </div>
    </div>
  );
}
