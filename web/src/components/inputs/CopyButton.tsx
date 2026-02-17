import { ReactNode, useState } from "react";
import styles from "./CopyButton.module.scss";

type CopyButtonProps = {
  as: "span" | "button";
  copyText: string;
  children: ReactNode;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({
  as: Component,
  copyText,
  children,
  copiedLabel = "Copied",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(false);
      requestAnimationFrame(() => setCopied(true));
    } catch {
      setCopied(false);
    }
  };

  return (
    <Component className={[styles.wrap, className].join(" ")} onClick={onClick}>
      {children}
      {copied ? (
        <span
          role="status"
          aria-live="polite"
          className={styles.tooltip}
          onAnimationEnd={() => setCopied(false)}
        >
          {copiedLabel}
        </span>
      ) : null}
    </Component>
  );
}
