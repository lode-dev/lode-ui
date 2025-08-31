import { Group, Text } from '@mantine/core';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

function Logo({ size = 'md' }: LogoProps) {
  const dimensions = {
    sm: { width: 32, height: 32, fontSize: '1rem' },
    md: { width: 40, height: 40, fontSize: '1.5rem' },
    lg: { width: 48, height: 48, fontSize: '1.75rem' }
  };

  const { width, height, fontSize } = dimensions[size];

  return (
    <Group gap="xs" align="center">
      <svg width={width} height={height} viewBox="0 0 32 32" fill="none">
        {/* Stylized "L" shape representing logs/layers */}
        <path
          d="M8 6 L8 20 L20 20 L20 18 L10 18 L10 6 Z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M12 10 L12 24 L24 24 L24 22 L14 22 L14 10 Z"
          fill="currentColor"
        />
        {/* Small dots representing data points */}
        <circle cx="18" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="22" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="26" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
      </svg>
      <Text 
        fw={600} 
        size={fontSize} 
        style={{ 
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #339af0 0%, #228be6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Lode
      </Text>
    </Group>
  );
}

export default Logo;
