import { useState } from 'react';

export default function BlurImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-all duration-500 ${loaded ? 'blur-none opacity-100' : 'blur-md opacity-60'}`}
    />
  );
}
