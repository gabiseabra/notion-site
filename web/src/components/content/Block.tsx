import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { createContext, ReactNode, useContext } from "react";
import { match } from "ts-pattern";
import * as css from "../../css/index.js";
import { Accordion } from "../display/Accordion.js";
import { Callout } from "../display/Callout.js";
import { Image } from "../display/Image.js";
import { Span, Text } from "../display/Text.js";
import { Checkbox } from "../inputs/Checkbox.js";
import { LinkToPage } from "../navigation/LinkToPage.js";
import { CodeBlock } from "./CodeBlock.js";
import { RichText, RichTextProps } from "./RichText.js";
import { ContentEditableProps } from "./editable/types.js";

type BlockProps = {
  value: Notion.Block;
  indent?: number;
  editable?: boolean;
  onEditorChange?: (block: Notion.Block) => void;
  inline?: Partial<RichTextProps>;
  children?: ReactNode;
} & ContentEditableProps;

/**
 * Renders a single block node according to its type.
 * @direction block
 */
export function Block({
  value,
  indent,
  editable,
  onEditorChange,
  inline: inlineProps,
  children,
  ...editableProps
}: BlockProps) {
  const indentCtx = useContext(IndentationLevel);
  indent ??= indentCtx;

  const contentProps = (rich_text: Notion.RichText) =>
    editable
      ? {
          indent,
          tabIndex: 1,
          contentEditable: "plaintext-only" as const,
          suppressContentEditableWarning: true,
          translate: "no" as const,
          dangerouslySetInnerHTML: {
            __html: richTextToHTML(rich_text),
          },
          ...editableProps,
        }
      : {
          indent,
          children: <RichText value={rich_text} {...inlineProps} />,
        };

  return (
    <>
      {match(value)
        .with({ type: "paragraph" }, (block) => (
          <>
            <Text
              as="p"
              color={block.paragraph.color}
              {...contentProps(block.paragraph.rich_text)}
              {...editableProps}
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "bulleted_list_item" }, (block) => (
          <li>
            <Text
              as="p"
              color={block.bulleted_list_item.color}
              {...contentProps(block.bulleted_list_item.rich_text)}
              {...editableProps}
            />

            {children}
          </li>
        ))
        .with({ type: "numbered_list_item" }, (block) => (
          <li>
            <Text
              as="p"
              color={block.numbered_list_item.color}
              {...contentProps(block.numbered_list_item.rich_text)}
              {...editableProps}
            />

            {children}
          </li>
        ))
        .with({ type: "to_do" }, (block) => (
          <>
            <Checkbox
              checked={block.to_do.checked}
              onToggleChecked={(checked) =>
                onEditorChange?.({
                  ...block,
                  to_do: {
                    ...block.to_do,
                    checked,
                  },
                })
              }
              {...contentProps(block.to_do.rich_text)}
              {...editableProps}
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "heading_1" }, (block) => (
          <>
            <Text
              as="h2"
              color={block.heading_1.color}
              {...contentProps(block.heading_1.rich_text)}
              {...editableProps}
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "heading_2" }, (block) => (
          <>
            <Text
              as="h3"
              color={block.heading_2.color}
              {...contentProps(block.heading_2.rich_text)}
              {...editableProps}
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "heading_3" }, (block) => (
          <>
            <Text
              as="h4"
              color={block.heading_3.color}
              {...contentProps(block.heading_3.rich_text)}
              {...editableProps}
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "quote" }, (block) => (
          <>
            <Text
              as="blockquote"
              color={block.quote.color}
              {...contentProps(block.quote.rich_text)}
              {...editableProps}
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "divider" }, () => (
          <>
            <div style={{ marginLeft: css.indent(indent) }}>
              <hr {...editableProps} />
            </div>

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "link_to_page" }, (data) => (
          <>
            <LinkToPage id={data.link_to_page.page_id} indent={indent} />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "child_page" }, (data) => (
          <>
            <LinkToPage id={data.id} indent={indent} />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "image" }, (data) => (
          <>
            <Image
              title={Notion.RTF.getContent(data.image.caption) || undefined}
              indent={indent}
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

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "code" }, (block) => (
          <>
            <CodeBlock
              block={block}
              indent={indent}
              onEditorChange={onEditorChange}
              editable={editable}
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "callout" }, (block) => (
          <Callout
            icon={block.callout.icon}
            background={block.callout.color}
            indent={indent}
          >
            <RichText value={block.callout.rich_text} />

            {children}
          </Callout>
        ))
        .with({ type: "toggle" }, (block) => (
          <Accordion
            summary={
              <Text
                as="p"
                color={block.toggle.color}
                {...contentProps(block.toggle.rich_text)}
                {...editableProps}
              />
            }
          >
            {children}
          </Accordion>
        ))
        .exhaustive()}
    </>
  );
}

const IndentationLevel = createContext(0);

export function richTextToHTML(rich_text: Notion.RichText) {
  if (rich_text.length === 0) return `<span class="${Span.className({})}" />`;
  return rich_text
    .filter(hasPropertyValue("type", "text"))
    .map((item) =>
      item.text.link
        ? `<a href="${item.text.link.url}" class="${Span.className(item.annotations)}">${item.text.content}</a>`
        : `<span class="${Span.className(item.annotations)}">${item.text.content}</span>`,
    )
    .join("");
}
