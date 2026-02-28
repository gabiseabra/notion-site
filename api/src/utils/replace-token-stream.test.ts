import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import {
  replaceTokenWithStream,
  type CreateReplacement,
} from "./replace-token-stream.js";

async function collect(stream: NodeJS.ReadableStream) {
  let out = "";
  for await (const chunk of stream) {
    out += chunk.toString();
  }
  return out;
}

describe("replaceTokenWithStream", () => {
  it("replaces the first token with the replacement stream", async () => {
    const input = Readable.from(["Hello {{TOKEN}}!"]);
    const transform = replaceTokenWithStream("{{TOKEN}}", async () =>
      Readable.from(["world"]),
    );

    const output = await collect(input.pipe(transform));
    expect(output).toBe("Hello world!");
  });

  it("handles tokens split across chunks", async () => {
    const input = Readable.from(["Hello {{TO", "KEN}}!"]);
    const transform = replaceTokenWithStream("{{TOKEN}}", async () =>
      Readable.from(["world"]),
    );

    const output = await collect(input.pipe(transform));
    expect(output).toBe("Hello world!");
  });

  it("passes through content when token is absent", async () => {
    const input = Readable.from(["Hello there."]);
    const transform = replaceTokenWithStream("{{TOKEN}}", async () =>
      Readable.from(["world"]),
    );

    const output = await collect(input.pipe(transform));
    expect(output).toBe("Hello there.");
  });

  it("preserves data after the token", async () => {
    const input = Readable.from(["A {{TOKEN}} B"]);
    const transform = replaceTokenWithStream("{{TOKEN}}", async () =>
      Readable.from(["X"]),
    );

    const output = await collect(input.pipe(transform));
    expect(output).toBe("A X B");
  });

  it("propagates replacement errors", async () => {
    const input = Readable.from(["Hello {{TOKEN}}!"]);
    const transform = replaceTokenWithStream("{{TOKEN}}", async () => {
      throw new Error("boom");
    });

    await expect(pipeline(input, transform)).rejects.toThrow("boom");
  });

  it("propagates errors from the replacement stream", async () => {
    const input = Readable.from(["Hello {{TOKEN}}!"]);
    const createReplacement: CreateReplacement = async () => {
      const stream = new Readable({
        read() {
          this.destroy(new Error("stream-fail"));
        },
      });
      return stream;
    };

    const transform = replaceTokenWithStream("{{TOKEN}}", createReplacement);
    await expect(pipeline(input, transform)).rejects.toThrow("stream-fail");
  });
});
