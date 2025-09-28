import { test, expect } from '@playwright/test';

test('video on hero section should be muted by default', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('video');
  await video.waitFor(); // Ensure the element is ready
  const isMuted = await video.evaluate((node: HTMLVideoElement) => node.muted);
  expect(isMuted).toBe(true);
});