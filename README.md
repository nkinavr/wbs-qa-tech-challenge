# WBS QA Engineer Tech Challenge

**Live test report:** https://nkinavr.github.io/wbs-qa-tech-challenge/

**Playwright + TypeScript** framework covering both **API** (Restful Booker) and **UI** (automationintesting.online) with **Allure** reporting.

---

## Quick Start

**Prerequisites:** Node.js 18+ and Java 8+ (Java is needed for the Allure report).

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (for UI tests)
npx playwright install chromium

# 3. Run API tests only
npm run test:api

# 4. Run UI tests only
npm run test:ui

# 5. Run everything
npm test

# 6. Type check (no output = no errors)
npm run typecheck

# 7. Generate & open Allure report
npm run report
# or live serve:
npm run report:serve
```

---

## Project Structure

```
src/
  api/
    clients/          # Thin HTTP clients (AuthClient, BookingClient)
    models/           # TypeScript interfaces + lightweight shape checks
    fixtures/         # Playwright fixtures that inject clients + auth
  ui/
    pages/            # Page Object Model
      HomePage.ts
      ContactPage.ts
      AdminPage.ts
      ReservationPage.ts
  utils/
    data.factory.ts   # Test data generation with Faker
tests/
  api/                # API test suites
  ui/                 # UI test suites
```

---

## Test Scenarios

Full coverage was **not** the goal. Scenarios were chosen by risk and business impact: anything that can block a stay being booked, or that can leak/change data without proper auth, came first. Supporting flows (search, contact, navigation) came next. Pure edge cases that only affect data quality were lower priority.

### API – Restful Booker

#### Positive

| Scenario | Why prioritised |
|----------|-----------------|
| **Auth – valid credentials return a token** | Every protected write (update/delete) depends on this. Without a reliable token path the rest of the suite is blocked. |
| **Full CRUD** (Create → Read → Update → Partial Update → Delete) | This is the core lifecycle of a booking. One end-to-end path gives high confidence that the main product works. |
| **Search / filter booking IDs** (by name) | Staff and systems routinely look up bookings. Broken search is high-visibility even if create/delete still work. |
| **Health check `/ping`** | Cheap smoke signal that the service is up before running the heavier suite. |

#### Negative

| Scenario | Why prioritised |
|----------|-----------------|
| **Update / Delete without a valid token** | Authorization is a critical control. If unauthenticated clients can change or remove bookings, that is a serious defect. |
| **Create with missing required fields** | Basic input validation. Incomplete bookings must be rejected. Currently returns 500 instead of 400 – see BUG-008. |
| **Get non-existent booking ID** | Confirms sensible error handling (expect 404) so clients can distinguish "not found" from other failures. |
| **Invalid date order** (checkout before checkin) | Data integrity. A booking where checkout is before checkin must be rejected with a 4xx. Currently accepted – see BUG-004 (marked `test.fail()`). |
| **Auth with wrong password** | Documents actual behaviour (still HTTP 200 + `reason: Bad credentials`) – see BUG-001. Important for consumers that rely on status codes. |

### UI – automationintesting.online (Shady Meadows)

#### Positive

| Scenario | Why prioritised |
|----------|-----------------|
| **Home page loads and rooms are visible** | Baseline smoke. If the landing experience is broken, nothing else matters to a guest. |
| **Navigate from "Book now" to a reservation page** | Entry point into the booking funnel. A broken link here stops all revenue-path testing. Currently skipped (`test.fixme`) – see BUG-007. |
| **Complete a booking with valid guest details** | Main user journey. Highest business value on the UI side. Currently skipped (`test.fixme`) – see BUG-007. |
| **Contact form – valid submission** | Common secondary interaction; failures here frustrate users and lose leads. |
| **Admin login with valid credentials** | Privileged area. Confirms staff can reach management functions. |
| **Reach Admin from the front-page nav** | Navigation integrity between public and admin areas. |

#### Negative

| Scenario | Why prioritised |
|----------|-----------------|
| **Admin login with invalid credentials** | Auth enforcement on the privileged surface. Must not grant access with a wrong password. Checked by URL and login form, because Logout is visible even when logged out – see BUG-005. |
| **Contact form – empty required fields** | Basic client/server validation. Submitting blanks must show an error and no success message. |
| **Contact form – invalid email format** | Same validation concern; email is a key field for follow-up. |
| **Contact form – empty name** | Name is required to address the guest's enquiry. |

---

## Reporting

Allure is configured out of the box (epic / feature / severity / tags on every test).

```bash
npm test                  # produces allure-results/
npm run report            # generates HTML + opens browser
npm run report:serve      # live serve without generating files
```

---

## Assumptions & Known Limitations

- Restful Booker resets its data every ~10 minutes. Tests that create data are self-contained.
- Some endpoints return non-standard status codes (`201` on successful DELETE and on `/ping` – BUG-002, BUG-003). Assertions match observed behaviour.
- Auth endpoint returns `200` even with bad credentials and a `{ reason: "Bad credentials" }` body – documented as BUG-001.
- The reservation page currently hangs on a 500 error (BUG-007), so the two reservation-page tests are marked `test.fixme()` and show as skipped. Remove those lines once the page loads again.
- Known API defects are asserted against the **correct** behaviour and marked `test.fail()`, so the suite stays green while the bug exists and flags it when it is fixed.
- The demo sites are public and shared, so test data is randomised and no test depends on data created by another test.
- UI tests currently use Chromium only (easy to expand to Firefox/WebKit).

---

## Bonus items

- [x] Maintainable client + Page Object structure
- [x] Allure reporting with epic / feature / severity / tags
- [x] Both API **and** UI frameworks
- [x] DECISIONS.md + BUGS.md
- [x] GitHub Actions CI (`.github/workflows/ci.yml`) – runs API + UI, uploads Allure report as artifact

---

## How to run from a clean start

```bash
unzip wbs-qa-tech-challenge.zip   # or git clone <your-repo>
cd wbs-qa-tech-challenge
npm install
npx playwright install --with-deps chromium
npm run test:api
npm run test:ui
npm run report
```

See also:

- `DECISIONS.md` – architectural choices and what would be added with more time
- `BUGS.md` – defects and surprising behaviour found while testing (8 logged)