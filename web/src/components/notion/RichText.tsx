import * as zN from "@notion-site/common/dto/notion/schema.js";
import { match } from "ts-pattern";
import { Banner } from "../block/Banner.js";
import { BlockAnnotations, Span, Text, TextElement } from "../inline/Text.js";

export function RichText({
  as,
  data,
  ...props
}: {
  as: TextElement;
  data: zN.rich_text_item;
} & Partial<BlockAnnotations>) {
  return (
    <Text as={as} {...props}>
      {data.length ? (
        data.map((item, ix) =>
          match(item)
            .with({ type: "text" }, (item) => (
              <Span key={`${ix}`} {...item.annotations}>
                {item.text.content}
              </Span>
            ))
            .otherwise(() => <Banner type="warning">Unsupported block</Banner>),
        )
      ) : (
        <span>&nbsp;</span>
      )}
    </Text>
  );
}
