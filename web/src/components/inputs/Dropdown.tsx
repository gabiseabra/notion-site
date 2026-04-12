import { MaybeReadonly } from "@notion-site/common/types/readonly.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import {
  CSSProperties,
  Fragment,
  Key,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDocumentEventListener } from "../../hooks/use-document-event-listener";
import { useResizeObserver } from "../../hooks/use-resize-observer.js";
import { EmptyState } from "../feedback/EmptyState";
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
  emptyState?: ReactNode;

  options: MaybeReadonly<Option[]>;
  renderOption: (option: Option) => ReactNode;

  contentProps?: {
    style?: CSSProperties;
  };
};

export function Dropdown<Option extends DropdownOption>({
  open,
  onClose,

  offset = 0.5,
  variant = "menu",
  elevation = 1,
  placements = ["bottom"],

  children,
  emptyState = <EmptyState size="s" title="No results" />,

  options,
  renderOption,

  contentProps,
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
        <Col
          gap={0}
          style={{
            width,
            borderRadius: `var(--popover-radius)`,
            ...contentProps?.style,
          }}
        >
          {options.length === 0
            ? emptyState
            : options.map((option) => (
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

Dropdown.Option = function DropdownOption({
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
};

type DropdownNavigatorProps<TOption extends DropdownOption> = {
  dropdown: Dropdown<TOption>;
  disabled?: boolean;
  onBlur?: () => void;
  onFocusChange?: (id: TOption["id"]) => void;
  contains?: (element: Element) => boolean;
  children: ReactNode;
};

Dropdown.Navigator = function DropdownNavigator<
  TOption extends DropdownOption,
>({
  dropdown,
  disabled,
  onBlur,
  onFocusChange,
  contains,
  children,
}: DropdownNavigatorProps<TOption>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // reset on focus out
  useDocumentEventListener("focusin", () => {
    if (disabled) return;

    const wrapper = wrapperRef.current;
    const target = document.activeElement;
    if (
      wrapper &&
      target &&
      !(wrapper.contains(target) || !contains || contains(target))
    ) {
      dropdown.reset();
      onBlur?.();
    }
  });

  return (
    <Row
      ref={wrapperRef}
      onKeyDown={(e) => {
        if (disabled) return;

        const direction = (() => {
          if (e.key === "ArrowDown") return 1;
          if (e.key === "ArrowUp") return -1;
        })();
        const option = direction && Dropdown.rotate(dropdown, direction);

        if (option) {
          dropdown.setFocusedId(option.id);
          onFocusChange?.(option.id);
          e.preventDefault();
        }
      }}
    >
      {children}
    </Row>
  );
};

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
    open = !dropdown.open,
  ) {
    dropdown.setOpen(open);
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
