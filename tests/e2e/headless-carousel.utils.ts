import { expect, type Page } from "@playwright/test";

export const TEST_PATH = "/en/test/headless-carousel";
export const SLIDE_COUNT = 9;

export async function waitForReady(page: Page, path: string = TEST_PATH) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  const track = page.getByTestId("carousel-track");
  await expect(track).toHaveAttribute("data-ready", "");
  await expect(page.getByTestId("engine-index")).toBeVisible();
}

export async function getCenteredIndex(page: Page) {
  const index = await page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>("[data-testid='carousel-viewport']");
    if (!viewport) return null;

    const vpRect = viewport.getBoundingClientRect();
    const vpCenter = vpRect.left + vpRect.width / 2;

    const slides = Array.from(
      document.querySelectorAll<HTMLElement>("[data-carousel-slide-index]"),
    );

    let best: number | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const el of slides) {
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(center - vpCenter);

      if (dist < bestDist) {
        bestDist = dist;
        const raw = el.dataset.carouselSlideIndex ?? "";
        const value = Number(raw);
        best = Number.isFinite(value) ? value : null;
      }
    }

    return best;
  });

  if (index === null) {
    throw new Error("Unable to resolve centered slide index.");
  }
  return index;
}

export async function pauseAutoplay(page: Page) {
  const toggle = page.getByTestId("autoplay-toggle");
  const state = await toggle.getAttribute("data-autoplay-state");
  if (state === "playing") {
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-autoplay-state", "paused");
  }
}

export async function setVisibility(page: Page, state: "hidden" | "visible") {
  await page.evaluate((nextState) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => nextState,
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => nextState === "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

export async function getViewportCenter(page: Page) {
  const box = await page.getByTestId("carousel-viewport").boundingBox();
  if (!box) {
    throw new Error("Viewport bounding box not available.");
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export async function getOutsidePoint(page: Page) {
  const box = await page.getByTestId("carousel-root").boundingBox();
  if (!box) {
    throw new Error("Root bounding box not available.");
  }
  return { x: Math.max(0, box.x - 50), y: Math.max(0, box.y - 50) };
}

export async function getPinnedIndices(page: Page) {
  const pinned = await page.evaluate(() => {
    const debug = (globalThis as { __carouselDebug?: { pinned?: number[] } }).__carouselDebug;
    return debug?.pinned ?? [];
  });
  return pinned;
}

export async function getDebugIndex(page: Page) {
  const index = await page.evaluate(() => {
    const debug = (globalThis as { __carouselDebug?: { index?: number } }).__carouselDebug;
    return debug?.index ?? null;
  });
  if (index === null) {
    throw new Error("Debug index unavailable.");
  }
  return index;
}

export async function getLastAnnouncement(page: Page) {
  const debugValue = await page.evaluate(() => {
    const debug = (globalThis as { __carouselDebug?: { lastAnnouncement?: string | null } })
      .__carouselDebug;
    return debug?.lastAnnouncement ?? null;
  });
  if (debugValue) return debugValue;

  const value = await page.getByTestId("announcement-latest").textContent();
  return value ?? "";
}

export async function moveToIndex(page: Page, target: number) {
  for (let i = 0; i < SLIDE_COUNT + 2; i += 1) {
    const current = await getCenteredIndex(page);
    if (current === target) return;
    if (current < target) {
      await page.getByTestId("next-btn").click();
    } else {
      await page.getByTestId("prev-btn").click();
    }
    await page.waitForTimeout(60);
  }
  throw new Error(`Unable to reach index ${target}.`);
}
