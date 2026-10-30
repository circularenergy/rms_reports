/* CE RMS V2.2 — USER EDITABLE DISPLAY CONFIGURATION
   Edit only labels, metric IDs, headings, descriptions, tableTitles and footnotes.
   Allowed metric IDs and their exact API sources are listed BELOW this configuration.
   Never edit SQL formulas. An unknown metric ID shows N/A and a console warning.
   The registry determines numerical units, precision, aggregation and null behavior.
*/
export const dashboardDisplayConfig = {
  overview: {
    title: 'Executive Summary',
    subtitle: "",
    kpis: [
      {label:'CE SLA', metric:'uptime.ceSlaPct', originalMetric:'uptime.ceSlaPct'},
      {label:'Site Uptime', metric:'uptime.siteUptimePct', originalMetric:'uptime.siteUptimePct'},
      {label:'Battery Energy', metric:'energy.battery_energy_throughput_kwh', originalMetric:'energy.battery_energy_throughput_kwh'},
      {label:'Battery Run', metric:'energy.battery_run_hrs_total', originalMetric:'energy.battery_run_hrs_total'},
      {label:'Temp. Aver.', metric:null, originalMetric:null},
    ],
    sectionTitles: [
      'Portfolio Operating Status',
      'Management Attention',
      'Explore Detailed Reports',
      'Management Weekly Reporting Dashboard',
    ],
    sectionDescriptions: {},
    tableTitles: {},
    footnotes: {},
  },
  energy: {
    title: 'Energy Analysis',
    subtitle: "",
    kpis: [
      {label:'Customer Energy', metric:'energy.customer_energy_consumption_kwh', originalMetric:'energy.customer_energy_consumption_kwh'},
      {label:'DG/Grid Energy', metric:'energy.dg_grid_energy_kwh', originalMetric:'energy.dg_grid_energy_kwh'},
      {label:'Solar Contribution', metric:'energy.solar_energy_pct', originalMetric:'energy.solar_energy_pct'},
      {label:'Battery Throughput', metric:'energy.battery_energy_throughput_kwh', originalMetric:'energy.battery_energy_throughput_kwh'},
      {label:'Solar Performance', metric:'energy.solar_performance_80_pct', originalMetric:'energy.solar_performance_80_pct'},
    ],
    sectionTitles: [
      'Runtime Performance of Each Power Source (hrs/day)',
      'Equipment Energy Throughput (kWh/day)',
      'Solar Performance',
      'Battery Run Hours & Cycles Per Day',
      'Energy Source Profile',
      'Monthly Customer Load Profile — 12 Months',
    ],
    sectionDescriptions: {},
    tableTitles: {},
    footnotes: {},
  },
  uptime: {
    title: 'Uptime & Backup SLA',
    subtitle: "",
    kpis: [
      {label:'CE Uptime', metric:'uptime.ceSlaPct', originalMetric:'uptime.ceSlaPct'},
      {label:'Site Uptime', metric:'uptime.siteUptimePct', originalMetric:'uptime.siteUptimePct'},
      {label:'Battery Energy', metric:'battery.energyPerSiteDay', originalMetric:'battery.energyPerSiteDay'},
      {label:'Battery Run', metric:'battery.hoursPerSiteDay', originalMetric:'battery.hoursPerSiteDay'},
      {label:'Temp Aver.', metric:'uptime.averageTemp', originalMetric:'uptime.averageTemp'},
    ],
    sectionTitles: [
      'Uptime SLA',
      'Battery Usage',
      'Battery SLA Cycle Tracking',
      'Battery Usage Contribution Run Duration Distribution',
      'Battery Temperature Monitoring',
      'Battery Temperature Trend',
      'Battery SOC Trend',
      'Battery SOH Trend',
    ],
    sectionDescriptions: {},
    tableTitles: {},
    footnotes: {},
  },
  battery: {
    title: 'Battery Usage',
    subtitle: "",
    kpis: [
      {label:'Total Battery Usage', metric:'battery.totalHours', originalMetric:'battery.totalHours'},
      {label:'Total Battery Energy', metric:'battery.totalEnergy', originalMetric:'battery.totalEnergy'},
      {label:'Total Contribution Runs', metric:'battery.totalRuns', originalMetric:'battery.totalRuns'},
      {label:'Full Battery Usage', metric:'battery.fullHours', originalMetric:'battery.fullHours'},
      {label:'Partial Battery Usage', metric:'battery.partialHours', originalMetric:'battery.partialHours'},
    ],
    sectionTitles: [
      'Portfolio Overview (Grand Total)',
      'Site Performance Summary',
      'Battery SLA Cycle Tracking',
      'Battery Temperature Monitoring',
      'Battery Usage Contribution Run Duration Distribution',
      'Data Quality',
    ],
    sectionDescriptions: {},
    tableTitles: {},
    footnotes: {},
  },
};

