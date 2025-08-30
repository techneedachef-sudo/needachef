'use client';

import { useState, forwardRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { Center, ThemeIcon } from '@mantine/core';
import { IconChefHat } from '@tabler/icons-react';

// Use forwardRef to allow parent components to pass a ref to the underlying Next.js Image component
export const FallbackImage = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const { src, alt = '', ...rest } = props;
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <Center style={{ width: '100%', height: '100%', backgroundColor: 'var(--mantine-color-gray-1)' }}>
        <ThemeIcon variant="light" size="lg">
          <IconChefHat />
        </ThemeIcon>
      </Center>
    );
  }

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      onError={() => setError(true)}
      {...rest} // Use rest instead of props to avoid passing src and alt again
    />
  );
});

FallbackImage.displayName = 'FallbackImage'; // It's good practice to set a display name
