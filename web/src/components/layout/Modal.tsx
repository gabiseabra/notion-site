import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { IoIosClose } from "react-icons/io";
import { IconButton } from "../typography/IconButton.js";
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

  if (!open) return null;

  if (!modalPortal) {
    throw new Error("#modal-portal not found!");
  }

  return createPortal(
    <div className={styles["modal-wrapper"]}>
      <section className={styles.modal}>
        <header>
          <h1 className={styles.title}>{title}</h1>

          <IconButton
            as="button"
            color="default"
            size="m"
            p={2}
            title="Close"
            onClick={onClose}
          >
            <IoIosClose />
          </IconButton>
        </header>

        <div className={styles.body}>{children}</div>

        {footer && <footer>{footer}</footer>}
      </section>

      <div className={styles.shadow} onClick={onClose} />
    </div>,
    modalPortal,
  );
}
