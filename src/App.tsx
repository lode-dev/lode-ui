// lode-ui/src/App.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppShell, TextInput, ScrollArea, Group, Switch, Stack,
  Pagination, Select, Container, ActionIcon, useMantineColorScheme, Grid, Text
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconSun, IconMoon, IconTrash, IconPlus } from '@tabler/icons-react';
import LogEntryCard from './LogEntryCard';
import FilterBar from './FilterBar';
import Logo from './components/Logo';
import Footer from './components/Footer';
import ChatPanel from './components/ChatPanel';
import LogDetailPanel from './components/LogDetailPanel';
import ContextTray from './components/ContextTray';

interface Log {
  level: string;
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}

interface Filter {
  key: string;
  value: string;
}

interface Suggestion {
  key: string;
  doc_count: number;
}

interface Suggestions {
  common_levels?: { buckets: Suggestion[] };
  common_user_ids?: { buckets: Suggestion[] };
}

function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions>({});

  // Pagination State
  const [activePage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<string>('50');

  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300);
  const [contextLogs, setContextLogs] = useState<Log[]>([]);
  const [selectedLogIndices, setSelectedLogIndices] = useState<Set<number>>(new Set());
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  useEffect(() => {
    if (isLive) return;

    const performSearch = async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) {
          params.append('q', debouncedSearchTerm);
        }
        filters.forEach(filter => {
          params.append(filter.key, filter.value);
        });
        params.append('page', activePage.toString());
        params.append('page_size', pageSize);
        params.append('sort', 'timestamp:desc');

        const response = await axios.get(`http://localhost:8000/v1/search?${params.toString()}`);
        setLogs(response.data.results);
        setTotalPages(Math.ceil(response.data.total / parseInt(pageSize, 10)));
        
        // Fetch suggestions if no filters are active
        if (filters.length === 0) {
          try {
            const suggestionsResponse = await axios.get('http://localhost:8000/v1/aggregations/suggested_filters');
            setSuggestions(suggestionsResponse.data);
          } catch (error) {
            console.error("Failed to fetch suggestions:", error);
          }
        } else {
          setSuggestions({});
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      }
    };
    performSearch();
  }, [debouncedSearchTerm, filters, activePage, pageSize, isLive]);

  useEffect(() => {
    if (!isLive) return;
    const ws = new WebSocket('ws://localhost:8000/v1/ws/tail');
    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 500));
    };
    return () => ws.close();
  }, [isLive]);

  const handleAddFilter = (key: string, value: any) => {
    const newFilter = { key, value: String(value) };
    if (!filters.some(f => f.key === newFilter.key && f.value === newFilter.value)) {
      setFilters(prev => [...prev, newFilter]);
    }
    setSearchTerm('');
  };

  const handleRemoveFilter = (indexToRemove: number) => {
    setFilters(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      setPageSize(value);
      setPage(1);
    }
  };

  const handleAnalyzeLog = (log: Log) => {
    setContextLogs([log]);
  };

  const handleAddLogToContext = (log: Log) => {
    if (!contextLogs.some(contextLog => 
      contextLog.timestamp === log.timestamp && contextLog.message === log.message
    )) {
      setContextLogs(prev => [...prev, log]);
    }
  };

  const handleRemoveLogFromContext = (index: number) => {
    setContextLogs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectLog = (log: Log) => {
    setSelectedLog(log);
  };

  const handleToggleLogSelection = (index: number) => {
    setSelectedLogIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleAddSelectedToContext = () => {
    const selectedLogs = logs.filter((_, index) => selectedLogIndices.has(index));
    const newLogs = selectedLogs.filter(log => 
      !contextLogs.some(contextLog => 
        contextLog.timestamp === log.timestamp && contextLog.message === log.message
      )
    );
    setContextLogs(prev => [...prev, ...newLogs]);
    setSelectedLogIndices(new Set());
  };

  const handleClearContext = () => {
    setContextLogs([]);
  };

  return (
    <AppShell
      header={{ height: 72 }}
      footer={{ height: 60 }}
      padding={0}
      style={{
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fafafa',
        height: '100vh',
        transition: 'background-color 0.3s ease'
      }}
    >
      <AppShell.Header style={{
        backgroundColor: colorScheme === 'dark'
          ? 'rgba(26, 27, 30, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: colorScheme === 'dark'
          ? '1px solid #373a40'
          : '1px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" px="lg">
            <Logo size="md" />
            <Group gap="md">
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="md"
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
                style={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoon size="1.2rem" />}
              </ActionIcon>
              <Switch
                size="md"
                color="blue.6"
                checked={isLive}
                onChange={(event) => setIsLive(event.currentTarget.checked)}
                label="Live Tail"
                styles={{
                  track: { cursor: 'pointer', transition: 'all 0.2s ease' },
                  label: { cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s ease' }
                }}
              />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main style={{ height: 'calc(100vh - 132px)', overflow: 'hidden' }}>
        <Container size="100%" h="100%" p="lg">
          <Stack gap="md" h="100%">
            {/* Search and Filters */}
            <Stack gap="md" style={{ flexShrink: 0 }}>
              <TextInput
                leftSection={<IconSearch size="1.2rem" stroke={1.5} />}
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                size="lg"
                radius="xl"
                styles={{
                  input: {
                    backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
                    border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                    color: colorScheme === 'dark' ? '#c1c2c5' : '#495057',
                    transition: 'all 0.3s ease',
                    '&:focus': {
                      borderColor: '#339af0',
                      boxShadow: '0 0 0 4px rgba(51, 154, 240, 0.15)',
                      transform: 'translateY(-1px)'
                    },
                    '&:hover': {
                      borderColor: colorScheme === 'dark' ? '#5c5f66' : '#adb5bd'
                    }
                  }
                }}
              />

              <FilterBar
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                suggestions={suggestions}
                onAddFilter={handleAddFilter}
              />
            </Stack>

            {/* Main Layout */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              height: '100%',
              minHeight: 0
            }}>
              {/* Log Viewer - Left Column */}
              <div style={{ 
                width: '33.333%',
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
                borderRadius: '12px',
                border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef'
              }}>
                <ScrollArea 
                  style={{ 
                    flex: 1, 
                    minHeight: 0,
                    height: 'calc(100% - 80px)'
                  }} 
                  type="never"
                >
                  <Stack gap="sm" p="xs">
                    {logs.map((log, index) => (
                      <LogEntryCard
                        key={index}
                        log={log}
                        onMetadataClick={handleAddFilter}
                        isSelected={selectedLogIndices.has(index)}
                        onToggleSelection={() => handleToggleLogSelection(index)}
                        onSelectLog={() => handleSelectLog(log)}
                        isInMainView={selectedLog === log}
                      />
                    ))}
                  </Stack>
                </ScrollArea>

                {/* Pagination */}
                <Group justify="space-between" pt="md" pb="xs" px="md" style={{
                  borderTop: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
                  flexShrink: 0,
                  height: '80px',
                  backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
                  borderRadius: '0 0 12px 12px',
                  transition: 'background-color 0.3s ease'
                }}>
                  <Group gap="xs" align="center">
                    <Text size="sm" fw={500}>Per page:</Text>
                    <Select
                      data={['10', '50', '100', '500']}
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      size="sm"
                      radius="md"
                      style={{ width: '80px' }}
                      styles={{
                        input: { transition: 'all 0.2s ease' }
                      }}
                    />
                  </Group>
                  <Pagination
                    total={totalPages}
                    value={activePage}
                    onChange={setPage}
                    size="sm"
                    radius="md"
                    styles={{
                      control: {
                        transition: 'all 0.2s ease',
                        '&[data-active]': {
                          backgroundColor: '#339af0',
                          borderColor: '#339af0',
                          transform: 'scale(1.05)'
                        },
                        '&:hover': {
                          backgroundColor: colorScheme === 'dark' ? '#373a40' : '#f1f3f5'
                        }
                      }
                    }}
                  />
                </Group>
              </div>

              {/* Log Detail - Center Column */}
              <div style={{ width: '33.333%', height: '100%' }}>
                <LogDetailPanel
                  log={selectedLog}
                  onAnalyzeLog={handleAnalyzeLog}
                  onAddToContext={handleAddLogToContext}
                />
              </div>

              {/* Right Column - Chat and Context */}
              <div style={{ width: '33.333%', height: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  gap: '16px' 
                }}>
                  {/* Chat Panel */}
                  <div style={{ flex: 2, minHeight: 0 }}>
                    <ChatPanel
                      isOpen={true}
                      contextLogs={contextLogs}
                      activeFilters={filters}
                      onClearContext={handleClearContext}
                    />
                  </div>

                  {/* Context Tray */}
                  <div style={{ flex: 1, minHeight: 0, maxHeight: '300px' }}>
                    <ContextTray
                      contextLogs={contextLogs}
                      onRemoveLog={handleRemoveLogFromContext}
                      onClearContext={handleClearContext}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Stack>
        </Container>
      </AppShell.Main>

      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>

      {/* Floating Action Bar for Selected Logs */}
      {selectedLogIndices.size > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
            border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
            animation: 'fadeInUp 0.3s ease'
          }}
        >
          <Group gap="xs">
            <ActionIcon
              size="lg"
              radius="xl"
              variant="filled"
              color="red"
              onClick={() => setSelectedLogIndices(new Set())}
              style={{
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <IconTrash size="1.2rem" />
            </ActionIcon>
            <ActionIcon
              size="lg"
              radius="xl"
              variant="filled"
              color="green"
              onClick={handleAddSelectedToContext}
              style={{
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <IconPlus size="1.2rem" />
            </ActionIcon>
          </Group>
        </div>
      )}
    </AppShell>
  );
}

export default App;
