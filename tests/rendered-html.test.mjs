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
  assert.equal(response.headers.get("cache-control"), "public, max-age=0, must-revalidate");

  const html = await response.text();
  assert.match(html, /<title>get help \/ sg — Find mental health support<\/title>/i);
  assert.match(html, /How are things feeling today\?/i);
  assert.match(html, /Singapore mental-health wayfinding/);
  assert.match(html, /Urgent help/);
  assert.match(html, /Answers stay on this page/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("contains the guided flow, safety controls, clinic tools and no starter-only dependencies", async () => {
  const [page, revisedHome, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/revised-home.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /use client/);
  assert.match(revisedHome, /selectedChallenges/);
  assert.match(revisedHome, /What would feel most helpful right now\?/);
  assert.match(revisedHome, /What kind of access works for you\?/);
  assert.match(revisedHome, /aria-modal="true"/);
  assert.match(revisedHome, /This website is not monitored/);
  assert.match(revisedHome, /shortlistedIds/);
  assert.match(revisedHome, /Verification date not recorded/);
  assert.match(revisedHome, /Browse phone, text and social support/);
  assert.doesNotMatch(revisedHome, /national mindline can help you navigate/);
  assert.match(page, /Samaritans of Singapore/);
  assert.match(page, /national mindline/);
  assert.doesNotMatch(page, /practice: "Intellect Company Pte Ltd"/);
  assert.match(page, /Blk 654, Yishun Avenue 4, #01-437, Singapore 760654/);
  assert.match(page, /3151 Commonwealth Avenue West, #04-01 Grantral Mall, Singapore 129581/);
  assert.doesNotMatch(page, /address: "Frontier (?:Medical Associates, Yishun|Family Medicine Clinic, Clementi)"/);
  assert.match(page, /\["central", "Central Singapore", "Orchard · Bukit Timah · Novena · City"\]/);
  assert.match(page, /return "Bukit Timah"/);
  assert.match(page, /Currently no clinics available/);
  assert.doesNotMatch(page, /region: "west",[\s\S]{0,240}address: "[^"]*(?:Bukit Timah|Fifth Avenue|Lorong Kilat|Cluny Court)/i);
  assert.match(page, /tel:995/);
  assert.match(page, /tel:999/);
  assert.match(layout, /get help \/ sg — Find mental health support/);
  assert.match(css, /\.conversation-panel/);
  assert.match(css, /prefers-reduced-motion|@media/);
  assert.doesNotMatch(page + revisedHome, /6389 2222|1800 221 444|6336 3434/);
  assert.doesNotMatch(page + revisedHome + layout + packageJson, /SkeletonPreview|react-loading-skeleton|codex-preview/);
});

test("starter preview files have been removed", async () => {
  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
