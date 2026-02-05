import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoIosClose } from "react-icons/io";
import { IconControl } from "../display/Icon.js";
import styles from "./Modal.module.scss";

export type ModalProps = {
  title: ReactNode;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, children, title, footer }: ModalProps) {
  const modalPortal = document.querySelector("#modal-portal");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
  }, [open]);

  if (!open) return null;

  if (!modalPortal) {
    throw new Error("#modal-portal not found!");
  }

  return createPortal(
    <div className={styles["modal-wrapper"]}>
      <section className={styles.modal}>
        <header>
          <h1 className={styles.title}>{title}</h1>

          <IconControl
            as="button"
            color="default"
            size="m"
            p={2}
            title="Close"
            onClick={onClose}
          >
            <IoIosClose />
          </IconControl>
        </header>

        <div className={styles.body}>{children}</div>

        {footer && <footer>{footer}</footer>}
      </section>

      <div className={styles.shadow} onClick={onClose} />
    </div>,
    modalPortal,
  );
}
