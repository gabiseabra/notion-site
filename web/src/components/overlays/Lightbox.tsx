import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoIosClose } from "react-icons/io";
import { IconControl } from "../display/Icon.js";
import styles from "./Lightbox.module.scss";

export type LightboxProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Lightbox({ open, onClose, children, footer }: LightboxProps) {
  const modalPortal = document.querySelector("#modal-portal");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
  }, [open]);

  if (!open) return null;

  if (!modalPortal) {
    throw new Error("#modal-portal not found!");
  }

  return createPortal(
    <div className={styles["lightbox-wrapper"]}>
      <section className={styles.lightbox}>
        <IconControl
          className={styles.close}
          as="button"
          color="default"
          size="l"
          m={2}
          title="Close"
          onClick={onClose}
        >
          <IoIosClose />
        </IconControl>

        <div className={styles.body}>{children}</div>

        {footer && <footer>{footer}</footer>}
      </section>

      <div className={styles.shadow} onClick={onClose} />
    </div>,
    modalPortal,
  );
}
