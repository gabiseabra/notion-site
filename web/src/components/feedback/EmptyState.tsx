import { Col } from "../layout/FlexBox.js";
import { Text } from "../typography/Text.js";

export function EmptyState({ title }: { title: string }) {
  return (
    <Col mx={4} my={2} style={{ display: "block", textAlign: "center" }}>
      <Text as="p" size="h2">
        ¯\_(ツ)_/¯
      </Text>

      <Text as="p" color="muted">
        {title}
      </Text>
    </Col>
  );
}
