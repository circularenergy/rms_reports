/* CE_RMS Dashboard GUI V3 | Public browser configuration | 2026-10-24
 * Edit RPC names here only; no credentials except public Supabase anon key.
 * Google provider and backend company-domain authorization must be configured before production rollout.
 */
export const APP_CONFIG = Object.freeze({
 database: {url: "https://aynbticohhzgktonsxud.supabase.co", anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bmJ0aWNvaGh6Z2t0b25zeHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDk4ODAsImV4cCI6MjEwNjAyNTg4MH0.OQVz8xQl5rg5IRfxo35_JN3xBceBOTVLdqCQazbYJko"},
 api: {batteryUsage:'get_battery_usage_stretches_tz',energy:'get_rms_energy_output_tz',loadProfile:'get_rms_load_profile_tz',uptimeSla:'get_rms_uptime_sla_tz',bms:'get_rms_bms_output_v2_tz',dataHealth:'get_rms_data_health_output_tz'},
 reporting: {country:'Nigeria',timezone:'Africa/Lagos',label:'GMT+1',utcOffsetMinutes:60},
 auth: {enabled:true,domain:'thecircularenergy.com'},
 commentary: {mode:'disabled',serviceEndpoint:null},
 version: '4.0.3-integration-candidate', configurationVersion: '20261030-3',
 loading:{maxConcurrentRequests:1,showAfterMs:120},
 cache: {ttlMs:300000,maxEntries:64}, sites:['ABJ-1','ABJ-2','LAG-1','LAG-2'],
 dataHealth: {policyVersion:'1.0.0-five-api-63-fields'}
});
