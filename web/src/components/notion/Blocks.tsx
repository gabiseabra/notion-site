import * as n from "@notion-site/common/dto/notion/schema.js";
import { RichText } from "./RichText.js";
import { match } from "ts-pattern";
import { isTruthy } from "@notion-site/common/utils/guards.js";

export function Blocks({ data }: { data: n.block[] }) {
  return (
    <div className="Blocks">
      {data.map((block) => (
        <Block
          key={block.id}
          data={block}
          indent={getIndentation(block, data)}
        />
      ))}
    </div>
  );
}

function Block({ data, indent }: { data: n.block; indent?: number }) {
  return (
    <div
      className={["Block", indent && `indent-${indent}`]
        .filter(isTruthy)
        .join(" ")}
    >
      {match(data)
        .with({ type: "paragraph" }, (data) => (
          <RichText
            data={data.paragraph.rich_text}
            color={data.paragraph.color}
          />
        ))
        .with({ type: "heading_1" }, (data) => (
          <RichText
            as="h2"
            data={data.heading_1.rich_text}
            color={data.heading_1.color}
          />
        ))
        .with({ type: "heading_2" }, (data) => (
          <RichText
            as="h3"
            data={data.heading_2.rich_text}
            color={data.heading_2.color}
          />
        ))
        .with({ type: "heading_3" }, (data) => (
          <RichText
            as="h4"
            data={data.heading_3.rich_text}
            color={data.heading_3.color}
          />
        ))
        .otherwise(() => null)}
    </div>
  );
}

function getIndentation({ parent }: n.block, context: n.block[]): number {
  if (parent.type === "page_id") return 0;
  const block = context.find((b) => b.id === parent.block_id);
  return 1 + (block ? getIndentation(block, context) : 0);
}
