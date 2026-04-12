import { pipe } from "ts-functional-pipe";
import { Theme } from "./theme";

export namespace ANSI {
  export function rgb(hex: string): [number, number, number] {
    const h = hex.replace(/^#/, "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }

  export function hex(hex: string) {
    const [r, g, b] = rgb(hex);
    return (text: string) => `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
  }

  export function bgHex(hex: string) {
    const [r, g, b] = rgb(hex);
    return (text: string) => `\x1b[48;2;${r};${g};${b}m${text}\x1b[49m`;
  }

  export function bold(text: string) {
    return `\x1b[1m${text}\x1b[22m`;
  }

  export function italic(text: string) {
    return `\x1b[3m${text}\x1b[23m`;
  }

  export const gray = pipe(hex(Theme.gray), italic);
  export const secondary = pipe(hex(Theme.pink), bgHex(Theme.bgPink), bold);
  export const primary = pipe(hex(Theme.purple), bgHex(Theme.bgPurple), bold);
  export const warning = pipe(hex(Theme.orange), bgHex(Theme.bgOrange), bold);
}
