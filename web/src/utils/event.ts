export const Event = {
  /**
   * Did the event originate inside an element matching selector that is within the element handling the event?
   */
  isFromMatchingDescendant(
    { target, currentTarget }: Pick<Event, "target" | "currentTarget">,
    selector: string,
  ) {
    return (
      currentTarget instanceof Element &&
      target instanceof Element &&
      currentTarget.contains(target.closest(selector))
    );
  },

  /**
   * Did the event originate inside the given element?
   */
  isFromElement({ target }: Pick<Event, "target">, element: Element) {
    return target instanceof Element && element.contains(target);
  },
};
