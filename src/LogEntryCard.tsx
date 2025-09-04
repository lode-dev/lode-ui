import { Paper, Group, Text, Badge, Code, Accordion, ActionIcon, useMantineColorScheme, Checkbox } from '@mantine/core';
import { IconFilter, IconChevronDown } from '@tabler/icons-react';

interface LogEntryCardProps {
  log: {
    level: string;
    message: string;
    timestamp: string;
    metadata: Record<string, any>;
  };
  onMetadataClick: (key: string, value: any) => void;
  isSelected: boolean;
  onToggleSelection: () => void;
  onSelectLog: () => void;
  isInMainView?: boolean;
}

const CLICKABLE_METADATA_KEYS = ['user_id', 'trace_id', 'source_ip'];

function LogEntryCard({ log, onMetadataClick, isSelected, onToggleSelection, onSelectLog, isInMainView = false }: LogEntryCardProps) {
  const { colorScheme } = useMantineColorScheme();

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'red';
      case 'warn': return 'yellow';
      case 'info': return 'blue';
      case 'debug': return 'gray';
      case 'trace': return 'lime';
      default: return 'gray';
    }
  };

  return (
    <Paper 
      withBorder 
      p="md" 
      radius="xl" 
      shadow="xs"
      style={{
        backgroundColor: isInMainView
          ? (colorScheme === 'dark' ? '#2d3748' : '#e6fffa')
          : isSelected 
          ? (colorScheme === 'dark' ? '#2b2c30' : '#f0f8ff')
          : (colorScheme === 'dark' ? '#25262b' : 'white'),
        border: isInMainView
          ? (colorScheme === 'dark' ? '2px solid #38a169' : '2px solid #38a169')
          : isSelected
          ? (colorScheme === 'dark' ? '2px solid #339af0' : '2px solid #339af0')
          : (colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef'),
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: isInMainView 
          ? '0 4px 12px rgba(56, 161, 105, 0.3)' 
          : isSelected 
          ? '0 4px 12px rgba(51, 154, 240, 0.2)' 
          : '0 2px 6px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isInMainView 
            ? '0 6px 16px rgba(56, 161, 105, 0.4)' 
            : '0 6px 16px rgba(0, 0, 0, 0.1)',
          borderColor: isInMainView 
            ? (colorScheme === 'dark' ? '#48bb78' : '#48bb78')
            : (colorScheme === 'dark' ? '#5c5f66' : '#adb5bd')
        }
      }}
      onClick={onSelectLog}
    >
      <Group justify="space-between" mb="xs">
        <Group align="center" gap="md">
          <Checkbox
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
            size="sm"
            color="blue"
            onClick={(e) => e.stopPropagation()}
            style={{ transition: 'all 0.2s ease' }}
          />
          <Badge 
            color={getLogLevelColor(log.level)} 
            variant="light" 
            size="md"
            radius="md"
            style={{ 
              fontWeight: 600, 
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            {log.level.toUpperCase()}
          </Badge>
          <Text fw={500} size="md" style={{ lineHeight: 1.4, transition: 'color 0.2s ease' }}>
            {log.message}
          </Text>
        </Group>
        <Text c="dimmed" size="sm" fw={500} style={{ transition: 'color 0.2s ease' }}>
          {new Date(log.timestamp).toLocaleString()}
        </Text>
      </Group>

      {Object.keys(log.metadata).length > 0 && (
        <Accordion variant="transparent" mt="sm">
          <Accordion.Item value="metadata" style={{ border: 'none' }}>
            <Accordion.Control style={{ 
              padding: '8px 0',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: 'transparent' }
            }}>
              <Group gap="xs">
                <Text size="sm" fw={500} c="dimmed">Metadata</Text>
                <IconChevronDown size="0.8rem" color={colorScheme === 'dark' ? '#909296' : '#868e96'} style={{ transition: 'transform 0.2s ease' }} />
              </Group>
            </Accordion.Control>
            <Accordion.Panel pt="xs" style={{ animation: 'fadeIn 0.3s ease' }}>
              <Code 
                block 
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#f8f9fa',
                  border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              >
                {Object.entries(log.metadata).map(([key, value]) => (
                  <Group key={key} wrap="nowrap" gap="sm" mb="0" style={{ transition: 'all 0.2s ease' }}>
                    {CLICKABLE_METADATA_KEYS.includes(key) ? (
                      <ActionIcon 
                        size="sm" 
                        variant="subtle" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onMetadataClick(`metadata.${key}`, value);
                        }}
                        title={`Filter by ${key}: ${value}`}
                        radius="md"
                        style={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: colorScheme === 'dark' ? '#364fc7' : '#e7f5ff',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <IconFilter size="0.9rem" />
                      </ActionIcon>
                    ) : (
                      <span style={{width: '1.75rem'}}></span>
                    )}
                    <Text size="sm" fw={600} style={{ transition: 'color 0.2s ease' }}>{key}:</Text>
                    <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace', transition: 'color 0.2s ease' }}>
                      {JSON.stringify(value)}
                    </Text>
                  </Group>
                ))}
              </Code>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
    </Paper>
  );
}

export default LogEntryCard;
