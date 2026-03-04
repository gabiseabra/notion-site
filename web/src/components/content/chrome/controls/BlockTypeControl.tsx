import { Notion } from "@notion-site/common/utils/notion/index.js";
import { FaHeading, FaParagraph } from "react-icons/fa";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { IconControl } from "../../../display/Icon.js";
import { Span } from "../../../display/Text.js";
import { Dropdown, DropdownOption } from "../../../inputs/Dropdown.js";
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

  return (
    <Dropdown
      disabled={disabled === true || disabled === "action"}
      initialValue={selectedOption?.title}
      options={options}
      renderOption={(option) => (
        <DropdownOption
          active={option.id === value}
          onClick={() => onChange(option.id)}
        >
          <IconControl as="span" size="s" color="currentColor">
            {option.icon}
          </IconControl>

          <Span size="body">{option.title}</Span>
        </DropdownOption>
      )}
    >
      {(dropdown) => (
        <div style={{ margin: -2 }}>
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
              onChange={dropdown.onChange}
              onClick={dropdown.onClick}
              onFocus={dropdown.onClick}
              onBlur={() => dropdown.onChange(undefined)}
              right={
                <IconControl as="span" size="m" color="currentColor">
                  {dropdown.open ? <RxCaretDown /> : <RxCaretUp />}
                </IconControl>
              }
            />
          </IsolationFrame>
        </div>
      )}
    </Dropdown>
  );
}
