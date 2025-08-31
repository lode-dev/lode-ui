import { Group, Button } from '@mantine/core';
import { IconFilterPlus } from '@tabler/icons-react';

interface Suggestion {
  key: string;
  doc_count: number;
}

interface Suggestions {
  common_levels?: { buckets: Suggestion[] };
  common_user_ids?: { buckets: Suggestion[] };
}

interface SuggestedFiltersProps {
  suggestions: Suggestions;
  onAddFilter: (key: string, value: string) => void;
}

function SuggestedFilters({ suggestions, onAddFilter }: SuggestedFiltersProps) {
  const levelSuggestions = suggestions.common_levels?.buckets || [];
  const userSuggestions = suggestions.common_user_ids?.buckets || [];

  return (
    <Group gap="xs">
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
    </Group>
  );
}

export default SuggestedFilters;
