import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { getRichTextContent } from "@notion-site/common/utils/notion/rich-text.js";
import { match } from "ts-pattern";
import { Image } from "../display/Image.js";
import { Span, Text } from "../display/Text.js";
import { LinkToPage } from "../navigation/LinkToPage.js";
import { RichText, RichTextProps } from "./RichText.js";
import { ContentEditableProps } from "./hooks/use-content-editable.js";

type BlockProps = {
  indent?: number;
  value: zNotion.blocks.block;
  inline?: Partial<RichTextProps>;
} & ContentEditableProps;

/**
 * Renders a single block node according to its type.
 * @direction block
 */
export function Block({
  value,
  inline: inlineProps,
  ...blockProps
}: BlockProps) {
  const contentProps = (rich_text: zNotion.properties.rich_text_item) =>
    blockProps.contentEditable
      ? {
          dangerouslySetInnerHTML: {
            __html: richTextToString(rich_text),
          },
        }
      : {
          children: <RichText value={rich_text} {...inlineProps} />,
        };

  return (
    <>
      {match(value)
        .with({ type: "paragraph" }, (block) => (
          <Text
            as="p"
            color={block.paragraph.color}
            {...contentProps(block.paragraph.rich_text)}
            {...blockProps}
          />
        ))
        .with({ type: "bulleted_list_item" }, (block) => (
          <Text
            as="p"
            color={block.bulleted_list_item.color}
            {...contentProps(block.bulleted_list_item.rich_text)}
            {...blockProps}
          />
        ))
        .with({ type: "numbered_list_item" }, (block) => (
          <Text
            as="p"
            color={block.numbered_list_item.color}
            {...contentProps(block.numbered_list_item.rich_text)}
            {...blockProps}
          />
        ))
        .with({ type: "heading_1" }, (block) => (
          <Text
            as="h2"
            color={block.heading_1.color}
            {...contentProps(block.heading_1.rich_text)}
            {...blockProps}
          />
        ))
        .with({ type: "heading_2" }, (block) => (
          <Text
            as="h3"
            color={block.heading_2.color}
            {...contentProps(block.heading_2.rich_text)}
            {...blockProps}
          />
        ))
        .with({ type: "heading_3" }, (block) => (
          <Text
            as="h4"
            color={block.heading_3.color}
            {...contentProps(block.heading_3.rich_text)}
            {...blockProps}
          />
        ))
        .with({ type: "quote" }, (block) => (
          <Text
            as="blockquote"
            color={block.quote.color}
            {...contentProps(block.quote.rich_text)}
            {...blockProps}
          />
        ))
        .with({ type: "divider" }, () => <hr {...blockProps} />)
        .with({ type: "link_to_page" }, (data) => (
          <LinkToPage id={data.link_to_page.page_id} />
        ))
        .with({ type: "child_page" }, (data) => <LinkToPage id={data.id} />)
        .with({ type: "image" }, (data) => (
          <Image
            title={getRichTextContent(data.image.caption) || undefined}
            caption={
              data.image.caption.length > 0 && (
                <RichText size="caption" value={data.image.caption} />
              )
            }
            src={match(data.image)
              .with({ type: "external" }, ({ external }) => external.url)
              .with({ type: "file" }, ({ file }) => file.url)
              .exhaustive()}
          />
        ))
        .exhaustive()}
    </>
  );
}

function richTextToString(rich_text: zNotion.properties.rich_text_item) {
  return rich_text
    .filter(hasPropertyValue("type", "text"))
    .map((item) =>
      item.text.link
        ? `<a class="${Span.className(item.annotations)}">${item.text.content}</a>`
        : `<span class="${Span.className(item.annotations)}">${item.text.content}</span>`,
    )
    .join("");
}
