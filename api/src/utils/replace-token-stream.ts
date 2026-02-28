import { Readable, Transform } from "node:stream";

export type CreateReplacement = () => Promise<Readable>;

/**
 * Replace the first occurrence of `token` in a stream with a replacement stream.
 */
export function replaceTokenWithStream(
  token: string,
  createReplacement: CreateReplacement,
) {
  if (!token) {
    throw new Error("Token must be a non-empty string.");
  }

  let carry = "";
  let replaced = false;

  return new Transform({
    transform(chunk, _encoding, callback) {
      if (replaced) {
        this.push(chunk);
        callback();
        return;
      }

      carry += chunk.toString("utf8");

      const idx = carry.indexOf(token);
      if (idx === -1) {
        const keep = Math.max(0, token.length - 1);
        if (carry.length > keep) {
          this.push(carry.slice(0, -keep));
          carry = carry.slice(-keep);
        }
        callback();
        return;
      }

      this.push(carry.slice(0, idx));
      carry = carry.slice(idx + token.length);
      replaced = true;

      createReplacement()
        .then((replacement) => {
          replacement.on("data", (buf) => {
            if (!this.push(buf)) {
              replacement.pause();
            }
          });

          this.on("drain", () => replacement.resume());

          replacement.on("end", () => {
            if (carry.length) {
              this.push(carry);
              carry = "";
            }
            callback();
          });

          replacement.on("error", callback);
        })
        .catch(callback);
    },
    flush(callback) {
      if (carry.length) {
        this.push(carry);
      }
      callback();
    },
  });
}
