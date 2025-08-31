import { Group, Badge, CloseButton } from '@mantine/core';

interface Filter {
  key: string;
  value: string;
}

interface FilterBarProps {
  filters: Filter[];
  onRemoveFilter: (index: number) => void;
}

function FilterBar({ filters, onRemoveFilter }: FilterBarProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <Group gap="xs" mb="md">
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
    </Group>
  );
}

export default FilterBar;
