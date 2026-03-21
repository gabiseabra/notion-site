import { MaybeReadonly } from "@notion-site/common/types/readonly.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import {
  FaBold,
  FaCode,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
} from "react-icons/fa";
import { ToolbarButton } from "../ToolbarButton.js";

const Annotations = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "code",
] as const;
type Annotations = (typeof Annotations)[number];

export function AnnotationControl({
  enabledAnnotations = Annotations,
  value,
  onChange,
  disabled,
  readOnly,
}: {
  enabledAnnotations?: MaybeReadonly<Annotations[]>;
  value?: Partial<Notion.RTF.Annotations>;
  onChange?: (annotations: Partial<Notion.RTF.Annotations>) => void;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <>
      {enabledAnnotations.map((key) => (
        <ToolbarButton
          key={key}
          disabled={disabled}
          readOnly={readOnly}
          active={value?.[key] === true}
          onClick={() => onChange?.({ [key]: true })}
        >
          {
            {
              bold: <FaBold />,
              italic: <FaItalic />,
              underline: <FaUnderline />,
              strikethrough: <FaStrikethrough />,
              code: <FaCode />,
            }[key]
          }
        </ToolbarButton>
      ))}
    </>
  );
}
