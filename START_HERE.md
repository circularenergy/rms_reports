# CE RMS Dashboard V4 WIP

This folder is the complete integration candidate. The working V3.0.2.1 folder is preserved.

## Start using the dashboard
1. Close an older local server using port 5500. Do not run two projects on the same port.
2. Double-click START_LOCAL.cmd in this folder. It reads config/local-server.cmd, starts this project's static server, and opens http://127.0.0.1:5500/ only after binding succeeds.
3. Keep the server window open. Python 3 is required; the verification runtime is Python 3.12.14. The launcher checks the Windows py launcher, then python. No npm install or build is required to use the dashboard.
4. Select Continue with Google and complete your company sign-in yourself. The permitted company domain is configured in config/app-config.js. Database permissions remain controlled by Supabase.
5. Select reporting dates (inclusive, Nigeria time) and site, then open any of the five reports. The shell converts the end to an exclusive instant once. Page-level SOH/group/print controls remain inside their reports.
6. Click a site/table row for the existing report popup. Navigating or changing dates/site closes the outgoing page and its popups immediately.
7. Refresh always retrieves fresh required data. Navigation may reuse an exactly matching response younger than five minutes; the original retrieval time is shown. Failed refreshes show unavailable status and clear previous figures.
8. Stop the server with Ctrl+C in its window. If startup fails, read the displayed error. Never change ports just to bypass an occupied server without checking the configuration and Supabase return URL.

## Files you may need
- RUN: START_LOCAL.cmd. This is the normal starting point.
- SETTINGS: config/local-server.cmd (local host/port); config/app-config.js (public endpoint/key, domain, timezone, cache); config/api-registry.js (RPC contracts/parameters); config/page-registry.js (routes/dependencies).
- PAGE UPDATES: pages/executive, pages/data-health and pages/bms. Each folder includes its manifest, adapter and approved report source with scoped hosted-mode changes.
- READ WHEN NEEDED: DEPLOY_AND_ROLLBACK.md and tests instructions. DELIVERY_MANIFEST.json inventories every delivered file and its role; it is a record, not a file you execute.
- VERIFICATION ONLY: the external Outputs/Verification folder contains evidence and detailed API mappings. You do not need to read these to start the dashboard.

## Test an isolated report
Open http://127.0.0.1:5500/tests/test-shell.html. Choose the report and Local fixture mode, then select the relevant supplied JSON file. Executive and Health accept the supplied executive_payload export; BMS accepts its full V2 result. Fixture results are explicitly labelled TEST FIXTURE. Original business fixtures are kept outside the public application folder.
For live testing, first sign in through the dashboard, then open the test shell in the same tab so the existing sessionStorage session is available. Choose Authenticated live, dates/site and Render. The test shell uses the same page packages, API registry, cache and bridge.

## Maintain a page
1. Keep a copy of the working page folder outside the deployed application.
2. Update only that page folder and its manifest when the bridge and API contract remain compatible.
3. Exercise it in the test shell, then in the dashboard with both fixtures and authorized live data. Check its popups and other reports.
4. Replace the approved page folder in the working project. No other page needs rebuilding. A new API dependency can be declared in the registries; a new response transformation still requires its own adapter code.
5. Use the release inventory/change record to track the update and rollback. Configuration or contract changes require relevant regression checks.

## Verification commands
Optional developer verification uses Node 24.22.1: node --test tests/core.test.mjs tests/request-scheduler.test.mjs. This is not a runtime requirement for dashboard users. Browser checks require Playwright and pngjs plus an installed Chromium browser; see tests/README.md. No production SQL installation is part of this package.

BMS Data Availability in Section 01 and its popup deliberately remains N/A, matching the authoritative specification and your implementation confirmation. This does not change the percentages on the separate Data Health page.

## 4.0.1 update — 30 October 2026
The shared page title now scrolls with each report under the fixed dashboard header. Duplicate standalone mastheads are hidden; BMS SOH and Print controls remain. Report popups remain positioned within the visible report area.

Database requests are queued one at a time across the shell. A compact centered panel shows the report inputs waiting, loading and ready; monthly profile progress uses completed-month counts. Instant cache reuse may finish before the panel appears. The concurrency and panel delay are in config/app-config.js under loading.

Executive combines several shared APIs. Serialization reduces concurrent request load; it does not guarantee that an individual database query will meet its statement timeout. SQL, database permissions and timeout settings are unchanged.

## 4.0.2 update
All shared inputs are prepared centrally, including the twelve monthly Energy profile requests. Initial loading can therefore take longer; navigation reuses matching responses for up to five minutes. Refresh bypasses the cache; dates, site, user and policy form the cache key. At expiry the current report is reloaded. No browser-persistent business-data cache is used. Closing/reloading the app starts a new in-memory session.

Freshness is in the fixed top header; hover for individual retrieval times. Duplicate Executive/Health context bars and the BMS SOH/Print toolbar are hidden. The existing default SOH basis remains Any breach in window.

## 4.0.3 visual correction
Freshness now sits under the dashboard name in the existing top row. Executive section 01 heading is hidden; its context note is beside the scrolling title. Redundant BMS source notice and report top padding are removed. BMS popup table height caps are removed so all eight rows remain accessible; smaller screens retain popup-body scrolling. Formulas, data loading, cache, keyboard handlers and adapters are unchanged from 4.0.2.
