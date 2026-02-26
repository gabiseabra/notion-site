import { ComponentType, ReactNode } from "react";

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
