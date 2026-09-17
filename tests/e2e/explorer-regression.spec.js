import { test, expect } from "@playwright/test";

// Use an unpublished theme or a local rendered-theme mirror. Cart writes are
// intercepted in every test: these checks never create orders or clear carts.
const base = process.env.EXPLORER_QA_URL;
test.skip(!base, "Set EXPLORER_QA_URL to a theme containing the explorer.");

// Anonymous price quotes do not write the customer's Ajax cart. Mock Shopify's
// quote response independently of cart/add so discounted totals can be verified.
async function quoteResponse(route, page, discount = 0) {
  const input = route.request().postDataJSON().variables.input;
  const config = await page
    .locator("kevin-explorer")
    .evaluate((el) => el.config);
  const offers = [config.device, ...config.covers];
  const nodes = input.lines.map((line) => {
    const id = line.merchandiseId.split("/").pop();
    const offer = offers.find((v) => String(v.id) === id);
    const cents =
      offer.amount * line.quantity -
      (id === String(config.device.id) ? discount : 0);
    return {
      quantity: line.quantity,
      merchandise: { id: line.merchandiseId },
      cost: {
        totalAmount: {
          amount: (cents / 100).toFixed(2),
          currencyCode: config.currency,
        },
      },
    };
  });
  const total = nodes.reduce(
    (sum, v) => sum + Number(v.cost.totalAmount.amount),
    0,
  );
  return {
    data: {
      cartCreate: {
        cart: {
          cost: {
            totalAmount: {
              amount: total.toFixed(2),
              currencyCode: config.currency,
            },
          },
          lines: { nodes },
        },
        userErrors: [],
      },
    },
  };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/2026-07/graphql.json", async (route) =>
    route.fulfill({ json: await quoteResponse(route, page) }),
  );
});

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
      await expect(checkout).toBeDisabled();
    }
    expect(writes).toHaveLength(1);
    expect(writes[0].items.map((item) => item.quantity)).toEqual([2, 1, 1]);
    expect(clears).toHaveLength(0);
  });
}

test("mixed quantities persist across previews, update prices and reach the cart once", async ({
  page,
}) => {
  const writes = [];
  let price = 12345;
  await page.route("**/variants/*.js", (route) =>
    route.fulfill({ json: { available: true, price } }),
  );
  await page.route("**/cart/add.js", (route) => {
    writes.push(route.request().postDataJSON());
    return route.fulfill({ json: { items: writes.at(-1).items } });
  });
  await open(page, "/");
  await page.locator("[data-ke-quantity=device]").fill("6");
  for (const [colour, quantity] of [
    ["white", 2],
    ["blue", 3],
    ["red", 105],
  ]) {
    await page.locator(`[data-ke-colour=${colour}]`).click();
    await page.locator("[data-ke-quantity=cover]").fill(String(quantity));
  }
  await page.locator("[data-ke-colour=white]").click();
  await expect(page.locator("[data-ke-quantity=cover]")).toHaveValue("2");
  await expect(page.locator("[data-ke-count=red]")).toHaveText("105");
  expect(writes).toHaveLength(0);
  await expect(page.locator("[data-ke-total]")).toContainText("14,320.20");
  const { device, covers } = JSON.parse(
    await page.locator("[data-ke-data]").textContent(),
  );
  await page.locator(".ke-order-review > summary").click();
  await expect(page.locator(".ke-order-breakdown")).toContainText("105");
  await page.locator(".ke-order-review > summary").click();
  price = 12900;
  await page.locator("[data-ke-buy]").click();
  await expect(page.locator("[data-ke-cart]")).toBeVisible();
  await expect(page.locator("[data-ke-total]")).toContainText("14,964.00");
  expect(writes).toHaveLength(1);
  const counts = Object.fromEntries(
    writes[0].items.map((v) => [v.id, v.quantity]),
  );
  expect(counts[device.id]).toBe(6);
  for (const [colour, quantity] of [
    ["white", 2],
    ["blue", 3],
    ["red", 105],
  ])
    expect(counts[covers.find((v) => v.colour === colour).id]).toBe(quantity);
});

test("homepage selection carries into configure and synchronizes both quantity controls", async ({
  page,
}) => {
  await open(page, "/");
  await page.locator("[data-ke-quantity=device]").fill("8");
  await page.locator("[data-ke-colour=blue]").click();
  await page.locator("[data-ke-quantity=cover]").fill("12");
  await page.locator("[data-ke-colour=white]").click();
  await page.locator("[data-ke-quantity=cover]").fill("3");
  await page.locator("[data-ke-configure]").click();
  await page.waitForFunction(() =>
    document
      .querySelector("[data-configure]")
      ?.classList.contains("configure-page--ready"),
  );
  await expect(page.locator("[data-configure-qty-value]")).toHaveText("8");
  await expect(
    page.locator("[data-cover-colour=blue] [data-cover-qty]"),
  ).toHaveText("12");
  await expect(
    page.locator("[data-cover-colour=white] [data-cover-qty]"),
  ).toHaveText("3");
  await expect(page.locator("[data-ke-quantity=device]")).toHaveValue("8");
  await page.locator("[data-ke-plus=device]").click();
  await expect(page.locator("[data-configure-qty-value]")).toHaveText("9");
  await page.locator("[data-configure-qty-plus]").click();
  await expect(page.locator("[data-ke-quantity=device]")).toHaveValue("10");
  await page.locator("[data-cover-colour=white] [data-cover-plus]").click();
  await expect(page.locator("[data-ke-quantity=cover]")).toHaveValue("4");
  await expect(page.locator("[data-ke-buy]")).toBeEnabled();
  await expect(page.locator("[data-ke-total]")).toHaveText(
    await page.locator("[data-configure-total]").textContent(),
  );
});

