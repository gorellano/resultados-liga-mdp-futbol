import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface ClubLogoProps {
  url?: string | null;
  name: string;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
}

export const ClubLogo = React.memo(function ClubLogo({
  url,
  name,
  className = "w-full h-full object-contain",
  iconClassName = "w-6 h-6 text-muted-foreground",
  priority = false
}: ClubLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return <Shield className={iconClassName} aria-label={name} />;
  }

  return (
    <img
      src={url}
      alt={name}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
});
