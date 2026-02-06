import { jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "node:util";
import { TransformStream } from "web-streams-polyfill";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

global.TransformStream = TransformStream;

global.fetch = () => {
  throw new Error("fetch not implemented");
};

global.jest = jest;
