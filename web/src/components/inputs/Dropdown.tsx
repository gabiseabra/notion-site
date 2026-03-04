import { MaybeReadonly } from "@notion-site/common/types/readonly.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { Fragment, Key, ReactNode, useEffect, useRef, useState } from "react";
import { useResizeObserver } from "../../hooks/use-resize-observer.js";
import { Col, Row } from "../layout/FlexBox.js";
import { Popover, PopoverProps } from "../overlays/Popover.js";
import styles from "./Dropdown.module.scss";

type DropdownOption = {
  id: Key;
  title?: string;
};

export type DropdownProps<Option extends DropdownOption> = {
  offset?: PopoverProps["offset"];
  variant?: PopoverProps["variant"];
  elevation?: PopoverProps["elevation"];
  placements?: PopoverProps["placements"];

  children?:
    | ReactNode
    | ((dropdown: {
        value?: string;
        onChange: (value: string | undefined) => void;
        open: boolean;
        onClick: () => void;
      }) => ReactNode);

  initialValue?: string;
  disabled?: boolean;
  options: MaybeReadonly<Option[]>;
  renderOption: (option: Option) => ReactNode;
  filterOption?: (value: string | undefined) => (option: Option) => boolean;
};

export function Dropdown<Option extends DropdownOption>({
  offset = 0.5,
  variant = "menu",
  elevation = 1,
  placements = ["bottom"],

  children,

  initialValue,
  disabled,
  options,
  renderOption,
  filterOption = (value) => (option) =>
    !value || new RegExp(`${value}`, "i").test(option.title ?? ""),
}: DropdownProps<Option>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>();
  const [width, setWidth] = useState(0);

  const updateWidth = () => {
    setWidth(wrapperRef.current?.clientWidth ?? 0);
  };

  useResizeObserver(wrapperRef, updateWidth);

  useEffect(() => {
    setValue(undefined);
  }, [initialValue]);

  const onClick = () => {
    if (!disabled) setOpen((open) => !open);
  };

  return (
    <Popover
      open={open && !disabled}
      onClose={() => setOpen(false)}
      offset={offset}
      variant={variant}
      elevation={elevation}
      placements={placements}
      content={
        <Col gap={0} style={{ width }}>
          {options.filter(filterOption(value)).map((option) => (
            <Fragment key={option.id}>{renderOption(option)}</Fragment>
          ))}
        </Col>
      }
    >
      <Row ref={wrapperRef} onClick={onClick}>
        {children instanceof Function
          ? children({ value, onChange: setValue, open, onClick })
          : children}
      </Row>
    </Popover>
  );
}

export type DropdownOptionProps = {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function DropdownOption({
  active,
  disabled,
  onClick,
  children,
}: DropdownOptionProps) {
  return (
    <Row
      tabIndex={1}
      p={1}
      alignY="center"
      className={[
        styles["dropdown-item"],
        active && styles["active"],
        disabled && styles["disabled"],
      ]
        .filter(isTruthy)
        .join(" ")}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Row>
  );
}