test("covers-only selection excludes device and an empty selection cannot submit", async ({
  page,
}) => {
  const writes = [];
  await page.route("**/cart/add.js", (r) => {
    writes.push(r.request().postDataJSON());
    return r.fulfill({ json: {} });
  });
  await open(page, "/");
  await page.locator("[data-ke-quantity=device]").fill("0");
  await expect(page.locator("[data-ke-buy]")).toBeDisabled();
  await page.locator("[data-ke-colour=brown]").click();
  await page.locator("[data-ke-quantity=cover]").fill("4");
  await page.locator("[data-ke-buy]").click();
  await expect(page.locator("[data-ke-cart]")).toBeVisible();
  expect(writes).toHaveLength(1);
  expect(writes[0].items).toHaveLength(1);
  expect(writes[0].items[0].quantity).toBe(4);
});

test("a partial-stock 422 shows cart reconciliation and blocks duplicate resubmission", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/cart/add.js", (r) => {
    writes++;
    return r.fulfill({
      status: 422,
      json: { description: "Only some stock is available" },
    });
  });
  await open(page, "/");
  await page.locator("[data-ke-buy]").click();
  await expect(page.locator("[data-ke-cart]")).toBeVisible();
  await expect(page.locator("[data-ke-buy]")).toBeDisabled();
  await expect(page.locator("[data-ke-quantity=device]")).toBeDisabled();
  expect(writes).toBe(1);
});

test("3D cart submission locks the native configure controls until confirmed", async ({
  page,
}) => {
  let release, started;
  const gate = new Promise((resolve) => (release = resolve));
  const sent = new Promise((resolve) => (started = resolve));
  await page.route("**/cart/add.js", async (route) => {
    started();
    await gate;
    return route.fulfill({ json: { items: [] } });
  });
  await open(page, "/pages/configure");
  await page.locator("[data-ke-view]").click();
  await page.locator("[data-ke-buy]").click();
  await sent;
  await expect(page.locator("[data-configure-qty-plus]")).toBeDisabled();
  await expect(
    page.locator("[data-configure-checkout]").first(),
  ).toBeDisabled();
  release();
  await expect(page.locator("[data-ke-cart]")).toBeVisible();
  await expect(page.locator("[data-configure-qty-plus]")).toBeEnabled();
});

test("Shopify discounts replace simple multiplication; stale quotes cannot overwrite a newer selection", async ({
  page,
}) => {
  const writes = [];
  await page.route("**/cart/add.js", (route) => {
    writes.push(route.request().postDataJSON());
    return route.fulfill({ json: {} });
  });
  await page.route("**/api/2026-07/graphql.json", async (route) => {
    const count = route.request().postDataJSON().variables.input
      .lines[0].quantity;
    const json = await quoteResponse(route, page, count > 1 ? 5794 : 0);
    if (count === 2) await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({ json });
  });
  await open(page, "/pages/configure");
  await expect(page.locator("[data-configure-checkout]").first()).toBeEnabled();
  await page.locator("[data-configure-qty-plus]").click();
  await page.waitForRequest(
    (r) =>
      r.url().includes("graphql.json") &&
      r.postDataJSON().variables.input.lines[0].quantity === 2,
  );
  await page.locator("[data-configure-qty-plus]").click();
  await expect(page.locator("[data-configure-checkout]").first()).toBeEnabled();
  const expected = await page
    .locator("kevin-explorer")
    .evaluate((e) => e.config.device.amount * 3 - 5794);
  await page.waitForTimeout(900);
  expect(
    await page.locator("kevin-explorer").evaluate((e) => e.quoteData.amount),
  ).toBe(expected);
  expect(await page.locator("[data-ke-total]").textContent()).toBe(
    await page.locator("[data-configure-total]").textContent(),
  );
  expect(writes).toHaveLength(0);
});

test("unavailable price blocks both checkouts and retry recovers without changing the cart", async ({
  page,
}) => {
  let fail = true,
    writes = 0;
  await page.route("**/cart/add.js", (route) => {
    writes++;
    return route.fulfill({ json: {} });
  });
  await page.route("**/api/2026-07/graphql.json", async (route) =>
    fail
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: await quoteResponse(route, page) }),
  );
  await open(page, "/pages/configure");
  await expect(
    page.locator("[data-configure-checkout]").first(),
  ).toBeDisabled();
  await expect(page.locator("[data-ke-retry-price]")).not.toHaveAttribute(
    "hidden",
  );
  await expect(page.locator("[data-ke-total]")).toHaveText("Price unavailable");
  fail = false;
  await expect(page.locator("[data-configure-price-retry]")).toBeVisible();
  await page.locator("[data-configure-price-retry]").click();
  await expect(page.locator("[data-ke-buy]")).toBeEnabled();
  await expect(page.locator("[data-configure-checkout]").first()).toBeEnabled();
  expect(writes).toBe(0);
});

test("a price failure during final checkout verification prevents any cart write", async ({
  page,
}) => {
  let fail = false,
    writes = 0;
  await page.route("**/cart/add.js", (route) => {
    writes++;
    return route.fulfill({ json: {} });
  });
  await page.route("**/api/2026-07/graphql.json", async (route) =>
    fail
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: await quoteResponse(route, page) }),
  );
  await open(page, "/pages/configure");
  const buy = page.locator("[data-configure-checkout]").first();
  await expect(buy).toBeEnabled();
  fail = true;
  await buy.click();
  await expect(page.locator("[data-configure-error]")).toBeVisible();
  await expect(buy).toBeDisabled();
  await expect(page.locator("[data-configure-price-retry]")).toBeVisible();
  expect(writes).toBe(0);
});
