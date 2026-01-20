/**
 * Did the event originate inside an element matching selector that is within the element handling the event?
 */
export function isEventFromMatchingDescendant(
  { target, currentTarget }: Pick<Event, "target" | "currentTarget">,
  selector: string,
) {
  return (
    currentTarget instanceof Element &&
    target instanceof Element &&
    currentTarget.contains(target.closest(selector))
  );
}

/**
 * Did the event originate inside the given element?
 */
export function isEventFromElement(
  { target }: Pick<Event, "target">,
  element: Element,
) {
  return target instanceof Element && element.contains(target);
}
