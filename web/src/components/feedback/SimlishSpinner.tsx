import React, { useEffect, useMemo, useState } from "react";
import { Col } from "../layout/FlexBox.js";
import { Spinner } from "./Spinner.js";
import { Span } from "../typography/Text.js";
import { shuffle } from "@notion-site/common/utils/array.js";

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
        `Polishing ${resourceName}`,
        `Squeezing ${resourceName} through a tiny pipe`,
        `Reassembling ${resourceName} from blocks`,
        `Consulting the ${resourceName} oracle`,
        `Herding ${resourceName} into a line`,
        `Shuffling ${resourceName} into place`,
        `Staring intensely at ${resourceName} until they load`,
        `Harvesting ${resourceName} from the void`,
        `Rolling ${resourceName} down a hill for momentum,`,
        `Letting ${resourceName} finish their little conversation`,
        `Luring ${resourceName} out with shiny pixels`,
        `Dusting glitter off ${resourceName}`,
        `Waiting for ${resourceName} to find their socks`,
        `Rehearsing ${resourceName}’${resourceName.endsWith("s") ? "" : "s"} entrance speech`,
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

      <Span color="muted" size="caption">
        {`${actions[tick % actions.length]}…`}
      </Span>
    </Col>
  );
}
