import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const PAGE_URL = "/en/test/headless-carousel";

const getSelectedIndex = async (page: Page) => {
  return page.$$eval("[data-selected]", (nodes) => {
    const unique = Array.from(
      new Set(
        nodes
          .map((node) => Number(node.getAttribute("data-index")))
          .filter((n) => Number.isFinite(n)),
      ),
    );
    return unique[0] ?? -1;
  });
};

const pauseAutoplay = async (page: Page) => {
  const btn = page.getByTestId("play-pause-btn");
  if ((await btn.getAttribute("aria-pressed")) === "true") {
    await btn.click();
  }
};

const playAutoplay = async (page: Page) => {
  const btn = page.getByTestId("play-pause-btn");
  if ((await btn.getAttribute("aria-pressed")) !== "true") {
    await btn.click();
  }
};

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_URL);
  await page.waitForSelector('[data-testid="carousel-track"][data-ready]');
  await page.waitForSelector("[data-selected]");
});

test("renders expected aria roles and labels", async ({ page }) => {
  await pauseAutoplay(page);

  const root = page.getByTestId("carousel-root");
  await expect(root).toHaveAttribute("role", "region");
  await expect(root).toHaveAttribute("aria-roledescription", "carousel");
  await expect(root).toHaveAttribute("aria-label", "Headless carousel test");

  const slide = page.getByTestId("slide-0");
  await expect(slide).toHaveAttribute("aria-roledescription", "slide");
  await expect(slide).toHaveAttribute("aria-label", /1 of 3/);

  await expect(page.getByTestId("prev-btn")).toHaveAttribute("aria-label", "Previous slide");
  await expect(page.getByTestId("next-btn")).toHaveAttribute("aria-label", "Next slide");
});

test("prev/next buttons and keyboard move the carousel", async ({ page }) => {
  await pauseAutoplay(page);

  await expect.poll(async () => getSelectedIndex(page)).toBe(0);

  await page.getByTestId("next-btn").click();
  await expect.poll(async () => getSelectedIndex(page)).toBe(1);

  await page.getByTestId("prev-btn").click();
  await expect.poll(async () => getSelectedIndex(page)).toBe(0);

  await page.getByTestId("carousel-root").focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => getSelectedIndex(page)).toBe(1);

  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => getSelectedIndex(page)).toBe(0);

  await page.keyboard.press("End");
  await expect.poll(async () => getSelectedIndex(page)).toBe(2);

  await page.keyboard.press("Home");
  await expect.poll(async () => getSelectedIndex(page)).toBe(0);
});

test("dragging advances a slide", async ({ page }) => {
  await pauseAutoplay(page);

  const track = page.getByTestId("carousel-track");
  const box = await track.boundingBox();
  if (!box) throw new Error("No bounding box for carousel track");

  await expect.poll(async () => getSelectedIndex(page)).toBe(0);

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = startX - box.width * 0.9;

  const payload = (x: number, type: "pointerdown" | "pointermove" | "pointerup") => ({
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    clientX: x,
    clientY: startY,
    button: 0,
    buttons: type === "pointerup" ? 0 : 1,
  });

  await track.dispatchEvent("pointerdown", payload(startX, "pointerdown"));
  await track.dispatchEvent("pointermove", payload((startX + endX) / 2, "pointermove"));
  await track.dispatchEvent("pointermove", payload(endX, "pointermove"));
  await track.dispatchEvent("pointerup", payload(endX, "pointerup"));

  await page.waitForTimeout(250); // allow transitionend -> normalization

  await expect.poll(async () => getSelectedIndex(page), { timeout: 7000 }).toBe(1);
});

test("autoplay advances and pauses on hover", async ({ page }) => {
  await playAutoplay(page);
  await expect.poll(async () => getSelectedIndex(page)).toBe(0);

  // Wait for at least one autoplay tick.
  await expect.poll(async () => getSelectedIndex(page), { timeout: 3000 }).toBe(1);

  // Hover should pause further advancement.
  await page.getByTestId("carousel-root").hover();
  const pausedIndex = await getSelectedIndex(page);
  await page.waitForTimeout(1200);
  expect(await getSelectedIndex(page)).toBe(pausedIndex);

  // Leaving hover resumes autoplay.
  const rootBox = await page.getByTestId("carousel-root").boundingBox();
  if (!rootBox) throw new Error("No bounding box for root");
  await page.mouse.move(rootBox.x + rootBox.width + 50, rootBox.y + rootBox.height + 50);

  await expect.poll(async () => getSelectedIndex(page), { timeout: 5000 }).not.toBe(pausedIndex);
});