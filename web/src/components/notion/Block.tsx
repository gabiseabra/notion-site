import * as n from "@notion-site/common/dto/notion/schema.js";
import { RichText } from "./RichText.js";

export function Block({ data }: { data: n.block }) {
  switch (data.type) {
    case "paragraph":
      return (
        <RichText
          data={data.paragraph.rich_text}
          color={data.paragraph.color}
        />
      );
  }
}

export function Blocks({ data }: { data: n.block[] }) {
  return (
    <div>
      {data.map((block) => (
        <Block key={block.id} data={block} />
      ))}
    </div>
  );
}
