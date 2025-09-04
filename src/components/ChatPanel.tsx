import { useState, useEffect, useRef } from 'react';
import {
  Paper, TextInput, ActionIcon, ScrollArea, Text, Group, Stack,
  useMantineColorScheme, Box, Loader, Badge, Button
} from '@mantine/core';
import { IconSend, IconRobot, IconUser, IconTrash } from '@tabler/icons-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  contextLogs: any[];
  activeFilters: { key: string; value: string }[];
  onClearContext: () => void;
}

function ChatPanel({ isOpen, contextLogs, activeFilters, onClearContext }: ChatPanelProps) {
  const { colorScheme } = useMantineColorScheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentResponseRef = useRef<string>('');
  const streamTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000/v1/ws/chat');
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Chat WebSocket connected');
      };

      ws.onmessage = (event) => {
        const token = event.data;
        
        // Check if this is an end-of-stream signal (empty token or specific marker)
        if (token === '' || token === '\n\n' || token.trim() === '') {
          setIsStreaming(false);
          return;
        }
        
        currentResponseRef.current += token;
        
        // Update the last message (assistant's response) with the new token
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage && lastMessage.sender === 'assistant') {
            lastMessage.content = currentResponseRef.current.trimStart();
          }
          
          return newMessages;
        });
        
        // Reset the timeout since we're still receiving tokens
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = setTimeout(() => {
          setIsStreaming(false);
        }, 3000); // 3 seconds of no tokens = end of stream
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsStreaming(false);
        console.log('Chat WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        setIsConnected(false);
        setIsStreaming(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to chat WebSocket:', error);
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !wsRef.current || !isConnected || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);

    // Create placeholder for assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    
    // Reset current response and start streaming
    currentResponseRef.current = '';
    setIsStreaming(true);
    
    // Construct structured message payload
    // Convert activeFilters array to object format expected by backend
    const filtersObject = activeFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {} as Record<string, string>);

    const messagePayload = {
      question: inputValue.trim(),
      context_logs: contextLogs,
      active_filters: filtersObject
    };
    
    // Send structured JSON to WebSocket
    wsRef.current.send(JSON.stringify(messagePayload));
    setInputValue('');

    // Set a timeout to stop streaming indicator (fallback)
    setTimeout(() => {
      setIsStreaming(false);
    }, 30000); // 30 second timeout
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Paper
      withBorder
      radius="lg"
      style={{
        height: '100%',
        backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      {/* Header */}
      <Box
        p="md"
        style={{
          borderBottom: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
          backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#f8f9fa',
          transition: 'all 0.3s ease'
        }}
      >
        <Group gap="xs" justify="space-between">
          <Group gap="xs">
            <IconRobot size="1.2rem" color={colorScheme === 'dark' ? '#339af0' : '#1971c2'} />
            <Text fw={600} size="sm" style={{ transition: 'color 0.2s ease' }}>Chat with Lode</Text>
          </Group>
          <Group gap="xs">
            {contextLogs.length > 0 && (
              <Badge size="sm" color="blue" variant="light" style={{ transition: 'all 0.2s ease' }}>
                {contextLogs.length} log{contextLogs.length !== 1 ? 's' : ''} in context
              </Badge>
            )}
            <Box
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#51cf66' : '#fa5252',
                transition: 'background-color 0.3s ease',
                boxShadow: isConnected ? '0 0 6px rgba(81, 207, 102, 0.5)' : 'none'
              }}
            />
          </Group>
        </Group>
      </Box>

      {/* Messages */}
      <ScrollArea
        flex={1}
        p="md"
        viewportRef={scrollAreaRef}
        style={{
          backgroundColor: colorScheme === 'dark' ? '#25262b' : 'white',
          transition: 'background-color 0.3s ease'
        }}
      >
        <Stack gap="md" style={{ width: '100%' }}>
          {messages.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" mt="xl" style={{ transition: 'color 0.2s ease' }}>
              Ask me anything about your logs!
            </Text>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: '8px',
                width: '100%',
                animation: 'fadeInUp 0.3s ease'
              }}
            >
              <ActionIcon
                size="sm"
                variant="light"
                color={message.sender === 'user' ? 'blue' : 'green'}
                style={{
                  marginTop: '2px',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                {message.sender === 'user' ? <IconUser size="0.8rem" /> : <IconRobot size="0.8rem" />}
              </ActionIcon>
              <Paper
                p="sm"
                radius="lg"
                style={{
                  backgroundColor: message.sender === 'user'
                    ? (colorScheme === 'dark' ? '#339af0' : '#228be6')
                    : (colorScheme === 'dark' ? '#2b2c30' : '#f8f9fa'),
                  color: message.sender === 'user' ? 'white' : undefined,
                  minWidth: '120px',
                  maxWidth: '75%',
                  wordBreak: 'break-word',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                  border: message.sender === 'assistant' 
                    ? (colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef')
                    : 'none',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Text 
                  size="sm" 
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    transition: 'color 0.2s ease',
                    lineHeight: 1.4
                  }}
                >
                  {message.content}
                  {message.sender === 'assistant' && isStreaming && message.content === currentResponseRef.current && (
                    <Loader size="xs" ml="xs" style={{ display: 'inline-block' }} />
                  )}
                </Text>
              </Paper>
            </div>
          ))}
        </Stack>
      </ScrollArea>

      {/* Input */}
      <Box
        p="md"
        style={{
          borderTop: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
          backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#f8f9fa',
          transition: 'all 0.3s ease'
        }}
      >
        <Group gap="xs">
          <TextInput
            flex={1}
            placeholder="Ask about your logs..."
            value={inputValue}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            onKeyDown={handleKeyPress}
            disabled={!isConnected || isStreaming}
            size="sm"
            radius="md"
            style={{
              transition: 'all 0.2s ease',
              '&:focus': {
                boxShadow: '0 0 0 3px rgba(51, 154, 240, 0.1)',
                transform: 'translateY(-1px)'
              }
            }}
          />
          <ActionIcon
            onClick={sendMessage}
            disabled={!inputValue.trim() || !isConnected || isStreaming}
            variant="filled"
            color="blue"
            size="lg"
            radius="md"
            style={{
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(51, 154, 240, 0.3)'
              },
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed'
              }
            }}
          >
            <IconSend size="1rem" />
          </ActionIcon>
        </Group>
      </Box>
    </Paper>
  );
}

export default ChatPanel;
