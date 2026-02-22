import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { titleCase } from "@notion-site/common/utils/case.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Fragment, isValidElement, ReactNode, useState } from "react";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { IconControl } from "../../display/Icon.js";
import { Col, Row } from "../../layout/FlexBox.js";
import { Popover } from "../../overlays/Popover.js";
import {
  isAnnotated,
  NotionCommand,
  toggleAnnotations,
} from "../editable/notion/command.js";
import { Editor } from "../Editor.js";
import { useEditorSelectionRange } from "../editor/use-editor-selection-range.js";
import styles from "./Toolbar.module.scss";

export function DocumentToolbar({ editor }: { editor: Editor }) {
  return (
    <div className={styles["document-toolbar"]}>
      <Toolbar editor={editor} />
    </div>
  );
}

export function FloatingToolbar({ editor }: { editor: Editor }) {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  useDocumentEventListener("selectionchange", () => {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    const selectionRect = range?.getBoundingClientRect();

    if (selectionRect && selectionRect.height && selectionRect.width) {
      setSelectionRect(selectionRect);
    } else {
      setSelectionRect(null);
    }
  });

  return (
    <Popover
      open={!!selectionRect}
      offset={2}
      placements={["top", "right", "left", "bottom"]}
      content={<Toolbar editor={editor} />}
    >
      <div
        style={{
          width: selectionRect?.width ?? 0,
          height: "1em",
          position: "fixed",
          top: selectionRect?.top ?? -1,
          left: selectionRect?.left ?? -1,
        }}
      />
    </Popover>
  );
}

export function Toolbar({ editor }: { editor: Editor }) {
  const selection = useEditorSelectionRange(editor);
  const selectedBlock = selection && editor.get(selection.id);

  const selectedColor =
    selectedBlock &&
    selection &&
    (colors.find((color) => isAnnotated({ color })(selectedBlock, selection)) ??
      colors
        .map((color) => `${color}_background` as const)
        .find((color) => isAnnotated({ color })(selectedBlock, selection)) ??
      null);

  function execCommand(
    fn: (block: Notion.Block, selection: SelectionRange) => Notion.Block | null,
  ) {
    const block = selectedBlock && selection && fn(selectedBlock, selection);

    if (block) {
      editor.update(block, {
        selectionBefore: selection,
        selectionAfter: selection,
      });
      editor.commit();
    }
  }

  return (
    <Row gap={0} alignX="start">
      {(["bold", "italic", "underline", "striketrough"] as const)
        .map((cmd) => [cmd, NotionCommand[cmd]] as const)
        .map(([key, cmd]) => (
          <ToolbarButton
            key={key}
            active={
              !!selectedBlock &&
              selection &&
              cmd.isActive(selectedBlock, selection)
            }
            title={cmd.key}
            onClick={() => execCommand(cmd.command)}
          >
            {cmd.icon}
          </ToolbarButton>
        ))}

      <Divider />

      <ToolbarMenu
        options={colors.map((color) => {
          const isColorActive =
            !!selectedBlock &&
            !!selection &&
            isAnnotated({ color })(selectedBlock, selection);
          const isBackgroundActive =
            !!selectedBlock &&
            !!selection &&
            isAnnotated({ color: `${color}_background` })(
              selectedBlock,
              selection,
            );

          return (
            <ToolbarMenu.Item
              key={color}
              active={isColorActive}
              color={color}
              onClick={() => execCommand(toggleAnnotations({ color }))}
            >
              {color == "default" ? (
                <div className={styles["bg-color-button"]} />
              ) : (
                <div
                  title={`Toggle background color`}
                  className={[
                    styles["bg-color-button"],
                    styles[`color-${color}_background`],
                    isBackgroundActive ? styles[`active`] : "",
                  ].join(" ")}
                  onClick={(e) => {
                    execCommand(
                      toggleAnnotations({ color: `${color}_background` }),
                    );
                    e.stopPropagation();
                  }}
                />
              )}

              {titleCase(color)}
            </ToolbarMenu.Item>
          );
        })}
      >
        <ToolbarButton>
          <TextColorIcon color={selectedColor} />
        </ToolbarButton>
      </ToolbarMenu>
    </Row>
  );
}

const Divider = () => <div className={styles.divider} />;

function ToolbarButton({
  children,
  title,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <IconControl
      as="button"
      size="s"
      p={1}
      color={active ? "blue" : disabled ? "gray" : "default"}
      title={title}
      onClick={!disabled ? onClick : undefined}
    >
      {children}
    </IconControl>
  );
}

function ToolbarPopover({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      open={isOpen}
      offset={1}
      placements={["bottom", "left", "right", "top"]}
      content={content}
      onClickOutside={() => setIsOpen(false)}
      onOffScreen={() => setIsOpen(false)}
    >
      <span onClick={() => setIsOpen((open) => !open)}>{children}</span>
    </Popover>
  );
}

function ToolbarMenu({
  options,
  ...props
}: {
  children: ReactNode;
  options: ReactNode[];
}) {
  return (
    <ToolbarPopover
      content={
        <Col gap={0} className={styles["toolbar-menu"]}>
          {options.map((option, ix) => (
            <Fragment key={isValidElement(option) ? (option.key ?? ix) : ix}>
              {option}
            </Fragment>
          ))}
        </Col>
      }
      {...props}
    />
  );
}

ToolbarMenu.Item = function ToolbarMenuItem({
  children,
  color,
  active,
  onClick,
}: {
  children: ReactNode;
  color?: zNotion.primitives.color;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={[
        styles["toolbar-menu-item"],
        color ? styles[`color-${color}`] : "",
        active ? styles["active"] : "",
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

function TextColorIcon({
  color,
}: {
  color: zNotion.primitives.api_color | null;
}) {
  return (
    <span
      className={[
        styles["text-color"],
        color ? styles[`color-${color}`] : "",
      ].join(" ")}
    >
      <span className={styles["text-color--bg"]} />
      <span className={styles["text-color--text"]}>A</span>
    </span>
  );
}

const colors = [
  "default",
  "gray",
  "purple",
  "pink",
  "red",
  "blue",
  "green",
  "brown",
  "orange",
  "yellow",
] as const;
