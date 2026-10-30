# Verification tools

Run node --test tests/core.test.mjs for context, cache and BMS mapping tests. Node is optional for normal dashboard use.

Open tests/test-shell.html through the running local server for fixture or authenticated live testing. Its Render action always clears the preceding page. Fixtures are read locally and explicitly labelled. The same pages/* folders are used by the dashboard.

The browser verification record outside this public folder documents same-browser comparisons against the immutable source HTMLs, permitted hosted control/provenance exclusions, viewport sizes, source data and results. Business fixtures and screenshots are intentionally external. Tests using mocked authentication/RPCs establish UI and lifecycle behavior; they do not certify real Google login, current Supabase grants or database latency.

After any adapter or shared lifecycle change, rerun core tests, fixture comparisons and the affected live checks. GitHub login remains a separate deployment acceptance test.

Reproduce source parity: node tests/browser-checks.mjs --references "<external Agreement_Reference_Verification.json>" --output "<external evidence folder>" --modules "<node_modules containing playwright and pngjs>" --browser "<installed Chromium executable>". This tests offline fixture rendering and popups, with the authorized hosted control/provenance changes applied equally to source and candidate. The Health long-table screenshots use matched tall viewports to avoid iframe clipping.
