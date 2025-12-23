import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <BadgeCheck 
      size={size} 
      className="text-blue-500 fill-white inline-block ml-1 align-text-bottom" 
      strokeWidth={2.5}
    />
  );
}
