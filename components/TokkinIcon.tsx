export default function TokkinIcon({ 
  size = 24, 
  className = "text-yellow-500" 
}: { 
  size?: number, 
  className?: string 
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* The Coin Circle */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      
      {/* The Bunny Ears / Symbol inside */}
      <path 
        d="M8 13V9C8 6.5 9.5 5 12 5C14.5 5 16 6.5 16 9V13" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M9 13H15" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
       <path 
        d="M12 13V17" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
}