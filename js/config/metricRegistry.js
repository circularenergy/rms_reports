/* CE RMS V2.2 — protected metric registry. API computations remain authoritative.
   Registry keys, source fields, scope and units MUST NOT be edited by dashboard users. */
export const METRICS = {
  "energy.sanctioned_load_kw": {source:"energy", field:"sanctioned_load_kw", unit:"kW", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.customer_peak_load_kw": {source:"energy", field:"customer_peak_load_kw", unit:"kW", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.customer_average_load_kw": {source:"energy", field:"customer_average_load_kw", unit:"kW", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.backup_sla_hrs": {source:"energy", field:"backup_sla_hrs", unit:"h/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.dg_hrs": {source:"energy", field:"dg_hrs", unit:"h/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.grid_hrs": {source:"energy", field:"grid_hrs", unit:"h/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.solar_psh": {source:"energy", field:"solar_psh", unit:"h", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.battery_cycles": {source:"energy", field:"battery_cycles", unit:"cycles/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.batt_energy_pct": {source:"energy", field:"batt_energy_pct", unit:"% (API ratio)", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.dg_grid_run_hrs": {source:"energy", field:"dg_grid_run_hrs", unit:"h/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.batt_dod_avg_pct": {source:"energy", field:"batt_dod_avg_pct", unit:"%", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.batt_dod_max_pct": {source:"energy", field:"batt_dod_max_pct", unit:"%", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.batt_dod_min_pct": {source:"energy", field:"batt_dod_min_pct", unit:"%", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.solar_energy_kwh": {source:"energy", field:"solar_energy_kwh", unit:"kWh/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.solar_energy_pct": {source:"energy", field:"solar_energy_pct", unit:"% (API ratio)", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.total_energy_kwh": {source:"energy", field:"total_energy_kwh", unit:"kWh/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.batt_soh_last_pct": {source:"energy", field:"batt_soh_last_pct", unit:"%", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.dg_grid_energy_kwh": {source:"energy", field:"dg_grid_energy_kwh", unit:"kWh/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.dg_grid_energy_pct": {source:"energy", field:"dg_grid_energy_pct", unit:"% (API ratio)", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.peak_solar_power_kw": {source:"energy", field:"peak_solar_power_kw", unit:"kW", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.batt_soh_present_pct": {source:"energy", field:"batt_soh_present_pct", unit:"%", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.peak_solar_power_pct": {source:"energy", field:"peak_solar_power_pct", unit:"% (API ratio)", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.battery_run_hrs_total": {source:"energy", field:"battery_run_hrs_total", unit:"h/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.solar_avg_per_hour_kwh": {source:"energy", field:"solar_avg_per_hour_kwh", unit:"kWh/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.batt_bms_cycles_present": {source:"energy", field:"batt_bms_cycles_present", unit:"count / API unit", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.battery_run_hrs_prorated": {source:"energy", field:"battery_run_hrs_prorated", unit:"h/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.customer_energy_consumption_kwh": {source:"energy", field:"customer_energy_consumption_kwh", unit:"kWh/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.solar_performance_80_pct": {source:"energy", field:"solar_performance_80_pct", unit:"% (API ratio)", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.solar_designed_capacity_kw": {source:"energy", field:"solar_designed_capacity_kw", unit:"kW", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.battery_energy_throughput_kwh": {source:"energy", field:"battery_energy_throughput_kwh", unit:"kWh/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "energy.solar_availability_per_day_hrs": {source:"energy", field:"solar_availability_per_day_hrs", unit:"h/day", kind:"energy", aggregation:"sum-or-API-ratio"},
  "uptime.ceSlaPct": {source:"uptime", field:"ce_sla_uptime_pct", unit:"%", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "uptime.siteUptimePct": {source:"uptime", field:"site_uptime_pct", unit:"%", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "uptime.missingRows": {source:"uptime", field:"missing_data_rows", unit:"records", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "uptime.siteDowntime": {source:"uptime", field:"site_downtime_hours", unit:"h", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "uptime.ceDowntime": {source:"uptime", field:"ce_attributable_downtime_hours", unit:"h", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.totalHours": {source:"battery", field:"totalHours", unit:"h", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.totalEnergy": {source:"battery", field:"totalEnergy", unit:"kWh", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.totalRuns": {source:"battery", field:"totalRuns", unit:"runs", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.fullHours": {source:"battery", field:"fullHours", unit:"h", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.partialHours": {source:"battery", field:"partialHours", unit:"h", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.fullRuns": {source:"battery", field:"fullRuns", unit:"runs", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.partialRuns": {source:"battery", field:"partialRuns", unit:"runs", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.fullEnergy": {source:"battery", field:"fullEnergy", unit:"kWh", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.partialEnergy": {source:"battery", field:"partialEnergy", unit:"kWh", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.energyPerSiteDay": {source:"battery", field:"energyPerSiteDay", unit:"kWh/day", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "battery.hoursPerSiteDay": {source:"battery", field:"hoursPerSiteDay", unit:"h/day", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
  "uptime.averageTemp": {source:"uptime", field:"averageTemp", unit:"°C", kind:"aggregate", aggregation:"existing V2.1 display semantics"},
};
export function sourceOf(id){return METRICS[id]?.source || null;}
export function resolveMetric(id,ctx={}){const m=METRICS[id];if(!m)return null;
 if(m.source==='energy'){const sites=ctx.energy?.sites;if(!sites)return null;const vals=sites.map(s=>s[m.field]).filter(v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))).map(Number);if(!vals.length)return null;
 if(m.unit.includes('API ratio')){
 const sum=k=>sites.reduce((a,s)=>a+(Number(s[k])||0),0);
 const total=sum('solar_energy_kwh')+sum('dg_grid_energy_kwh');
 const num=m.field==='solar_energy_pct'?sum('solar_energy_kwh'):m.field==='dg_grid_energy_pct'?sum('dg_grid_energy_kwh'):m.field==='batt_energy_pct'?sum('battery_energy_throughput_kwh'):m.field==='solar_performance_80_pct'?sites.filter(s=>String(s.site_topology||'').split('+').includes('S')).reduce((a,s)=>a+(Number(s.solar_energy_kwh)||0),0):null;
 const den=m.field==='solar_performance_80_pct'?sites.filter(s=>String(s.site_topology||'').split('+').includes('S')).reduce((a,s)=>a+(Number(s.solar_designed_capacity_kw)||0)*.8*(Number(s.site_psh)||0),0):total;
 if(num!==null)return den>0?{value:num/den*100,unit:'%',digits:1}:null;
 return {value:vals.reduce((a,b)=>a+b,0)/vals.length*100,unit:'%',digits:1};}
 return {value:vals.reduce((a,b)=>a+b,0),unit:m.unit,digits:1};}
 const v=ctx[m.source]?.[m.field];return v===null||v===undefined||!Number.isFinite(Number(v))?null:{value:Number(v),unit:m.unit,digits:m.unit==='runs'||m.unit==='records'?0:2};
}
export function formatMetric(metric){if(!metric)return 'N/A';return metric.value.toLocaleString('en-GB',{minimumFractionDigits:metric.digits,maximumFractionDigits:metric.digits})+(metric.unit?' '+metric.unit:'');}
