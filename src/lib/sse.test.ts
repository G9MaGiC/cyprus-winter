import { describe, it, expect } from "vitest";
import { iterateSseData } from "./sse";

function makeReader(chunks: string[]): ReadableStreamDefaultReader<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return {
    read: async () => {
      if (index >= chunks.length) return { done: true, value: undefined } as ReadableStreamReadResult<Uint8Array>;
      return { done: false, value: encoder.encode(chunks[index++]) } as ReadableStreamReadResult<Uint8Array>;
    },
    releaseLock: () => {},
    cancel: async () => {},
    closed: Promise.resolve(undefined),
  } as unknown as ReadableStreamDefaultReader<Uint8Array>;
}

async function collect(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string[]> {
  const results: string[] = [];
  for await (const data of iterateSseData(reader)) {
    results.push(data);
  }
  return results;
}

describe("iterateSseData", () => {
  it("parses a complete SSE message", async () => {
    const reader = makeReader(["data: hello\n\n"]);
    const results = await collect(reader);
    expect(results).toEqual(["hello"]);
  });

  it("parses multiple SSE messages in one chunk", async () => {
    const reader = makeReader(["data: first\n\ndata: second\n\n"]);
    const results = await collect(reader);
    expect(results).toEqual(["first", "second"]);
  });

  it("handles multi-line data fields", async () => {
    const reader = makeReader(["data: line1\ndata: line2\n\n"]);
    const results = await collect(reader);
    expect(results).toEqual(["line1", "line2"]);
  });

  it("handles incomplete/buffered messages across chunks", async () => {
    const reader = makeReader(["data: hel", "lo\n\n"]);
    const results = await collect(reader);
    expect(results).toEqual(["hello"]);
  });

  it("handles split across multiple chunks with buffering", async () => {
    const reader = makeReader(["data: a\n", "\ndata: b\n\n"]);
    const results = await collect(reader);
    expect(results).toEqual(["a", "b"]);
  });

  it("ignores lines that do not start with 'data: '", async () => {
    const reader = makeReader(["event: message\ndata: payload\n\n"]);
    const results = await collect(reader);
    expect(results).toEqual(["payload"]);
  });

  it("skips empty data values", async () => {
    const reader = makeReader(["data: \n\n"]);
    const results = await collect(reader);
    expect(results).toEqual([]);
  });

  it("returns nothing for empty stream", async () => {
    const reader = makeReader([]);
    const results = await collect(reader);
    expect(results).toEqual([]);
  });

  it("ignores events with no data lines", async () => {
    const reader = makeReader(["event: ping\nid: 1\n\n"]);
    const results = await collect(reader);
    expect(results).toEqual([]);
  });

  it("handles trailing incomplete event (no final double newline)", async () => {
    // Data that never gets a final \n\n should not be yielded
    const reader = makeReader(["data: complete\n\ndata: incomplete"]);
    const results = await collect(reader);
    expect(results).toEqual(["complete"]);
  });

  it("trims whitespace from data values", async () => {
    const reader = makeReader(["data:  spaced  \n\n"]);
    const results = await collect(reader);
    expect(results).toEqual(["spaced"]);
  });
});
