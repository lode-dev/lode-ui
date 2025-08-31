// lode-ui/src/App.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppShell, TextInput, ScrollArea, Group, Switch, Stack,
  Pagination, Select, Container, ActionIcon, useMantineColorScheme
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconSun, IconMoon } from '@tabler/icons-react';
import LogEntryCard from './LogEntryCard';
import FilterBar from './FilterBar';
import Logo from './components/Logo';
import Footer from './components/Footer';

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

  return (
    <AppShell 
      header={{ height: 72 }} 
      footer={{ height: 60 }}
      padding={0} 
      style={{ 
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fafafa',
        height: '100vh'
      }}
    >
      <AppShell.Header style={{ 
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(26, 27, 30, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: colorScheme === 'dark' 
          ? '1px solid #373a40' 
          : '1px solid #e9ecef'
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
                  track: { cursor: 'pointer' },
                  label: { cursor: 'pointer', fontWeight: 500 }
                }}
              />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main style={{ height: 'calc(100vh - 132px)', overflow: 'hidden' }}>
        <Container size="xl" h="100%" py="lg">
          <Stack gap="lg" h="100%">
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
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  color: colorScheme === 'dark' ? '#c1c2c5' : '#495057',
                  '&:focus': {
                    borderColor: '#339af0',
                    boxShadow: '0 0 0 3px rgba(51, 154, 240, 0.1)'
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

            <ScrollArea flex={1} type="scroll">
              <Stack gap="md">
                {logs.map((log, index) => (
                  <LogEntryCard key={index} log={log} onMetadataClick={handleAddFilter} />
                ))}
              </Stack>
            </ScrollArea>

            <Group justify="space-between" pt="md" style={{ 
              borderTop: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
              backgroundColor: colorScheme === 'dark' 
                ? 'rgba(26, 27, 30, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              flexShrink: 0
            }}>
              <Select
                label="Per page"
                data={['10', '50', '100', '500']}
                value={pageSize}
                onChange={handlePageSizeChange}
                size="sm"
                radius="md"
                style={{ width: '120px' }}
                styles={{
                  label: { fontWeight: 500, fontSize: '0.875rem' }
                }}
              />
              <Pagination 
                total={totalPages} 
                value={activePage} 
                onChange={setPage}
                size="sm"
                radius="md"
                styles={{
                  control: {
                    '&[data-active]': {
                      backgroundColor: '#339af0',
                      borderColor: '#339af0'
                    }
                  }
                }}
              />
            </Group>
          </Stack>
        </Container>
      </AppShell.Main>

      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}

export default App;
