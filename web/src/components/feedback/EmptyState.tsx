import { Text } from "../display/Text.js";
import { Col } from "../layout/FlexBox.js";

export function EmptyState({
  title,
  size,
}: {
  title: string;
  size: "l" | "m" | "s";
}) {
  return (
    <Col
      mx={{ l: 4, m: 2.5, s: 1 }[size]}
      my={{ l: 2, m: 1, s: 0 }[size]}
      style={{ display: "block", textAlign: "center" }}
    >
      {size !== "s" && (
        <Text as="p" size={({ l: "h2", m: "h3" } as const)[size]}>
          ¯\_(ツ)_/¯
        </Text>
      )}

      <Text
        as="p"
        color="muted"
        style={{
          fontSize: {
            l: "1em",
            m: ".85em",
            s: ".75em",
          }[size],
        }}
      >
        {title}
      </Text>
    </Col>
  );
}
