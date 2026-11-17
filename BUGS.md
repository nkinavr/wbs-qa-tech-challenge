# Bug / Observation Log

Anything that looks like a defect or surprising behaviour while testing is recorded here.

| ID | Area | Title | Severity |
|---|---|---|---|
| BUG-001 | API | Auth returns 200 on invalid credentials | Medium |
| BUG-002 | API | Successful DELETE returns 201 | Low |
| BUG-003 | API | /ping returns 201 | Low |
| BUG-004 | API | Booking accepts checkout date before checkin date | Medium |
| BUG-005 | UI | Logout visible when not logged in | Medium |
| BUG-006 | UI | Vague error when room has no price | Low |
| BUG-007 | UI | Reservation page hangs on server error | High |
| BUG-008 | API | Missing required fields cause 500 instead of 400 | Medium |

---

## API – restful-booker.herokuapp.com

### BUG-001 – Auth endpoint returns 200 on invalid credentials

**Endpoint:** `POST /auth`  
**Observed:**  
Sending an incorrect password still returns HTTP 200 with body:
```json
{ "reason": "Bad credentials" }
```
**Expected:**  
401 Unauthorized (or 403) so that clients can rely on status codes for authentication failures.

**Impact:** Medium – consumers must parse the body instead of using standard HTTP semantics.

**Steps to reproduce:**
```bash
curl -X POST https://restful-booker.herokuapp.com/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
```

**Automation:** "should return Bad credentials reason with invalid password" documents the current behaviour.

---

### BUG-002 – Successful DELETE returns 201 Created

**Endpoint:** `DELETE /booking/{id}` (with valid token)  
**Observed:** HTTP 201  
**Expected:** 200 OK or 204 No Content

**Impact:** Low – functional, but clients that check for 200/204 will treat a successful delete as unexpected.

---

### BUG-003 – `/ping` health check returns 201

**Endpoint:** `GET /ping`  
**Observed:** 201 Created  
**Expected:** 200 OK

**Impact:** Low – uptime monitors that expect 200 from a health check may report the service as down.

**Automation:** "health check should confirm the API is up ping should succeed" documents the current behaviour.

---

### BUG-004 – Booking accepts checkout date before checkin date

**Endpoint:** `POST /booking`  
**Observed:**  
Creating a booking with a `checkout` date earlier than the `checkin` date returns **HTTP 200** and a bookingid.  
**Expected:**  
400 Bad Request with a clear validation message.

**Impact:** Medium – invalid date ranges get stored, which breaks any logic that calculates nights or availability.

**Automation:** "creating a booking with checkout date before checkin date should be rejected" asserts the correct behaviour (4xx) and is marked `test.fail()` until this is fixed.

---

### BUG-008 – Missing required fields cause 500 instead of 400

**Endpoint:** `POST /booking`  
**Steps:** Send a booking with `lastname`, `depositpaid` and `bookingdates` missing:
```json
{ "firstname": "Test", "totalprice": 100 }
```
**Observed:** HTTP **500** Internal Server Error.  
**Expected:** 400 Bad Request with a message naming the missing fields.

**Impact:** Medium – input validation is missing, so bad requests crash the server instead of being rejected cleanly. Clients can't tell their own mistake from a server outage.

**Automation:** "creating a booking with missing required fields should be rejected" confirms the booking is not accepted (non-2xx) and is annotated with this bug.

---

## UI – automationintesting.online

### BUG-005 – Logout button visible to unauthenticated users

**Page:** `/admin`  
**Steps:** Open `/admin` and log in with a wrong password.  
**Observed:** "Invalid credentials" is shown, but a **Logout** button is also visible in the navbar.  
**Expected:** No Logout control until the user is authenticated.

**Impact:** Medium – confusing for users, and any check that relies on the Logout button to decide "logged in" gives a false pass. Tests therefore check the URL and the login form instead.

**Automation:** Referenced by "should reject invalid credentials" in `admin.spec.ts`.

---

### BUG-006 – Vague error when creating a room without a price

**Page:** `/admin/rooms`  
**Steps:** Log in as admin → enter a room number, leave Price empty → Create.  
**Observed:** "Failed to create room" in a blue, info-style box; the browser console shows a 400 response.  
**Expected:** A clear field-level message such as "Price is required", styled as an error.

**Impact:** Low – the admin cannot tell what to fix.

**Found:** during manual exploration of the admin area (not automated).

---

### BUG-007 – Reservation page hangs forever when the API errors

**Page:** `/reservation/{roomId}?checkin=…&checkout=…`  
**Steps:** Open a room's reservation page (reproduced both by direct URL and manually in Chrome).  
**Observed:** An API request returns **500**; the console shows `Unexpected token 'I', "Internal S"... is not valid JSON`; the page shows an endless loading spinner.  
**Expected:** Room details load, or a clear error message is shown.

**Impact:** High – guests cannot book (the core flow) and get no feedback.

**Automation:** The reservation-page UI tests are marked `test.fixme()` referencing this bug.