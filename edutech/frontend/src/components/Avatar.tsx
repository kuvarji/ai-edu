/**
 * Avatar component - handles both emoji and base64 image avatars
 * Use this anywhere an avatar needs to be displayed to avoid
 * base64 strings rendering as text.
 */

interface AvatarProps {
  avatar: string | undefined;
  fallback?: string;
  className?: string;
  imgClassName?: string;
}

export default function Avatar({ avatar, fallback = '🦁', className = '', imgClassName = '' }: AvatarProps) {
  const value = avatar || fallback;

  if (value.startsWith('data:')) {
    return (
      <img
        src={value}
        alt="Avatar"
        className={`object-cover ${imgClassName || className}`}
      />
    );
  }

  return <>{value}</>;
}
