# Bengal Bekary — Playtest Findings & Fix List

Playtested 2026-09-29 against the real stack: Express app on `http://127.0.0.1:3000`
(serves `frontend/` **and** `/api/*`). Flows driven: boot, menu sidebar, category
collections, cart, checkout against the live API, wishlist, order history, profile,
addresses, rewards, notifications, settings, help, contact + newsletter forms, and
API failure / malformed-input paths.

---

## P0 — Fixed in this pass

- [x] **`frontend/js/app.js` had a syntax error, so the entire app was dead.**
  A rename edit collapsed newlines and left `// Account data (sidebar features)`
  followed by `profile: …` on the same line, commenting out five properties and
  breaking the object literal → `SyntaxError: Unexpected token '{'`. `state`,
  `openSidebar`, `closeSidebar` were all `undefined`, so the menu toggle, cart,
  categories, checkout and account panels did nothing. This was the reported
  "menu toggle is not working". Verified: `node --check` + live page (`state` exists,
  `Loaded 20 products`, toggle opens the sidebar).
- [x] **15 `href="#"` anchors threw an uncaught `SyntaxError`.**
  The global smooth-scroll handler called `document.querySelector('#')` before
  `preventDefault()`. Every footer link, social icon, logo and the scroll-top button
  logged an exception. Bare `#` now scrolls to top without throwing; real anchors are
  unchanged (verified all 15 anchors, zero errors, normal nav still works).
- [x] **`POST /api/orders` accepted garbage as a valid order (returned `201`).**
  `{"items":"nope"}` passed the `items.length` check. Now requires a non-empty array
  of items whose `id` and `quantity` coerce to positive integers → `400` for
  `items: []`, `"nope"`, `quantity: 0`, `quantity: 1.5`, `id: null` and items missing
  `id`. Re-verified that the real frontend payload still returns `201`.
- [x] **Malformed JSON returned an HTML stack trace leaking the server path.**
  `{oops` → `400 text/html` with `C:\sweet shop\backend\node_modules\...` in the body.
  Now a JSON error handler returns `{"message":"Invalid JSON body"}` as `application/json`.
- [x] **Unknown `/api/*` routes returned HTML.** Now `404 application/json`.
- [x] **Order IDs used the old brand prefix.** Backend issued `AUR…` while the UI showed
  `#BBK…`, so checkout said `#BBK7860` but order history said `#AUR7860`. Backend now
  emits `BBK…` and the frontend strips any alpha prefix instead of hardcoding `AUR`.
  Verified end to end: success panel and history both show `#BBK3393`.

## P0 — Checkout flow (fixed in this pass)

- [x] **Checkout skipped the Payment and Confirm steps.** The stepper advertised three
  steps but "Continue to Payment" submitted the order straight to the API from step 1,
  so the payment and confirm panels never existed. Now three real panels:
  **Delivery → Payment → Confirm**, with the stepper marking completed steps green and
  Back buttons on steps 2 and 3.
- [x] **Payment methods added**: Cash on Delivery, UPI, Credit / Debit Card, PayPal and
  Net Banking, each revealing its own fields (UPI ID, card number / name / expiry / CVV,
  PayPal email, bank picker) and each validated before the review step.
- [x] **Order summary on the confirm step**: delivery details, chosen delivery method,
  chosen payment method (card number shown masked), item lines and totals.
- [x] **Delivery fee is now applied.** The delivery options advertised ₹99 / ₹199 but the
  old total ignored them; the summary and the stored order total now include the fee, so
  loyalty points scale with what the customer actually pays.
- [x] **Payment method is recorded** on the order and shown on the success screen and in
  order history ("Net Banking", "Cash on Delivery", …).
- [ ] **Payments are simulated.** There is no gateway: nothing is charged, card details
  are never sent anywhere, and the backend ignores the `payment` field entirely. If real
  payments are needed, this needs a provider integration plus server-side amount
  recalculation (never trust a client-sent total).

