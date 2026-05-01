import { curry } from "@notion-site/common/utils/fp.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { createContext, ReactNode, Ref, useContext } from "react";
import { pipe } from "ts-functional-pipe";
import { match } from "ts-pattern";
import * as css from "../../css/index.js";
import * as env from "../../env";
import { Accordion } from "../display/Accordion.js";
import { Callout } from "../display/Callout.js";
import { Image } from "../display/Image.js";
import { Span, Text } from "../display/Text.js";
import { Checkbox } from "../inputs/Checkbox.js";
import { Col, Row } from "../layout/FlexBox";
import { LinkToPage } from "../navigation/LinkToPage.js";
import { CodeBlock } from "./CodeBlock.js";
import { ContentEditableProps } from "./editable/types.js";
import { toggleToDo } from "./editable/use-notion-plugin/commands";
import { Editor } from "./Editor";
import { RichText, RichTextProps } from "./RichText.js";

type BlockProps = {
  ref?: Ref<HTMLElement>;
  value: Notion.Block;
  indent?: number;
  editor?: Editor;
  disabled?: boolean;
  readOnly?: boolean;
  inline?: Partial<RichTextProps>;
  children?: ReactNode;
} & ContentEditableProps;

/**
 * Renders a single block node according to its type.
 * @direction block
 */
export function Block({
  ref,
  value,
  indent,
  editor,
  disabled,
  readOnly,
  inline: inlineProps,
  children,
  ...editableProps
}: BlockProps) {
  const indentCtx = useContext(IndentationLevel);
  indent ??= indentCtx;

  const contentProps = (rich_text: Notion.RichText) =>
    !readOnly && editor
      ? {
          ref,
          indent,
          dangerouslySetInnerHTML: {
            __html: richTextToHTML(rich_text),
          },
          ...(disabled
            ? { disabled }
            : {
                tabIndex: 1,
                contentEditable: "plaintext-only" as const,
                suppressContentEditableWarning: true,
                translate: "no" as const,
                ...editableProps,
              }),
        }
      : {
          ref,
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
            />

            {children}
          </li>
        ))
        .with({ type: "to_do" }, (block) => (
          <>
            <Checkbox
              checked={block.to_do.checked}
              onToggleChecked={
                editor && pipe(toggleToDo, curry(editor.exec)(block.id))
              }
              {...contentProps(block.to_do.rich_text)}
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
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "heading_4" }, (block) => (
          <>
            <Text
              as="h5"
              color={block.heading_4.color}
              {...contentProps(block.heading_4.rich_text)}
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
            />

            <IndentationLevel.Provider value={indent + 1}>
              {children}
            </IndentationLevel.Provider>
          </>
        ))
        .with({ type: "divider" }, () => (
          <>
            <div style={{ marginLeft: css.indent(indent) }}>
              <hr ref={ref as Ref<HTMLHRElement>} {...editableProps} />
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
                  <RichText
                    size="caption"
                    color="muted"
                    value={data.image.caption}
                  />
                )
              }
              src={`${env.API_URL}/media/${data.id}`}
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
              editor={editor}
              disabled={disabled}
              readOnly={readOnly}
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
              />
            }
          >
            {children}
          </Accordion>
        ))
        .with({ type: "column_list" }, () => <Row gap={2}>{children}</Row>)
        .with({ type: "column" }, (block) => (
          <Col flex={block.column.width_ratio}>{children}</Col>
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
