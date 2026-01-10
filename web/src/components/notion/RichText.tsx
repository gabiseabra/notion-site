import * as n from "@notion-site/common/dto/notion/schema.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";

export function RichText({
  data,
  color,
}: {
  data: n.rich_text_item;
  color?: n.api_color;
}) {
  return (
    <span>
      {data.filter(hasPropertyValue("type", "text")).map((item) => {
        return <span>{item.text.content}</span>;
      })}
    </span>
  );
}
