# Deployment and rollback

## Local acceptance first
Start this exact folder with START_LOCAL.cmd. Verify company login, authorized data loading, all five reports, date/site changes, Refresh and popups. Review the external verification report for passed and pending checks. Publication is a separate authorized action.

## Copy to the existing GitHub Pages repository
1. Preserve the currently deployed release outside the repository deployment contents.
2. In Supabase Authentication > URL Configuration, add https://circularenergy.github.io/ce-rms-dashboard/ to Redirect URLs. Do not include #overview. Keep the existing local return URLs. The Google provider callback stays the Supabase callback already configured.
3. Copy the complete candidate folder contents into the existing ce-rms-dashboard repository publishing location, preserving directory names and relative paths. No code edits, environment injection, npm installation, build or server deployment is required. A public browser URL/key is already in the shipped configuration.
4. Keep external business fixtures, authenticated test logs, screenshots and Outputs/Verification out of the public repository. The application tests folder contains code and instructions only. DELIVERY_MANIFEST.json identifies the files and their roles.
5. Publish through the existing repository process only after explicit authorization. Open the HTTPS deployment URL and perform a real company Google login and authenticated API read.
6. Test #overview, #uptime-sla, #energy-analysis, #bms and #data-health; refresh the browser on each route; check assets under /ce-rms-dashboard/; exercise date/site/Refresh, all popups and logout. Record the deployed URL and actual results.

## Rollback
Restore the preserved release folder contents through the same repository process. For local rollback, stop this server and launch the preserved V3.0.2.1 START_LOCAL.cmd. Do not run both on port 5500. No database or authentication-policy rollback is required because this integration changes no SQL, RLS/grants, provider credentials or statement timeouts.

## Configuration boundaries
Browser settings are public. Privileged/service-role keys, database passwords and future AI-provider secrets must stay server-side. Future contextual AI commentary is disabled and has no network calls. Its optional service interface can be added later without changing authoritative report numbers.
