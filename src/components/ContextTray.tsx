import { Paper, Text, Group, Stack, ActionIcon, useMantineColorScheme, Badge, ScrollArea, Button } from '@mantine/core';
import { IconTrash, IconX } from '@tabler/icons-react';

interface ContextTrayProps {
  contextLogs: any[];
  onRemoveLog: (index: number) => void;
  onClearContext: () => void;
}

function ContextTray({ contextLogs, onRemoveLog, onClearContext }: ContextTrayProps) {
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
      radius="lg"
      h="100%"
      style={{
        backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Text fw={600} size="sm">Context Tray</Text>
          {contextLogs.length > 0 && (
            <Badge size="sm" color="blue" variant="light">
              {contextLogs.length}
            </Badge>
          )}
        </Group>
        {contextLogs.length > 0 && (
          <Button
            size="xs"
            variant="subtle"
            color="red"
            leftSection={<IconTrash size="0.7rem" />}
            onClick={onClearContext}
          >
            Clear All
          </Button>
        )}
      </Group>

      {/* Content */}
      <ScrollArea style={{ flex: 1, minHeight: 0 }}>
        {contextLogs.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" mt="xl">
            No logs in context
          </Text>
        ) : (
          <Stack gap="xs">
            {contextLogs.map((log, index) => (
              <Paper
                key={index}
                p="xs"
                radius="md"
                withBorder
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#2b2c30' : '#f8f9fa'
                }}
              >
                <Group justify="space-between" align="flex-start" gap="xs">
                  <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Badge 
                      color={getLogLevelColor(log.level)} 
                      variant="light" 
                      size="xs"
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <Text 
                      size="xs" 
                      style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                    >
                      {log.message}
                    </Text>
                  </Group>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => onRemoveLog(index)}
                  >
                    <IconX size="0.6rem" />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Paper>
  );
}

export default ContextTray;
