// Semantic adapter from BMS V2; never call legacy BMS or derive counter usage again.
export function legacyBms(v2){
 const site_summary=[],batteries_by_site=[];
 for(const s of v2.sites){const policies=s.policies||[],rates=[...new Set(policies.map(p=>p.sample_seconds).filter(x=>typeof x==='number'&&x>0))];
 const row={site_id:s.site_id,module_count:s.installed_batteries,reporting_slots:s.reporting_battery_slots,sample_seconds:rates.length===1?rates[0]:null,soc_low:s.summary?.soc?.low?.occurrences,soh_low:s.summary?.soh?.low_occurrences};
 for(let n=1;n<=4;n++)row['l'+n+'_h']=s.summary?.temperature?.['L'+n]?.measured_battery_hours??null;
 site_summary.push(row);
 for(const b of s.batteries||[]){const r={site_id:s.site_id,slot:b.slot,reporting:b.bms_reporting,cycle_last:b.cycles?.last??null,cycle_delta:b.cycles?.used??null,cycle_reset:b.cycles?.reset_detected,temp_max:b.metrics?.temperature?.max??null};for(let n=1;n<=4;n++)r['l'+n+'_h']=b.temperature?.['L'+n]?.measured_hours??null;batteries_by_site.push(r);}}
 return {metadata:v2.metadata,site_summary,batteries_by_site};
}
