import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { ReactNode, useRef } from "react";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { LanguageOptions, showLanguage } from "../../utils/code";
import { IconControl } from "../display/Icon";
import { Dropdown, useDropdown } from "../inputs/Dropdown";
import { Input } from "../inputs/Input";
import { Row } from "../layout/FlexBox";
import { IsolationFrame } from "../overlays/IsolationFrame";

export function LanguageDropdown({
  value,
  onChange,
  disabled,
  readOnly,
}: {
  value: zNotion.blocks.language;
  onChange: (language: zNotion.blocks.language) => void;
  disabled?: boolean;
  readOnly?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const frameRef = useRef<IsolationFrame>(null);
  const selectedOption = LanguageOptions.find((option) => option.id === value);
  const dropdown = useDropdown({
    options: LanguageOptions,
    disabled: disabled || readOnly,
    initialFocusedId: selectedOption?.id,
    filter: (option, value) =>
      !value || new RegExp(value, "i").test(option.title),
  });

  return (
    <Dropdown.Navigator
      dropdown={dropdown}
      onFocusChange={(language) => {
        document.getElementById(`language--${language}`)?.scrollIntoView();
        document.getElementById(`language--${language}`)?.focus();
      }}
    >
      <Dropdown
        open={dropdown.open}
        onClose={() => dropdown.reset()}
        options={dropdown.visibleOptions}
        contentProps={{
          style: {
            maxHeight: 105,
            overflowY: "auto",
          },
        }}
        renderOption={(option) => (
          <Dropdown.Option
            id={`language--${option.id}`}
            active={option.id === value}
            focused={dropdown.focusedId === option.id}
            py={0.15}
            style={{ fontSize: "1em" }}
            onClick={() => onChange(option.id)}
            onFocus={() => dropdown.setFocusedId(option.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Space") {
                onChange(option.id);
                e.preventDefault();
              }
            }}
          >
            {showLanguage(option.id)}
          </Dropdown.Option>
        )}
      >
        <IsolationFrame ref={frameRef} resize="y" style={{ width: 100 }}>
          <Row p={0.5}>
            <Input
              type="text"
              label="Block type"
              hiddenLabel
              size="s"
              elevation={0}
              variant="transparent"
              style={{ fontSize: `0.75em` }}
              placeholder="Block type"
              disabled={disabled}
              readOnly={readOnly}
              value={dropdown.value ?? selectedOption?.title ?? ""}
              onChange={dropdown.setValue}
              onFocus={() => Dropdown.toggle(dropdown)}
              right={
                <IconControl as="span" size="s" color="currentColor">
                  {dropdown.open ? <RxCaretDown /> : <RxCaretUp />}
                </IconControl>
              }
            />
          </Row>
        </IsolationFrame>
      </Dropdown>
    </Dropdown.Navigator>
  );
}
