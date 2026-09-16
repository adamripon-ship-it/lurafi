import { test, expect } from "@playwright/test";

// Use an unpublished theme or a local rendered-theme mirror. Cart writes are
// intercepted in every test: these checks never create orders or clear carts.
const base = process.env.EXPLORER_QA_URL;
test.skip(!base, "Set EXPLORER_QA_URL to a theme containing the explorer.");

async function open(page, path) {
  await page.goto(new URL(path, base).href, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.querySelector("kevin-explorer")?.ready,
  );
}

test("3D failure retains the photograph and retry; preview never buys", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/cart/add.js", (route) => {
    writes++;
    return route.fulfill({ json: {} });
  });
  await page.route("**/*.glb*", (route) => route.abort());
  await open(page, "/");
  const explorer = page.locator("kevin-explorer");
  await expect(explorer.locator("model-viewer")).not.toHaveAttribute("src");
  await explorer.locator("[data-ke-colour=white]").click();
  await expect(explorer.locator("[data-ke-status]")).not.toBeEmpty({
    timeout: 60000,
  });
  await expect(explorer.locator("[data-ke-poster]")).toBeVisible();
  await expect(explorer.locator("[data-ke-load]")).toBeEnabled();
  await expect(explorer.locator("[data-ke-colour=grey]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(writes).toBe(0);
});

for (const outcome of ["success", "rejected", "uncertain"]) {
  test(`configure cart ${outcome}: one append request, no clearing`, async ({
    page,
  }) => {
    const writes = [],
      clears = [];
    await page.route("**/cart/clear.js", (route) => {
      clears.push(1);
      return route.fulfill({ json: {} });
    });
    await page.route("**/cart/add.js", async (route) => {
      writes.push(route.request().postDataJSON());
      if (outcome === "uncertain") return route.abort();
      return route.fulfill({
        status: outcome === "rejected" ? 422 : 200,
        json: { items: writes[0].items },
      });
    });
    await page.route("**/checkout", (route) =>
      route.fulfill({ contentType: "text/html", body: "Checkout boundary" }),
    );
    await open(page, "/pages/configure");
    await page.waitForFunction(() =>
      document
        .querySelector("[data-configure]")
        .classList.contains("configure-page--ready"),
    );
    await page.locator("[data-cover-colour=red] [data-cover-plus]").click();
    await page.locator("[data-cover-colour=white] [data-cover-plus]").click();
    await page.locator("[data-configure-qty-plus]").click();
    const checkout = page.locator("[data-configure-checkout]").first();
    await checkout.click();
    if (outcome === "success") await page.waitForURL("**/checkout");
    else {
      await expect(page.locator("[data-configure-error]")).toBeVisible();
      await expect(page.locator(".ke-checkout-cart")).toBeVisible();
      if (outcome === "uncertain") await expect(checkout).toBeDisabled();
      else await expect(checkout).toBeEnabled();
    }
    expect(writes).toHaveLength(1);
    expect(writes[0].items.map((item) => item.quantity)).toEqual([2, 1, 1]);
    expect(clears).toHaveLength(0);
  });
}

test("homepage bundle shows refreshed prices and appends device plus the chosen extra once", async ({
  page,
}) => {
  test.setTimeout(90000);
  const writes = [];
  await page.route("**/variants/*.js", (route) =>
    route.fulfill({ json: { available: true, price: 12345 } }),
  );
  await page.route("**/cart/add.js", (route) => {
    writes.push(route.request().postDataJSON());
    return route.fulfill({ json: { items: writes.at(-1).items } });
  });
  await open(page, "/");
  await page.locator("[data-ke-colour=white]").click();
  await page.waitForFunction(
    () => document.querySelector("kevin-explorer").dataset.material === "white",
  );
  expect(writes).toHaveLength(0);
  await page.locator("[data-ke-extra]").check();
  await expect(page.locator("[data-ke-total]")).toContainText("246.90");
  const config = await page.locator("[data-ke-data]").textContent();
  const { device, covers } = JSON.parse(config);
  await page.locator("[data-ke-buy]").click();
  await page.waitForFunction(
    () => !document.querySelector("kevin-explorer").pending,
  );
  expect(writes).toEqual([
    {
      items: [
        { id: device.id, quantity: 1 },
        { id: covers.find((v) => v.colour === "white").id, quantity: 1 },
      ],
    },
  ]);
  await expect(page.locator("[data-ke-cart]")).toBeVisible();
});
