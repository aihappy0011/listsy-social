// Run: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { nextDue, problems } from "./post.mjs";

const now = Date.parse("2026-11-24T12:00:00+05:30");
const q = [
  { id: "a", at: "2026-11-24T10:00:00+05:30", status: "posted" },
  { id: "b", at: "2026-11-24T11:00:00+05:30", status: "pending" },
  { id: "c", at: "2026-11-24T11:30:00+05:30", status: "approved" },
  { id: "d", at: "2026-11-24T09:00:00+05:30", status: "approved" },
  { id: "e", at: "2026-11-24T14:00:00+05:30", status: "approved" },
];

test("picks oldest due approved item, skips pending/posted/future", () => {
  assert.equal(nextDue(q, now).id, "d");
  assert.equal(nextDue(q.filter((p) => p.id !== "d"), now).id, "c");
  assert.equal(nextDue([q[4]], now), undefined);
});

test("validates Instagram rules", () => {
  const yes = () => true;
  assert.deepEqual(problems({ type: "carousel", files: ["1.jpg", "2.jpg"] }, "hi", yes), []);
  assert.ok(problems({ type: "carousel", files: ["1.png", "2.jpg"] }, "hi", yes).includes("images must be .jpg"));
  assert.ok(problems({ type: "carousel", files: ["1.jpg"] }, "hi", yes).length);
  assert.deepEqual(problems({ type: "reel", files: ["r.mp4"] }, "hi", yes), []);
  assert.ok(problems({ type: "image", files: ["x.jpg"] }, "#a ".repeat(31), yes).includes("more than 30 hashtags"));
  assert.ok(problems({ type: "image", files: ["x.jpg"] }, "hi", () => false)[0].startsWith("missing"));
});

import { applyReply } from "./gh.mjs";
test("owner replies on the approval issue", () => {
  const q = () => [
    { id: "x", at: "2026-11-25T10:00:00+05:30", status: "pending", issue: 7 },
    { id: "y", at: "2026-11-24T10:00:00+05:30", status: "pending", issue: 7 },
    { id: "w", at: "2026-11-24T09:00:00+05:30", status: "pending", issue: 8 },
    { id: "z", at: "2026-11-23T10:00:00+05:30", status: "posted" },
  ];
  const a = q();
  applyReply(a, "nahi 1", 7); assert.equal(a[1].status, "rejected"); // #1 = earliest post in issue 7
  assert.match(applyReply(a, "nahi 1", 7), /koi pending/); // already rejected
  applyReply(a, "Haan bhai", 7); assert.equal(a[0].status, "approved"); assert.equal(a[2].status, "pending"); // issue 8 untouched
  applyReply(a, "stop", 7); assert.equal(a[0].status, "pending"); assert.equal(a[0].issue, undefined);
  assert.match(applyReply(q(), "kya hai", 7), /Samjha nahi/);
});
