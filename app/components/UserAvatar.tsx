import { useState } from 'react';
import Link from 'next/link';
import { Avatar, Box } from '@mui/material';
import Image from 'next/image';

interface UserAvatarProps {
  username: string;
  userId: string | number;
  size?: number;
  clickable?: boolean; // Add this prop to control clickability
}

export default function UserAvatar({
  username,
  userId,
  size = 40,
  clickable = true
}: UserAvatarProps) {
  const [avatarError, setAvatarError] = useState(false);

  // Check if this is a deleted/anonymous user
  const isAnonymousUser = username[0] === '[';

  // Create the avatar element
  const avatarElement = (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {isAnonymousUser ? (
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: size,
            height: size,
            fontSize: size * 0.4 // Scale font size with avatar size
          }}
        >
          ?
        </Avatar>
      ) : !avatarError ? (
        <Image
          src={`/api/avatar/${userId}`}
          alt={`${username}'s avatar`}
          width={size}
          height={size}
          style={{
            borderRadius: '50%',
            objectFit: 'cover',
          }}
          onError={() => setAvatarError(true)}
          priority={size > 80} // Only prioritize larger avatars
        />
      ) : (
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: size,
            height: size,
            fontSize: size * 0.4 // Scale font size with avatar size
          }}
        >
          {username[0]?.toUpperCase() || '?'}
        </Avatar>
      )}
    </Box>
  );

  // Return clickable or non-clickable version
  if (clickable && !isAnonymousUser) {
    return (
      <Link href={`/users/${username}`} style={{ textDecoration: 'none' }}>
        {avatarElement}
      </Link>
    );
  }

  return avatarElement;
}