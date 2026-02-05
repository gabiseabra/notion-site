import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { getRichTextContent } from "@notion-site/common/utils/notion/rich-text.js";
import { match } from "ts-pattern";
import { Image } from "../display/Image.js";
import { Text } from "../display/Text.js";
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
  return (
    <>
      {match(value)
        .with({ type: "paragraph" }, (value) => (
          <Text as="p" color={value.paragraph.color} {...blockProps}>
            <RichText value={value.paragraph.rich_text} {...inlineProps} />
          </Text>
        ))
        .with({ type: "bulleted_list_item" }, (data) => (
          <Text as="p" color={data.bulleted_list_item.color} {...blockProps}>
            <RichText
              value={data.bulleted_list_item.rich_text}
              {...inlineProps}
            />
          </Text>
        ))
        .with({ type: "numbered_list_item" }, (data) => (
          <Text as="p" color={data.numbered_list_item.color} {...blockProps}>
            <RichText
              value={data.numbered_list_item.rich_text}
              {...inlineProps}
            />
          </Text>
        ))
        .with({ type: "heading_1" }, (data) => (
          <Text as="h2" {...blockProps}>
            <RichText value={data.heading_1.rich_text} {...inlineProps} />
          </Text>
        ))
        .with({ type: "heading_2" }, (data) => (
          <Text as="h3" {...blockProps}>
            <RichText value={data.heading_2.rich_text} {...inlineProps} />
          </Text>
        ))
        .with({ type: "heading_3" }, (data) => (
          <Text as="h4" {...blockProps}>
            <RichText value={data.heading_3.rich_text} {...inlineProps} />
          </Text>
        ))
        .with({ type: "quote" }, (data) => (
          <Text as="blockquote" {...blockProps}>
            <RichText value={data.quote.rich_text} {...inlineProps} />
          </Text>
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
