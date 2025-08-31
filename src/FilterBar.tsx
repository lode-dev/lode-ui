import { Group, Badge, CloseButton, Button } from '@mantine/core';
import { IconFilterPlus } from '@tabler/icons-react';

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
  const levelSuggestions = suggestions?.common_levels?.buckets || [];
  const userSuggestions = suggestions?.common_user_ids?.buckets || [];
  const hasSuggestions = levelSuggestions.length > 0 || userSuggestions.length > 0;

  if (filters.length === 0 && !hasSuggestions) {
    return null;
  }

  return (
    <Group gap="xs" mb="md">
      {/* Active filters */}
      {filters.map((filter, index) => (
        <Badge
          key={index}
          variant="outline"
          color="gray"
          size="lg"
          rightSection={
            <CloseButton
              size="xs"
              onClick={() => onRemoveFilter(index)}
              aria-label={`Remove filter ${filter.key}: ${filter.value}`}
            />
          }
        >
          {filter.key}: {filter.value}
        </Badge>
      ))}
      
      {/* Suggested filters */}
      {onAddFilter && (
        <>
          {levelSuggestions.map(s => (
            <Button
              key={`level-${s.key}`}
              variant="light"
              color="gray"
              size="xs"
              leftSection={<IconFilterPlus size="0.9rem" />}
              onClick={() => onAddFilter('level', s.key)}
            >
              level: {s.key}
            </Button>
          ))}
          {userSuggestions.map(s => (
            <Button
              key={`user-${s.key}`}
              variant="light"
              color="gray"
              size="xs"
              leftSection={<IconFilterPlus size="0.9rem" />}
              onClick={() => onAddFilter('metadata.user_id', s.key)}
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
