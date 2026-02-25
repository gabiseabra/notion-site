import { ComponentType, ReactNode, useState } from "react";

export type OverlayProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};
export type Overlay = ComponentType<OverlayProps>;

export type AnchoredOverlayProps = {
  content: ReactNode;
} & OverlayProps;
export type AnchoredOverlay = ComponentType<AnchoredOverlayProps>;

export function ControlledOverlay<Props extends object>({
  as: Overlay,
  disabled,
  children,
  ...props
}: {
  as: ComponentType<Props & OverlayProps>;
  disabled?: boolean;
  children: (overlay: { isOpen: boolean; open: () => void }) => ReactNode;
} & Props) {
  const [isOpen, setIsOpen] = useState(false);

  const overlayProps = {
    ...props,
    open: isOpen,
    onClose: () => setIsOpen(false),
    children: children({ isOpen, open: () => setIsOpen(!disabled && true) }),
  } as Props & OverlayProps;

  return <Overlay {...overlayProps} />;
}
