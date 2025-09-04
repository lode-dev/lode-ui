import { Paper, Text, Badge, Code, Group, Stack, ActionIcon, useMantineColorScheme, Button, ScrollArea } from '@mantine/core';
import { IconBrain, IconPlus } from '@tabler/icons-react';

interface LogDetailPanelProps {
  log: {
    level: string;
    message: string;
    timestamp: string;
    metadata: Record<string, any>;
  } | null;
  onAnalyzeLog: (log: LogDetailPanelProps['log']) => void;
  onAddToContext: (log: LogDetailPanelProps['log']) => void;
}

function LogDetailPanel({ log, onAnalyzeLog, onAddToContext }: LogDetailPanelProps) {
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

  if (!log) {
    return (
      <Paper
        withBorder
        p="xl"
        radius="lg"
        h="100%"
        style={{
          backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text c="dimmed" size="lg" ta="center">
          Select a log to view details
        </Text>
      </Paper>
    );
  }

  return (
    <Paper
      withBorder
      p="xl"
      radius="lg"
      h="100%"
      style={{
        backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <ScrollArea style={{ flex: 1, minHeight: 0 }}>
        <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group align="center" gap="md">
            <Badge 
              color={getLogLevelColor(log.level)} 
              variant="light" 
              size="xl"
              radius="md"
              style={{ fontWeight: 600, letterSpacing: '0.5px' }}
            >
              {log.level.toUpperCase()}
            </Badge>
            <Text c="dimmed" size="sm" fw={500}>
              {new Date(log.timestamp).toLocaleString()}
            </Text>
          </Group>
          <Group gap="xs">
            <Button
              size="sm"
              variant="light"
              color="green"
              leftSection={<IconPlus size="1rem" />}
              onClick={() => onAddToContext(log)}
              radius="md"
            >
              Add to Context
            </Button>
            <Button
              size="sm"
              variant="light"
              color="blue"
              leftSection={<IconBrain size="1rem" />}
              onClick={() => onAnalyzeLog(log)}
              radius="md"
            >
              Analyze
            </Button>
          </Group>
        </Group>

        {/* Message */}
        <div>
          <Text fw={600} size="sm" c="dimmed" mb="xs">MESSAGE</Text>
          <Text size="lg" style={{ lineHeight: 1.6 }}>
            {log.message}
          </Text>
        </div>

        {/* Metadata */}
        {Object.keys(log.metadata).length > 0 && (
          <div>
            <Text fw={600} size="sm" c="dimmed" mb="md">METADATA</Text>
            <Code 
              block 
              style={{
                backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#f8f9fa',
                border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                lineHeight: 1.6
              }}
            >
              {JSON.stringify(log.metadata, null, 2)}
            </Code>
          </div>
        )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}

export default LogDetailPanel;
