# Architectural Decisions

## Why Playwright for both API and UI?

- Single tool and language (TypeScript) for both layers → lower cognitive load and shared fixtures/utilities.
- Excellent first-class `APIRequestContext` that feels natural next to browser tests.
- Built-in parallelisation, retries, tracing, and screenshots.
- Strong TypeScript support and active ecosystem.

Alternative considered: RestAssured.NET / RestSharp (C#) or Postman + Newman.  
I chose Playwright + TypeScript because both are on the preferred tooling list, I can cover API and UI with one tool and one language, and it is the stack I am most productive in.

## Client layer vs raw `request` in tests

Thin client classes (`AuthClient`, `BookingClient`) encapsulate:
- URL construction
- common headers
- basic response assertions that every happy-path call needs

This keeps tests readable and makes it trivial to add logging, retries, or switch base URL later.

Raw `*Raw` methods are still exposed for negative tests where we need full control over status codes.

## Fixtures over global setup

Auth token is obtained via a Playwright fixture (`authCookie`).  
Benefits:
- Lazy – only created when a test actually needs it
- Isolated per worker
- Easy to override in a specific test

## Data strategy

`@faker-js/faker` + a small `DataFactory` keeps payloads realistic and unique without hard-coding values that become brittle when the environment resets.

## Reporting

Allure was chosen because:
- Rich hierarchical view (Epic / Feature / Severity / Tags)
- Attachments (screenshots, traces, request/response bodies can be added later)
- Historical trends if the report is published in CI

## What I would add with more time

1. **Schema validation with Zod** to replace the hand-written shape checks in `schemas.ts`, applied to every response.
2. **Publish the Allure report to GitHub Pages** (CI currently uploads it as an artifact).
3. **UI fixtures** so page objects are injected the same way the API clients are.
4. **Environment config** (`.env` + dotenv) so the same suite can run against a local Restful-Booker-Platform.
5. **Soft assertions** and better failure messages for multi-step CRUD tests.
6. **Performance smoke** (a few concurrent creates) to surface basic load issues.

## Handling known defects

Tests assert the **correct** behaviour, not the buggy behaviour. Where a defect is known:
- API defects are marked with `test.fail()` and linked to `BUGS.md`, so the suite stays green while the bug exists and flags it when it gets fixed.
- UI flows blocked by an environment defect (the reservation page hanging, BUG-007) are marked `test.fixme()` with the bug ID, instead of hiding failures with `continue-on-error` in CI.
- Admin login state is checked by URL and the login form, not the Logout button, because Logout is visible even when logged out (BUG-005).

## Trade-offs made for the 4-hour constraint

- Only Chromium for UI (easy to expand).
- No visual regression or accessibility checks yet.
- Minimal negative surface – focused on the highest-risk cases (authz + required fields).