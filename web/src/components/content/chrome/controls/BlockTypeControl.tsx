import { Notion } from "@notion-site/common/utils/notion/index.js";
import { useEffect } from "react";
import { FaHeading, FaParagraph } from "react-icons/fa";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { IconControl } from "../../../display/Icon.js";
import { Span } from "../../../display/Text.js";
import {
  Dropdown,
  DropdownOption,
  useDropdown,
} from "../../../inputs/Dropdown.js";
import { Input } from "../../../inputs/Input.js";
import { Row } from "../../../layout/FlexBox.js";
import { IsolationFrame } from "../../../overlays/IsolationFrame.js";

const options = [
  {
    id: "paragraph",
    title: "Paragraph",
    icon: <FaParagraph />,
  },
  {
    id: "heading_1",
    title: "Heading 1",
    icon: <FaHeading style={{ transform: "scale(1)" }} />,
  },
  {
    id: "heading_2",
    title: "Heading 2",
    icon: <FaHeading style={{ transform: "scale(0.85)" }} />,
  },
  {
    id: "heading_3",
    title: "Heading 3",
    icon: <FaHeading style={{ transform: "scale(0.75)" }} />,
  },
] as const;

export function BlockTypeControl({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean | "action";
  value?: Notion.Block.BlockType;
  onChange: (color: Notion.Block.BlockType) => void;
}) {
  const selectedOption = value && options.find((option) => option.id === value);

  const dropdown = useDropdown({
    options,
    disabled: !!disabled,
    filter: (option, value) =>
      !value || new RegExp(value, "i").test(option.title),
    initialFocusedId: selectedOption?.id,
  });

  useEffect(() => {
    dropdown.reset();
  }, [value]);

  return (
    <Row
      onKeyDown={(e) => {
        const direction = (() => {
          if (e.key === "ArrowDown") return 1;
          if (e.key === "ArrowUp") return -1;
        })();
        const option = direction && Dropdown.rotate(dropdown, direction);

        if (option) {
          dropdown.setFocusedId(option.id);
          document.getElementById(`block-type--${option.id}`)?.focus();
        }
      }}
    >
      <Dropdown
        open={dropdown.open}
        onClose={() => dropdown.setOpen(false)}
        options={dropdown.visibleOptions}
        renderOption={(option) => (
          <DropdownOption
            id={`block-type--${option.id}`}
            active={option.id === value}
            focused={dropdown.focusedId === option.id}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Space") {
                onChange(option.id);
                e.preventDefault();
              }
            }}
          >
            <IconControl as="span" size="s" color="currentColor">
              {option.icon}
            </IconControl>

            <Span size="body">{option.title}</Span>
          </DropdownOption>
        )}
      >
        <IsolationFrame resize="y" style={{ width: 160 }}>
          <Input
            type="text"
            label="Block type"
            hiddenLabel
            size="s"
            style={{ padding: 2 }}
            placeholder="Block type"
            disabled={disabled}
            value={dropdown.value ?? selectedOption?.title ?? ""}
            onChange={dropdown.setValue}
            onFocus={() => Dropdown.toggle(dropdown)}
            right={
              <IconControl as="span" size="m" color="currentColor">
                {dropdown.open ? <RxCaretDown /> : <RxCaretUp />}
              </IconControl>
            }
          />
        </IsolationFrame>
      </Dropdown>
    </Row>
  );
}
