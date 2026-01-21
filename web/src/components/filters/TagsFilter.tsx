import * as zn from "@notion-site/common/dto/notion/schema.js";
import { Row } from "../layout/FlexBox.js";
import { Badge, BadgeProps } from "../typography/Badge.js";

export type TagsFilterProps<T extends string> = {
  options: {
    name: T;
    color: zn.color;
    status?: BadgeProps["status"];
    description?: string | null;
  }[];
  value: T[];
  onChange: (options: T[]) => void;
};

export function TagsFilter<T extends string>({
  options,
  value,
  onChange,
}: TagsFilterProps<T>) {
  return (
    <Row wrap>
      {options.map((option) => (
        <a
          key={option.name}
          title={option.description ?? undefined}
          onClick={() =>
            onChange(
              value.includes(option.name)
                ? value.filter((v) => v !== option.name)
                : [...value, option.name],
            )
          }
        >
          <Badge
            size="s"
            status={option.status}
            color={option.color}
            style={{
              outline: value.includes(option.name)
                ? "1px solid currentColor"
                : undefined,
            }}
          >
            {option.name}
          </Badge>
        </a>
      ))}
    </Row>
  );
}
