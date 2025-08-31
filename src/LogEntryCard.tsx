import { Paper, Group, Text, Badge, Code, Accordion, ActionIcon } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';

interface LogEntryCardProps {
  log: {
    level: string;
    message: string;
    timestamp: string;
    metadata: Record<string, any>;
  };
  onMetadataClick: (key: string, value: any) => void;
}

const CLICKABLE_METADATA_KEYS = ['user_id', 'trace_id', 'source_ip'];

function LogEntryCard({ log, onMetadataClick }: LogEntryCardProps) {

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
    <Paper withBorder p="sm" radius="md" shadow="xs">
      <Group justify="space-between">
        <Group align="center">
          <Badge color={getLogLevelColor(log.level)} variant="light" size="lg">
            {log.level.toUpperCase()}
          </Badge>
          <Text fw={500}>{log.message}</Text>
        </Group>
        <Text c="dimmed" size="xs">
          {new Date(log.timestamp).toLocaleString()}
        </Text>
      </Group>

      {Object.keys(log.metadata).length > 0 && (
        <Accordion variant="transparent" mt="xs">
          <Accordion.Item value="metadata">
            <Accordion.Control>
              <Text size="sm">Metadata</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Code block>
                {Object.entries(log.metadata).map(([key, value]) => (
                  <Group key={key} wrap="nowrap" gap="xs">
                    {CLICKABLE_METADATA_KEYS.includes(key) ? (
                      <ActionIcon size="xs" variant="subtle" onClick={() => onMetadataClick(key, value)} title={`Filter by ${key}: ${value}`}>
                        <IconFilter size="0.8rem" />
                      </ActionIcon>
                    ) : (
                      <span style={{width: '1.2rem'}}></span> // placeholder for alignment
                    )}
                    <Text size="xs" fw={500}>{key}:</Text>
                    <Text size="xs" c="dimmed">{JSON.stringify(value)}</Text>
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
