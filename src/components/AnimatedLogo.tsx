interface AnimatedLogoProps {
  className?: string;
}

export const AnimatedLogo = ({ className }: AnimatedLogoProps) => {
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <img
        src="/logo1.png"
        alt="Pegswap Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
