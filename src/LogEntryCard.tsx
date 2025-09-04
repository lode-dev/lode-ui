import { Paper, Group, Text, Badge, Code, Accordion, ActionIcon, useMantineColorScheme, Checkbox, Button } from '@mantine/core';
import { IconFilter, IconChevronDown, IconBrain } from '@tabler/icons-react';

interface LogEntryCardProps {
  log: {
    level: string;
    message: string;
    timestamp: string;
    metadata: Record<string, any>;
  };
  onMetadataClick: (key: string, value: any) => void;
  onAnalyzeLog: (log: LogEntryCardProps['log']) => void;
  isSelected: boolean;
  onToggleSelection: () => void;
}

const CLICKABLE_METADATA_KEYS = ['user_id', 'trace_id', 'source_ip'];

function LogEntryCard({ log, onMetadataClick, onAnalyzeLog, isSelected, onToggleSelection }: LogEntryCardProps) {
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
      p="lg" 
      radius="xl" 
      shadow="xs"
      style={{
        backgroundColor: isSelected 
          ? (colorScheme === 'dark' ? '#2b2c30' : '#f0f8ff')
          : (colorScheme === 'dark' ? '#25262b' : 'white'),
        border: isSelected
          ? (colorScheme === 'dark' ? '2px solid #339af0' : '2px solid #339af0')
          : (colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef'),
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: colorScheme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      <Group justify="space-between" mb="sm">
        <Group align="center" gap="md">
          <Checkbox
            checked={isSelected}
            onChange={onToggleSelection}
            size="sm"
            color="blue"
          />
          <Badge 
            color={getLogLevelColor(log.level)} 
            variant="light" 
            size="lg"
            radius="md"
            style={{ fontWeight: 600, letterSpacing: '0.5px' }}
          >
            {log.level.toUpperCase()}
          </Badge>
          <Text fw={500} size="md" style={{ lineHeight: 1.4 }}>
            {log.message}
          </Text>
        </Group>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            color="blue"
            leftSection={<IconBrain size="0.8rem" />}
            onClick={() => onAnalyzeLog(log)}
            radius="md"
          >
            Analyze this Log
          </Button>
          <Text c="dimmed" size="sm" fw={500}>
            {new Date(log.timestamp).toLocaleString()}
          </Text>
        </Group>
      </Group>

      {Object.keys(log.metadata).length > 0 && (
        <Accordion variant="transparent" mt="md">
          <Accordion.Item value="metadata" style={{ border: 'none' }}>
            <Accordion.Control style={{ padding: '8px 0' }}>
              <Group gap="xs">
                <Text size="sm" fw={500} c="dimmed">Metadata</Text>
                <IconChevronDown size="0.8rem" color={colorScheme === 'dark' ? '#909296' : '#868e96'} />
              </Group>
            </Accordion.Control>
            <Accordion.Panel pt="sm">
              <Code 
                block 
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#f8f9fa',
                  border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                {Object.entries(log.metadata).map(([key, value]) => (
                  <Group key={key} wrap="nowrap" gap="sm" mb="xs">
                    {CLICKABLE_METADATA_KEYS.includes(key) ? (
                      <ActionIcon 
                        size="sm" 
                        variant="subtle" 
                        onClick={() => onMetadataClick(`metadata.${key}`, value)} 
                        title={`Filter by ${key}: ${value}`}
                        radius="md"
                        style={{
                          '&:hover': {
                            backgroundColor: colorScheme === 'dark' ? '#364fc7' : '#e7f5ff'
                          }
                        }}
                      >
                        <IconFilter size="0.9rem" />
                      </ActionIcon>
                    ) : (
                      <span style={{width: '1.75rem'}}></span>
                    )}
                    <Text size="sm" fw={600}>{key}:</Text>
                    <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace' }}>
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