/* ========================================================================
   AVAILABLE METRICS — grouped by dashboard/report section for easy copying
   Each metric ID is selectable in ANY page KPI slot. A page loads additional
   APIs only where its configured metric IDs require them.
   ========================================================================

   ENERGY ANALYSIS / ENERGY SOURCE, LOAD & SOLAR
   energy.sanctioned_load_kw                         | kW                 | get_rms_energy_output V1.22: site_summary[].sanctioned_load_kw
   energy.customer_peak_load_kw                      | kW                 | get_rms_energy_output V1.22: site_summary[].customer_peak_load_kw
   energy.customer_average_load_kw                   | kW                 | get_rms_energy_output V1.22: site_summary[].customer_average_load_kw
   energy.backup_sla_hrs                             | h/day              | get_rms_energy_output V1.22: site_summary[].backup_sla_hrs
   energy.dg_hrs                                     | h/day              | get_rms_energy_output V1.22: site_summary[].dg_hrs
   energy.grid_hrs                                   | h/day              | get_rms_energy_output V1.22: site_summary[].grid_hrs
   energy.solar_psh                                  | h                  | get_rms_energy_output V1.22: site_summary[].solar_psh
   energy.battery_cycles                             | cycles/day         | get_rms_energy_output V1.22: site_summary[].battery_cycles
   energy.batt_energy_pct                            | % (API ratio)      | get_rms_energy_output V1.22: site_summary[].batt_energy_pct
   energy.dg_grid_run_hrs                            | h/day              | get_rms_energy_output V1.22: site_summary[].dg_grid_run_hrs
   energy.batt_dod_avg_pct                           | %                  | get_rms_energy_output V1.22: site_summary[].batt_dod_avg_pct
   energy.batt_dod_max_pct                           | %                  | get_rms_energy_output V1.22: site_summary[].batt_dod_max_pct
   energy.batt_dod_min_pct                           | %                  | get_rms_energy_output V1.22: site_summary[].batt_dod_min_pct
   energy.solar_energy_kwh                           | kWh/day            | get_rms_energy_output V1.22: site_summary[].solar_energy_kwh
   energy.solar_energy_pct                           | % (API ratio)      | get_rms_energy_output V1.22: site_summary[].solar_energy_pct
   energy.total_energy_kwh                           | kWh/day            | get_rms_energy_output V1.22: site_summary[].total_energy_kwh
   energy.batt_soh_last_pct                          | %                  | get_rms_energy_output V1.22: site_summary[].batt_soh_last_pct
   energy.dg_grid_energy_kwh                         | kWh/day            | get_rms_energy_output V1.22: site_summary[].dg_grid_energy_kwh
   energy.dg_grid_energy_pct                         | % (API ratio)      | get_rms_energy_output V1.22: site_summary[].dg_grid_energy_pct
   energy.peak_solar_power_kw                        | kW                 | get_rms_energy_output V1.22: site_summary[].peak_solar_power_kw
   energy.batt_soh_present_pct                       | %                  | get_rms_energy_output V1.22: site_summary[].batt_soh_present_pct
   energy.peak_solar_power_pct                       | % (API ratio)      | get_rms_energy_output V1.22: site_summary[].peak_solar_power_pct
   energy.battery_run_hrs_total                      | h/day              | get_rms_energy_output V1.22: site_summary[].battery_run_hrs_total
   energy.solar_avg_per_hour_kwh                     | kWh/day            | get_rms_energy_output V1.22: site_summary[].solar_avg_per_hour_kwh
   energy.batt_bms_cycles_present                    | count / API unit   | get_rms_energy_output V1.22: site_summary[].batt_bms_cycles_present
   energy.battery_run_hrs_prorated                   | h/day              | get_rms_energy_output V1.22: site_summary[].battery_run_hrs_prorated
   energy.customer_energy_consumption_kwh            | kWh/day            | get_rms_energy_output V1.22: site_summary[].customer_energy_consumption_kwh
   energy.solar_performance_80_pct                   | % (API ratio)      | get_rms_energy_output V1.22: site_summary[].solar_performance_80_pct
   energy.solar_designed_capacity_kw                 | kW                 | get_rms_energy_output V1.22: site_summary[].solar_designed_capacity_kw
   energy.battery_energy_throughput_kwh              | kWh/day            | get_rms_energy_output V1.22: site_summary[].battery_energy_throughput_kwh
   energy.solar_availability_per_day_hrs             | h/day              | get_rms_energy_output V1.22: site_summary[].solar_availability_per_day_hrs

   UPTIME & BACKUP SLA / SLA FIELDS
   uptime.ceSlaPct                                   | ceSlaPct           | get_rms_uptime_sla V3.1 (mapped)
   uptime.siteUptimePct                              | siteUptimePct      | get_rms_uptime_sla V3.1 (mapped)
   uptime.missingRows                                | missingRows        | get_rms_uptime_sla V3.1 (mapped)
   uptime.siteDowntime                               | siteDowntime       | get_rms_uptime_sla V3.1 (mapped)
   uptime.ceDowntime                                 | ceDowntime         | get_rms_uptime_sla V3.1 (mapped)
   uptime.averageTemp                                | averageTemp        | get_rms_uptime_sla V3.1 (mapped)

   BATTERY USAGE / HOURS, ENERGY, RUNS
   battery.totalHours                                | totalHours         | get_battery_usage_stretches V3.1 (mapped)
   battery.totalEnergy                               | totalEnergy        | get_battery_usage_stretches V3.1 (mapped)
   battery.totalRuns                                 | totalRuns          | get_battery_usage_stretches V3.1 (mapped)
   battery.fullHours                                 | fullHours          | get_battery_usage_stretches V3.1 (mapped)
   battery.partialHours                              | partialHours       | get_battery_usage_stretches V3.1 (mapped)
   battery.fullRuns                                  | fullRuns           | get_battery_usage_stretches V3.1 (mapped)
   battery.partialRuns                               | partialRuns        | get_battery_usage_stretches V3.1 (mapped)
   battery.fullEnergy                                | fullEnergy         | get_battery_usage_stretches V3.1 (mapped)
   battery.partialEnergy                             | partialEnergy      | get_battery_usage_stretches V3.1 (mapped)
   battery.energyPerSiteDay                          | energyPerSiteDay   | get_battery_usage_stretches V3.1 (mapped)
   battery.hoursPerSiteDay                           | hoursPerSiteDay    | get_battery_usage_stretches V3.1 (mapped)

   Load Profile V1.0 is currently dedicated to the 12-month table, not KPI slots.
   Portfolio percentages must not be interpreted as contract-weighted SLA.
   ======================================================================== */
