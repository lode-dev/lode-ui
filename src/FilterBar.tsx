import { Group, Badge, CloseButton, Button, useMantineColorScheme, Menu, TextInput, Select } from '@mantine/core';
import { IconFilterPlus, IconPlus, IconEdit } from '@tabler/icons-react';
import { useState } from 'react';

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

interface FilterBarProps {
  filters: Filter[];
  onRemoveFilter: (index: number) => void;
  suggestions?: Suggestions;
  onAddFilter?: (key: string, value: string) => void;
}

function FilterBar({ filters, onRemoveFilter, suggestions, onAddFilter }: FilterBarProps) {
  const { colorScheme } = useMantineColorScheme();
  const [editingFilter, setEditingFilter] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingFilter, setAddingFilter] = useState(false);
  const [newFilterKey, setNewFilterKey] = useState('');
  const [newFilterValue, setNewFilterValue] = useState('');
  const levelSuggestions = suggestions?.common_levels?.buckets || [];
  const userSuggestions = suggestions?.common_user_ids?.buckets || [];
  const hasSuggestions = levelSuggestions.length > 0 || userSuggestions.length > 0;

  // Always show the FilterBar if onAddFilter is available, even with no filters/suggestions
  if (filters.length === 0 && !hasSuggestions && !onAddFilter) {
    return null;
  }

  const buttonBaseStyle = {
    fontWeight: 500,
    backgroundColor: colorScheme === 'dark' ? '#25262b' : '#f8f9fa',
    border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #e9ecef',
    color: colorScheme === 'dark' ? '#c1c2c5' : '#495057',
    '&:hover': {
      backgroundColor: colorScheme === 'dark' ? '#2c2e33' : '#e9ecef',
      transform: 'translateY(-1px)'
    }
  };

  const commonFilterFields = [
    { key: 'level', label: 'Log Level' },
    { key: 'metadata.user_id', label: 'User ID' },
    { key: 'metadata.trace_id', label: 'Trace ID' },
    { key: 'metadata.source_ip', label: 'Source IP' },
    { key: 'message', label: 'Message' },
    { key: 'timestamp', label: 'Timestamp' }
  ];

  const handleEditFilter = (index: number) => {
    setEditingFilter(index);
    setEditValue(filters[index].value);
  };

  const handleSaveEdit = (index: number) => {
    if (editValue.trim() && onAddFilter) {
      // Remove old filter and add new one
      const filter = filters[index];
      onRemoveFilter(index);
      onAddFilter(filter.key, editValue.trim());
    }
    setEditingFilter(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingFilter(null);
    setEditValue('');
  };

  const handleStartAddFilter = () => {
    setAddingFilter(true);
    setNewFilterKey('');
    setNewFilterValue('');
  };

  const handleSaveNewFilter = () => {
    if (newFilterKey && newFilterValue.trim() && onAddFilter) {
      onAddFilter(newFilterKey, newFilterValue.trim());
    }
    setAddingFilter(false);
    setNewFilterKey('');
    setNewFilterValue('');
  };

  const handleCancelAddFilter = () => {
    setAddingFilter(false);
    setNewFilterKey('');
    setNewFilterValue('');
  };

  return (
    <Group gap="sm" wrap="wrap">
      {/* Active filters */}
      {filters.map((filter, index) => (
        editingFilter === index ? (
          <Group key={index} gap="xs">
            <TextInput
              size="xs"
              value={editValue}
              onChange={(e) => setEditValue(e.currentTarget.value)}
              placeholder={`Enter ${filter.key} value`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit(index);
                if (e.key === 'Escape') handleCancelEdit();
              }}
              style={{ width: '150px' }}
            />
            <Button size="xs" onClick={() => handleSaveEdit(index)}>Save</Button>
            <Button size="xs" variant="subtle" onClick={handleCancelEdit}>Cancel</Button>
          </Group>
        ) : (
          <Badge
            key={index}
            variant="filled"
            color="blue.6"
            size="md"
            radius="xl"
            style={{
              paddingRight: '4px',
              fontWeight: 500,
              backgroundColor: '#339af0',
              boxShadow: '0 1px 3px rgba(51, 154, 240, 0.3)',
              height: '32px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
            onClick={() => handleEditFilter(index)}
            rightSection={
              <CloseButton
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFilter(index);
                }}
                aria-label={`Remove filter ${filter.key}: ${filter.value}`}
                style={{ 
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              />
            }
          >
            {filter.key}: {filter.value}
          </Badge>
        )
      ))}

      {/* Add filter button when filters are active OR when showing suggestions */}
      {onAddFilter && !addingFilter && (
        <Button
          variant="light"
          color="gray.6"
          size="xs"
          radius="xl"
          leftSection={<IconPlus size="0.8rem" />}
          onClick={handleStartAddFilter}
          style={{
            ...buttonBaseStyle,
            height: '32px',
            fontSize: '0.875rem'
          }}
        >
          Add Filter
        </Button>
      )}

      {/* Add filter form */}
      {addingFilter && (
        <Group gap="xs">
          <Select
            size="xs"
            placeholder="Field"
            value={newFilterKey}
            onChange={(value) => setNewFilterKey(value || '')}
            data={commonFilterFields.map(field => ({ value: field.key, label: field.label }))}
            style={{ width: '120px' }}
          />
          <TextInput
            size="xs"
            placeholder="Value"
            value={newFilterValue}
            onChange={(e) => setNewFilterValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNewFilter();
              if (e.key === 'Escape') handleCancelAddFilter();
            }}
            style={{ width: '120px' }}
          />
          <Button size="xs" onClick={handleSaveNewFilter}>Add</Button>
          <Button size="xs" variant="subtle" onClick={handleCancelAddFilter}>Cancel</Button>
        </Group>
      )}
      
      {/* Suggested filters */}
      {onAddFilter && filters.length === 0 && (
        <>
          {levelSuggestions.map(s => (
            <Button
              key={`level-${s.key}`}
              variant="light"
              color="gray.6"
              size="xs"
              radius="xl"
              leftSection={<IconFilterPlus size="0.8rem" />}
              onClick={() => onAddFilter('level', s.key)}
              style={{
                ...buttonBaseStyle,
                height: '32px',
                fontSize: '0.875rem',
                border: colorScheme === 'dark' ? '1px dashed #495057' : '1px dashed #adb5bd',
                opacity: 0.8,
                fontStyle: 'italic'
              }}
            >
              level: {s.key}
            </Button>
          ))}
          {userSuggestions.map(s => (
            <Button
              key={`user-${s.key}`}
              variant="light"
              color="gray.6"
              size="xs"
              radius="xl"
              leftSection={<IconFilterPlus size="0.8rem" />}
              onClick={() => onAddFilter('metadata.user_id', s.key)}
              style={{
                ...buttonBaseStyle,
                height: '32px',
                fontSize: '0.875rem',
                border: colorScheme === 'dark' ? '1px dashed #495057' : '1px dashed #adb5bd',
                opacity: 0.8,
                fontStyle: 'italic'
              }}
            >
              user_id: {s.key}
            </Button>
          ))}
        </>
      )}
    </Group>
  );
}

export default FilterBar;
