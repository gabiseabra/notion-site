import { Notion } from "@notion-site/common/utils/notion/index.js";
import { useEffect, useRef } from "react";
import {
  FaCheckSquare,
  FaHeading,
  FaListOl,
  FaListUl,
  FaParagraph,
} from "react-icons/fa";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { IconControl } from "../../../display/Icon.js";
import { Span } from "../../../display/Text.js";
import { Dropdown, useDropdown } from "../../../inputs/Dropdown.js";
import { Input } from "../../../inputs/Input.js";
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
  {
    id: "bulleted_list_item",
    title: "Bulleted list",
    icon: <FaListUl />,
  },
  {
    id: "numbered_list_item",
    title: "Numbered list",
    icon: <FaListOl />,
  },
  {
    id: "to_do",
    title: "To do",
    icon: <FaCheckSquare />,
  },
] as const;

export function BlockTypeControl({
  disabled,
  readOnly,
  value,
  onChange,
}: {
  disabled?: boolean;
  readOnly?: boolean;
  value?: Notion.Block.BlockType;
  onChange: (color: Notion.Block.BlockType) => void;
}) {
  const frameRef = useRef<IsolationFrame>(null);
  const selectedOption = value && options.find((option) => option.id === value);

  const dropdown = useDropdown({
    options,
    disabled,
    filter: (option, value) =>
      !value || new RegExp(value, "i").test(option.title),
    initialFocusedId: selectedOption?.id,
  });

  useEffect(() => {
    dropdown.reset();
  }, [value]);

  return (
    <div
      data-id="block-type-control"
      onClick={(e) => {
        Dropdown.toggle(dropdown);
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Dropdown.Navigator
        dropdown={dropdown}
        contains={(target) =>
          !!frameRef.current?.iframe?.contentDocument?.contains(target)
        }
        onFocusChange={(id) => {
          document.getElementById(`block-type--${id}`)?.scrollIntoView();
          document.getElementById(`block-type--${id}`)?.focus();
        }}
      >
        <Dropdown
          open={dropdown.open}
          onClose={() => dropdown.reset()}
          options={dropdown.visibleOptions}
          renderOption={(option) => (
            <Dropdown.Option
              id={`block-type--${option.id}`}
              active={option.id === value}
              focused={dropdown.focusedId === option.id}
              onClick={() => onChange(option.id)}
              onFocus={() => dropdown.setFocusedId(option.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onChange(option.id);
                  e.preventDefault();
                }
              }}
            >
              <IconControl as="span" size="s" color="currentColor">
                {option.icon}
              </IconControl>

              <Span size="body">{option.title}</Span>
            </Dropdown.Option>
          )}
        >
          <IsolationFrame ref={frameRef} resize="y" style={{ width: 160 }}>
            <Input
              type="text"
              label="Block type"
              hiddenLabel
              size="s"
              style={{ padding: 2 }}
              placeholder="Block type"
              disabled={disabled}
              readOnly={readOnly}
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
      </Dropdown.Navigator>
    </div>
  );
}
