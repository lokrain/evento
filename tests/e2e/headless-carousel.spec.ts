import { expect, test } from "@playwright/test";

import {
  TEST_PATH,
  SLIDE_COUNT,
  getCenteredIndex,
  getDebugIndex,
  getLastAnnouncement,
  getOutsidePoint,
  getPinnedIndices,
  getViewportCenter,
  moveToIndex,
  pauseAutoplay,
  setVisibility,
  waitForReady,
} from "./headless-carousel.utils";

test.describe("headless carousel", () => {
  test("keyboard navigation advances the index", async ({ page }) => {
    await waitForReady(page);
    await pauseAutoplay(page);

    const start = await getCenteredIndex(page);

    await page.getByTestId("carousel-root").press("ArrowRight");

    await expect.poll(async () => getCenteredIndex(page)).not.toBe(start);
  });

  test("looping wraps from last to first", async ({ page }) => {
    await waitForReady(page);
    await pauseAutoplay(page);

    const indices: number[] = [await getCenteredIndex(page)];

    for (let i = 0; i < SLIDE_COUNT + 2; i += 1) {
      await page.getByTestId("next-btn").click();
      await page.waitForTimeout(80);
      indices.push(await getCenteredIndex(page));
    }

    const unique = new Set(indices);
    expect(unique.size).toBeGreaterThan(1);
    expect(indices.length).toBeGreaterThan(unique.size);
  });

  test("autoplay advances when enabled", async ({ page }) => {
    await waitForReady(page);

    const toggle = page.getByTestId("autoplay-toggle");
    await expect(toggle).toHaveAttribute("data-autoplay-state", "playing");

    const start = await getCenteredIndex(page);
    await expect.poll(async () => getCenteredIndex(page), { timeout: 2500 }).not.toBe(start);
  });

  test("announcer emits slide text after navigation settles", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?loop=0`);
    await pauseAutoplay(page);

    await moveToIndex(page, 1);
    await page.getByTestId("next-btn").click();
    await expect.poll(async () => getLastAnnouncement(page)).toMatch(/Slide \d+ of \d+/);
  });

  test("engine index updates and clamps in non-loop mode", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?loop=0`);
    await pauseAutoplay(page);

    await moveToIndex(page, 0);
    expect(await getDebugIndex(page)).toBe(0);

    await expect(page.getByTestId("prev-btn")).toBeDisabled();
    await expect.poll(async () => getDebugIndex(page)).toBe(0);

    await page.getByTestId("next-btn").click();
    await expect.poll(async () => getDebugIndex(page)).toBe(1);

    for (let i = 0; i < SLIDE_COUNT + 2; i += 1) {
      await page.getByTestId("next-btn").click();
    }

    const endIndex = await getDebugIndex(page);
    expect(endIndex).toBeGreaterThanOrEqual(1);
    expect(endIndex).toBeLessThanOrEqual(SLIDE_COUNT - 1);
  });

  test("live region toggles off during autoplay and polite when paused", async ({ page }) => {
    await waitForReady(page);

    const announcer = page.getByTestId("announcer");
    await expect(announcer).toHaveAttribute("aria-live", "off");

    const center = await getViewportCenter(page);
    await page.mouse.move(center.x, center.y);
    await expect(announcer).toHaveAttribute("aria-live", "polite");

    const outside = await getOutsidePoint(page);
    await page.mouse.move(outside.x, outside.y);
    await expect(announcer).toHaveAttribute("aria-live", "off");
  });

  test("reduced motion prevents autoplay from advancing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForReady(page);

    const toggle = page.getByTestId("autoplay-toggle");
    await expect(toggle).toHaveAttribute("data-autoplay-state", "playing");

    const start = await getCenteredIndex(page);
    await page.waitForTimeout(1800);
    await expect.poll(async () => getCenteredIndex(page)).toBe(start);
  });

  test("visibility gating pauses autoplay and resumes when visible", async ({ page }) => {
    await waitForReady(page);

    const toggle = page.getByTestId("autoplay-toggle");
    await expect(toggle).toHaveAttribute("data-autoplay-state", "playing");

    const start = await getCenteredIndex(page);
    await setVisibility(page, "hidden");
    await page.waitForTimeout(1800);
    await expect.poll(async () => getCenteredIndex(page)).toBe(start);

    await setVisibility(page, "visible");
    await expect.poll(async () => getCenteredIndex(page), { timeout: 2500 }).not.toBe(start);
  });

  test("hover gate pauses autoplay while hovering", async ({ page }) => {
    await waitForReady(page);

    const center = await getViewportCenter(page);
    const outside = await getOutsidePoint(page);

    await page.mouse.move(center.x, center.y);
    const start = await getCenteredIndex(page);
    await page.waitForTimeout(1200);
    await expect.poll(async () => getCenteredIndex(page)).toBe(start);

    await page.mouse.move(outside.x, outside.y);
    await expect.poll(async () => getCenteredIndex(page), { timeout: 2500 }).not.toBe(start);
  });

  test("focus-within stops autoplay until explicitly restarted", async ({ page }) => {
    await waitForReady(page);

    const toggle = page.getByTestId("autoplay-toggle");
    await expect(toggle).toHaveAttribute("data-autoplay-state", "playing");

    const focusTarget = page.getByTestId("slide-focus-0");
    await focusTarget.focus();

    const start = await getCenteredIndex(page);
    await page.waitForTimeout(1200);
    await expect.poll(async () => getCenteredIndex(page)).toBe(start);

    await page.getByTestId("outside-focus").click();
    await page.waitForTimeout(1300);
    await expect(toggle).toHaveAttribute("data-autoplay-state", "paused");
    await expect.poll(async () => getCenteredIndex(page)).toBe(start);
  });

  test("focus pin adds and removes pinned indices", async ({ page }) => {
    await waitForReady(page);

    await page.getByTestId("slide-focus-0").focus();
    await expect.poll(async () => getPinnedIndices(page)).not.toHaveLength(0);

    await page.getByTestId("outside-focus").focus();
    await expect.poll(async () => getPinnedIndices(page)).toHaveLength(0);
  });

  test("pointer drag gate pauses autoplay until release", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?resume=1`);

    const start = await getCenteredIndex(page);
    const root = page.getByTestId("carousel-root");

    await root.dispatchEvent("pointerdown", { clientX: 0, clientY: 0, pointerType: "mouse" });
    await page.waitForTimeout(1200);

    await expect.poll(async () => getCenteredIndex(page)).toBe(start);

    await root.dispatchEvent("pointerup", { clientX: 0, clientY: 0, pointerType: "mouse" });
    await expect.poll(async () => getCenteredIndex(page), { timeout: 2500 }).not.toBe(start);
  });

  test("pointer cancel clears drag gate and autoplay resumes", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?resume=1`);

    const start = await getCenteredIndex(page);
    const root = page.getByTestId("carousel-root");

    await root.dispatchEvent("pointerdown", { clientX: 0, clientY: 0, pointerType: "mouse" });
    await page.waitForTimeout(1200);
    await expect.poll(async () => getCenteredIndex(page)).toBe(start);

    await root.dispatchEvent("pointercancel", { clientX: 0, clientY: 0, pointerType: "mouse" });
    await expect.poll(async () => getCenteredIndex(page), { timeout: 2500 }).not.toBe(start);
  });

  test("pointer move maintains drag gate while moving", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?resume=1`);

    const start = await getCenteredIndex(page);
    const root = page.getByTestId("carousel-root");

    await root.dispatchEvent("pointerdown", { clientX: 0, clientY: 0, pointerType: "mouse" });
    await root.dispatchEvent("pointermove", { clientX: 160, clientY: 0, pointerType: "mouse" });
    await root.dispatchEvent("pointermove", { clientX: 320, clientY: 0, pointerType: "mouse" });

    await page.waitForTimeout(1200);
    await expect.poll(async () => getCenteredIndex(page)).toBe(start);

    await root.dispatchEvent("pointerup", { clientX: 320, clientY: 0, pointerType: "mouse" });
    await expect.poll(async () => getCenteredIndex(page), { timeout: 2500 }).not.toBe(start);
  });

  test("pointer drag scroll updates the centered index", async ({ page }) => {
    await waitForReady(page);
    await pauseAutoplay(page);

    const start = await getCenteredIndex(page);
    const center = await getViewportCenter(page);

    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x - 420, center.y, { steps: 10 });
    await page.mouse.up();

    await expect.poll(async () => getCenteredIndex(page)).not.toBe(start);
  });

  test("small drag snaps back to the start index", async ({ page }) => {
    await waitForReady(page);
    await pauseAutoplay(page);

    const start = await getCenteredIndex(page);
    const center = await getViewportCenter(page);

    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x - 20, center.y, { steps: 5 });
    await page.mouse.up();

    await expect.poll(async () => getCenteredIndex(page)).toBe(start);
    await expect.poll(async () => getDebugIndex(page)).toBe(start);
  });

  test("drag snap lands on the next slide index (non-loop)", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?loop=0`);
    await pauseAutoplay(page);

    await moveToIndex(page, 0);
    const start = await getCenteredIndex(page);
    const center = await getViewportCenter(page);

    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x - 380, center.y, { steps: 12 });
    await page.mouse.up();

    const expected = Math.min(start + 1, SLIDE_COUNT - 1);
    await expect.poll(async () => getCenteredIndex(page)).toBe(expected);
    await expect.poll(async () => getDebugIndex(page)).toBe(expected);
  });

  test("announceChanges=false suppresses announcements", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?announce=0`);
    await pauseAutoplay(page);

    await expect(page.getByTestId("announcement-latest")).toHaveText("");

    await page.getByTestId("next-btn").click();
    await page.waitForTimeout(120);

    await expect(page.getByTestId("announcement-latest")).toHaveText("");
  });

  test("custom live mode is respected when autoplay is paused", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?live=assertive`);

    const toggle = page.getByTestId("autoplay-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-autoplay-state", "paused");

    await expect(page.getByTestId("announcer")).toHaveAttribute("aria-live", "assertive");
  });

  test("resumeAfterInteraction=false disables autoplay after navigation", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?resume=0&dwell=1200&loop=0`);

    const toggle = page.getByTestId("autoplay-toggle");
    await expect(toggle).toHaveAttribute("data-autoplay-state", "playing");

    const start = await getCenteredIndex(page);
    await page.getByTestId("next-btn").click();
    await expect(toggle).toHaveAttribute("data-autoplay-state", "paused");

    await expect.poll(async () => getCenteredIndex(page)).not.toBe(start);
    const settled = await getCenteredIndex(page);
    await page.waitForTimeout(1300);
    await expect(toggle).toHaveAttribute("data-autoplay-state", "paused");
    await expect.poll(async () => getCenteredIndex(page)).toBe(settled);
  });

  test("interaction.step advances by the configured step", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?step=2&loop=0`);
    await pauseAutoplay(page);

    await moveToIndex(page, 0);
    await page.getByTestId("next-btn").click();

    await expect.poll(async () => getCenteredIndex(page)).toBe(2);
  });

  test("draggable=false ignores pointer drag", async ({ page }) => {
    await waitForReady(page, `${TEST_PATH}?drag=0`);
    await pauseAutoplay(page);

    const start = await getCenteredIndex(page);
    const center = await getViewportCenter(page);

    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x - 420, center.y, { steps: 10 });
    await page.mouse.up();

    await expect.poll(async () => getCenteredIndex(page)).toBe(start);
  });
});
