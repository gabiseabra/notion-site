import { FaGithub } from "react-icons/fa";
import styles from "./GithubRibbon.module.scss";

export function GithubRibbon() {
  return (
    <div className={styles["github-ribbon"]}>
      <a
        target="_blank"
        href="https://github.com/gabiseabra/notion-site"
        title="See the source code on Github"
      >
        <FaGithub />
      </a>
    </div>
  );
}
