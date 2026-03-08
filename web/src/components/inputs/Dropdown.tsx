import { MaybeReadonly } from "@notion-site/common/types/readonly.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { Fragment, Key, ReactNode, useMemo, useRef, useState } from "react";
import { useResizeObserver } from "../../hooks/use-resize-observer.js";
import { Col, Row, RowProps } from "../layout/FlexBox.js";
import { Popover, PopoverProps } from "../overlays/Popover.js";
import styles from "./Dropdown.module.scss";

/// Dropdown component stuff

export type DropdownProps<Option extends DropdownOption> = {
  open: boolean;
  onClose: () => void;

  offset?: PopoverProps["offset"];
  variant?: PopoverProps["variant"];
  elevation?: PopoverProps["elevation"];
  placements?: PopoverProps["placements"];

  children?: ReactNode;

  options: MaybeReadonly<Option[]>;
  renderOption: (option: Option) => ReactNode;
};

export function Dropdown<Option extends DropdownOption>({
  open,
  onClose,

  offset = 0.5,
  variant = "menu",
  elevation = 1,
  placements = ["bottom"],

  children,

  options,
  renderOption,
}: DropdownProps<Option>) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);

  useResizeObserver(wrapperRef, () => {
    setWidth(wrapperRef.current?.clientWidth ?? 0);
  });

  return (
    <Popover
      open={open}
      onClose={onClose}
      offset={offset}
      variant={variant}
      elevation={elevation}
      placements={placements}
      content={
        <Col gap={0} style={{ width }}>
          {options.map((option) => (
            <Fragment key={option.id}>{renderOption(option)}</Fragment>
          ))}
        </Col>
      }
    >
      <Row ref={wrapperRef}>{children}</Row>
    </Popover>
  );
}

type DropdownOptionProps = {
  id?: string;
  active?: boolean;
  focused?: boolean;
  disabled?: boolean;
} & RowProps;

export function DropdownOption({
  id,
  active,
  focused,
  disabled,
  ...props
}: DropdownOptionProps) {
  return (
    <Row
      id={`${id}`}
      tabIndex={1}
      p={1}
      alignY="center"
      className={[
        styles["dropdown-item"],
        active && styles["active"],
        focused && styles["focused"],
        disabled && styles["disabled"],
      ]
        .filter(isTruthy)
        .join(" ")}
      {...props}
    />
  );
}

/// Dropdown controller stuff

type DropdownOption = {
  id: Key;
};

/** Dropdown controller */
export type Dropdown<Option extends DropdownOption> = {
  options: Option[];
  visibleOptions: Option[];

  value?: string;
  setValue: (value: string | undefined) => void;

  open: boolean;
  setOpen: (open: boolean) => void;

  focusedId?: Option["id"];
  setFocusedId: (id: Option["id"] | undefined) => void;

  reset: () => void;
};

/** Utility functions for updating the dropdown state */
export namespace Dropdown {
  export function rotate<Option extends DropdownOption>(
    dropdown: Dropdown<Option>,
    direction: 1 | -1,
  ) {
    const options = dropdown.visibleOptions;
    const currentIndex = dropdown.focusedId
      ? options.findIndex((o) => o.id === dropdown.focusedId)
      : { [1]: -1, [-1]: options.length }[direction];
    const nextIndex =
      (currentIndex + direction + options.length) % options.length;
    const nextOption = options[nextIndex];

    return nextOption;
  }

  export function toggle<Option extends DropdownOption>(
    dropdown: Dropdown<Option>,
  ) {
    dropdown.setOpen(!dropdown.open);
  }
}

/** Instantiates dropdown state */
export function useDropdown<Option extends DropdownOption>({
  options,
  filter = () => true,
  disabled,
  initialValue,
  initialOpen = false,
  initialFocusedId,
}: {
  options: MaybeReadonly<Option[]>;
  filter?: (option: Option, value: string | undefined) => boolean;
  disabled?: boolean;
  initialValue?: string;
  onChange?: (value?: string) => void;
  initialOpen?: boolean;
  initialFocusedId?: Option["id"];
}): Dropdown<Option> {
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(initialOpen);
  const [focusedId, setFocusedId] = useState(initialFocusedId);

  return useMemo(
    () => ({
      options: [...options],
      visibleOptions: [...options].filter((option) => filter(option, value)),

      value,
      setValue: disabled ? noop : setValue,

      open,
      setOpen: disabled ? noop : setOpen,

      focusedId: focusedId ?? undefined,
      setFocusedId: disabled ? noop : setFocusedId,

      reset() {
        setValue(initialValue);
        setOpen(initialOpen);
        setFocusedId(initialFocusedId);
      },
    }),
    [
      options,
      disabled,
      initialValue,
      value,
      setValue,
      initialOpen,
      open,
      setOpen,
      initialFocusedId,
      focusedId,
      setFocusedId,
    ],
  );
}

const noop = () => {};
