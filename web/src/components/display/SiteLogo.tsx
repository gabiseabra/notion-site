import styles from "./SiteLogo.module.scss";

export function SiteLogo() {
  return (
    <div className={styles["site-logo"]}>
      <span className={styles["subdomain"]}>blog</span>
      <span className={styles["dot"]}>.</span>
      <span className={styles["domain"]}>gabiseabra</span>
      <span className={styles["dot"]}>.</span>
      <span className={styles["domain"]}>dev</span>
    </div>
  );
}
