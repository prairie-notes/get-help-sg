import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Get Help SG landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>get help \/ sg — Find mental health support<\/title>/i);
  assert.match(html, /how are you feeling today\?/i);
  assert.match(html, /Singapore resource guide/);
  assert.match(html, /Need urgent help\?/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("contains the real product flow and no starter-only dependencies", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /use client/);
  assert.match(page, /selectedChallenges/);
  assert.match(page, /Samaritans of Singapore/);
  assert.match(page, /national mindline/);
  assert.match(page, /tel:995/);
  assert.match(page, /tel:999/);
  assert.match(layout, /get help \/ sg — Find mental health support/);
  assert.match(css, /\.conversation-panel/);
  assert.match(css, /prefers-reduced-motion|@media/);
  assert.doesNotMatch(page + layout + packageJson, /SkeletonPreview|react-loading-skeleton|codex-preview/);
});

test("starter preview files have been removed", async () => {
  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
