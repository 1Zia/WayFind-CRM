type WayFindLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function WayFindLogo({
  className = "",
  imageClassName = "",
}: WayFindLogoProps) {
  return (
    <div
      className={`liquid-glass-active flex items-center justify-center overflow-hidden rounded-xl bg-white ${className}`}
    >
      <img
        src="/wayfind-logo.jpeg"
        alt="WayFind"
        className={`relative z-10 h-full w-full object-contain ${imageClassName}`}
      />
    </div>
  );
}
