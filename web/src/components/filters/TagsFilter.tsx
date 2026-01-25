import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { Status } from "@notion-site/common/dto/primitives.js";
import { Row } from "../layout/FlexBox.js";
import { Tooltip } from "../layout/Tooltip.js";
import { Badge } from "../typography/Badge.js";
import { Text } from "../typography/Text.js";

export type TagsFilterProps<T extends string> = {
  options: {
    name: T;
    color: zNotion.primitives.color;
    status?: Status | null;
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
        <Tooltip
          key={option.name}
          disabled={!option.description}
          content={
            <Text
              as="div"
              size="caption"
              color="muted"
              p={1}
              style={{ maxWidth: 250 }}
            >
              {option.description}
            </Text>
          }
        >
          <a
            style={{ cursor: "pointer" }}
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
              status={option.status ?? undefined}
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
        </Tooltip>
      ))}
    </Row>
  );
}
