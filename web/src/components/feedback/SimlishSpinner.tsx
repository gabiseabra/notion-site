import { shuffle } from "@notion-site/common/utils/array.js";
import { useEffect, useMemo, useState } from "react";
import { Col } from "../layout/FlexBox.js";
import { Span } from "../typography/Text.js";
import { Spinner } from "./Spinner.js";

const TICK_INTERNAL = 3_000;

/**
 * Sims-3-type spinner.
 * @direction block
 */
export function SimlishSpinner({ resourceName }: { resourceName: string }) {
  const [tick, setTick] = useState(0);

  const actions = useMemo(
    () =>
      shuffle([
        `Loading ${resourceName}`,
        `Squeezing ${resourceName} through a tiny pipe`,
        `Consulting the ${possessive(resourceName)} oracle`,
        `Herding ${resourceName} into a line`,
        `Shuffling ${resourceName} into place`,
        `Staring intensely at ${resourceName} until they load`,
        `Harvesting ${resourceName} from the void`,
        `Rolling ${resourceName} down a hill for momentum`,
        `Letting ${resourceName} finish their little conversation`,
        `Luring ${resourceName} out with shiny pixels`,
        `Dusting glitter off ${resourceName}`,
        `Waiting for ${resourceName} to find their socks`,
        `Tapping ${resourceName} twice for luck`,
        `Whispering motivational quotes into ${possessive(resourceName)} ear`,
        `Letting ${resourceName} cool down before serving`,
        `Rehearsing ${possessive(resourceName)} entrance speech`,
        `Running ${resourceName} through a ceremonial fog`,
        `Negotiating with ${possessive(resourceName)} inner committee`,
        `Holding the door while ${resourceName} decide whether now feels right`,
        `Granting ${resourceName} a ceremonial pause, as tradition demands`,
        `Carefully escorting ${resourceName} through several unnecessary checkpoints`,
        `Waiting for ${resourceName} to catch their breath before carrying on their way here`,
      ]),
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), TICK_INTERNAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <Col gap={4} alignX="center">
      <Spinner size="l" />

      <Span color="muted" size="caption" style={{ textAlign: "center" }}>
        {`${actions[tick % actions.length]}…`}
      </Span>
    </Col>
  );
}

function possessive(text: string) {
  return `${text}’${text.endsWith("s") ? "" : "s"}`;
}