## P1 — Remaining defects / dead ends

- [ ] **`backend/routes/orders.js` is dead, broken code.** Referenced by nothing, yet it
  calls undefined `liveRiders`, `idx` and `liveCycle` — it would throw on `require`.
  Delete it, or implement it properly and mount it from `server.js`.
- [ ] **The contact form and newsletter are fake.** Both only fire a toast; there is no
  `/api/contact` or `/api/subscribe`, so a customer's message is silently discarded.
  Either persist them server-side or say "demo" in the UI.
- [ ] **No order persistence.** `POST /api/orders` simulates a 1s delay and returns
  fake ids; nothing is stored and there is no `GET /api/orders`. Order history lives
  only in `localStorage`.
- [ ] **Brand leftovers in `backend/package.json`**: `name: "aurelia-confectionery-backend"`,
  description "Backend API for sweet shop" (and the matching `name` in `package-lock.json`).
- [ ] **No `localStorage` migration.** Users who visited before the rebrand keep cart,
  wishlist, orders and profile under the old `aurelia*` keys — they silently lose them.
  Existing stored notification text still reads "Welcome to Aurélia!".
- [ ] **Placeholder business data**: New York address and `+1 (555) 123-4567` under a
  Bengal-named bakery; `Privacy Policy` / `Terms` / `Refund` / `FAQ` are `#` links
  (they now scroll to top instead of erroring, but they lead nowhere).
- [ ] **Image paths are inconsistent.** `backend/data/products.json` uses absolute
  `/images/...`; the JS fallback uses relative `images/...`, which breaks if the site is
  served from a sub-path.
- [ ] **`.reveal` hides sections with `opacity: 0` until JS runs.** When the script failed,
  most of the page was invisible. Add a `no-js`/failure fallback so content is never
  hidden by a broken script.
- [ ] **No tests at all.** The P0 bug (a syntax error killing the whole app) is exactly
  what a 5-line smoke test catches. Add: load page → assert no console errors →
  assert `window.closeSidebar` is a function → assert 20 products rendered.
- [ ] **Cache-busting is manual** (`style.css?v=3`, `app.js?v=6`). Bump on deploy or
  users get stale files.
- [ ] **Dev leftovers in the repo**: `server.log` at the root and in `backend/`.

## P2 — Structural health

- [ ] **`frontend/js/app.js` (~890 lines) owns everything**: state, HTML templating,
  event wiring, `localStorage` persistence and `fetch` calls in one flat global script.
  Inline `onclick=` attributes in `index.html` call into `window.*` globals, so behavior
  has two owners (markup + script). Splitting into `state / api / render / ui` modules
  would remove the globals and make this class of bug visible.
- [ ] **`frontend/css/style.css` (~3400 lines)** has three separate `max-width: 768px`
  blocks, the menu-toggle rules split across lines 375/407/420, and the account-modal /
  toast styles appended ~2000 lines away from the sections they belong to. The toggle
  bug was hard to see precisely because its base rule and its media override were far
  apart.
- [ ] **`backend/server.js` mixes routes, static serving and error handling** in one file
  while an empty `routes/` directory sits unused; move order/product routes into modules.
- [ ] **Frontend assumes it is served by the backend.** `/api/*` is called relatively, so
  opening `frontend/` from any other static server silently falls back to hardcoded
  products — which is what masked the dead API during earlier testing.

## Verified working (no action needed)

Menu sidebar (open / X / overlay / Esc / nav links / body scroll lock), category
collections (correct counts and images), cart (add, rapid adds, quantity → 0 removal,
remove, subtotal math, empty state), checkout end to end, loyalty points, order history,
wishlist (add, panel, move-to-cart, empty state), addresses (add / remove / empty),
notifications (badge clearing), rewards, settings, help, profile save/reset, form
validation blocking empty and partial submits, and graceful degradation when the API
is unreachable (cart preserved, no order written, error toast shown).
