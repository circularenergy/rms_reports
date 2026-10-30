export function batteryContext(data,selectedSite){const sites=(selectedSite==='ALL'?data.sites:data.sites.filter(x=>x.id===selectedSite))||[];
 const sum=k=>sites.reduce((acc,x)=>acc+(Number(x[k])||0),0);
 const days=Number(data.period?.days)||1,count=sites.length||1;
 return {totalHours:sum('totalHours'),totalEnergy:sum('totalEnergy'),totalRuns:sum('fr')+sum('pr'),fullHours:sum('fh'),partialHours:sum('ph'),fullRuns:sum('fr'),partialRuns:sum('pr'),fullEnergy:sum('fe'),partialEnergy:sum('pe'),energyPerSiteDay:sum('totalEnergy')/days/count,hoursPerSiteDay:sum('totalHours')/days/count};}
export function uptimeContext(data,selectedSite){const sites=(selectedSite==='ALL'?data.sites:data.sites.filter(x=>x.siteId===selectedSite))||[];
 const gt=selectedSite==='ALL'?data.grandTotal:null;
 const mean=k=>{const vals=sites.map(x=>x[k]).filter(x=>x!=null&&Number.isFinite(Number(x)));return vals.length?vals.reduce((s,x)=>s+Number(x),0)/vals.length:null;};
 const temps=data.bms?.temperatureSummary?.filter(x=>sites.some(s=>s.siteId===x.siteId)).map(x=>x.avg).filter(x=>x!=null&&Number.isFinite(Number(x)))||[];
 return {ce_sla_uptime_pct:gt?.ce_sla_uptime_pct??mean('ceSlaUptimePct'),site_uptime_pct:gt?.site_uptime_pct??mean('siteUptimePct'),missing_data_rows:gt?.missing_data_rows??sites.reduce((s,x)=>s+(Number(x.missingDataRows)||0),0),site_downtime_hours:gt?.site_downtime_hours??sites.reduce((s,x)=>s+(Number(x.siteDowntimeHours)||0),0),ce_attributable_downtime_hours:gt?.ce_attributable_downtime_hours??sites.reduce((s,x)=>s+(Number(x.ceAttributableDowntimeHours)||0),0),averageTemp:temps.length?temps.reduce((s,x)=>s+Number(x),0)/temps.length:null};}
