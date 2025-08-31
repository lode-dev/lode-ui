import { Container, Group, Text, Anchor, useMantineColorScheme } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';

function Footer() {
  const { colorScheme } = useMantineColorScheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
      backgroundColor: colorScheme === 'dark' 
        ? 'rgba(26, 27, 30, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      padding: '16px 0'
    }}>
      <Container size="xl">
        <Group justify="space-between" align="center">
          <svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <path
              d="M8 6 L8 20 L20 20 L20 18 L10 18 L10 6 Z"
              fill="currentColor"
              opacity="0.8"
            />
            <path
              d="M12 10 L12 24 L24 24 L24 22 L14 22 L14 10 Z"
              fill="currentColor"
            />
            <circle cx="18" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="22" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="26" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
          </svg>
          
          <Group gap="lg" align="center">
            <Text size="sm" c="dimmed">
              © {currentYear} Lode. Built with{' '}
              <IconHeart size="0.8rem" style={{ display: 'inline', color: '#e03131' }} />{' '}
              for developers.
            </Text>
            
            <Group gap="md">
              <Anchor 
                href="#"
                size="sm" 
                c="dimmed"
                style={{ textDecoration: 'none' }}
              >
                Docs
              </Anchor>
              <Anchor 
                href="https://github.com/lode-dev"
                size="sm" 
                c="dimmed"
                style={{ textDecoration: 'none' }}
              >
                GitHub
              </Anchor>
              <Anchor 
                href="mailto:ryanpolasky@hotmail.com"
                size="sm" 
                c="dimmed"
                style={{ textDecoration: 'none' }}
              >
                Support
              </Anchor>
            </Group>
          </Group>
        </Group>
      </Container>
    </footer>
  );
}

export default Footer;
