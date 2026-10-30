/* CE RMS V2.1 (2026-10-12): Energy Analysis mockup-aligned axes, two-line labels and combination charts. API calculations remain in SQL. */
import {n,fmt,pct,esc} from '../services/energyMapper.js?v=2.0';
const colors=['#7654A3','#18975C','#F59E0B'];
function section(title,body){return `<section class="section v2-section"><div class="sh"><h2>${title}</h2></div><div class="body">${body}</div></section>`}
// V2.1 (2026-10-12): Mockup-aligned SVG plots. Data values are direct Energy V1.22 outputs; display scaling only.
const BLUE='#438ac5', GREEN='#18975C', YELLOW='#F59E0B', RED='#d34b4b', LIME='#9dbd5c';
const xml=esc;
function plot(sites,{series=[],yMax=null,yTitle='',rightMax=null,rightTitle='',xLines=null,stacked=false,percent=false}){
  const W=610,H=315,L=57,R=rightMax===null?16:53,T=25,B=xLines?73:56;
  const pw=W-L-R,ph=H-T-B,base=T+ph;
  const vals=sites.flatMap(s=>series.filter(a=>a.kind!=='line').map(a=>(n(s[a.key])??0)*(a.percent?100:1)));
  const max=yMax??Math.max(1,Math.ceil(Math.max(0,...vals)*1.13/5)*5);
  const x=i=>L+pw*(i+.5)/Math.max(1,sites.length);
  const y=v=>base-Math.max(0,v)/max*ph;
  let out=`<svg class="v21-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${xml(yTitle)} chart">`;
  for(let i=0;i<=5;i++){const v=max*i/5,yy=y(v);out+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="#e4e9ed"/><text x="${L-8}" y="${yy+4}" text-anchor="end" class="v21-tick">${percent?Math.round(v)+'%':Number(v.toFixed(1)).toLocaleString()}</text>`;}
  out+=`<text x="16" y="${T+ph/2}" text-anchor="middle" transform="rotate(-90 16 ${T+ph/2})" class="v21-axis">${xml(yTitle)}</text>`;
  if(rightMax!==null){for(let i=0;i<=5;i++){const v=rightMax*i/5,yy=base-v/rightMax*ph;out+=`<text x="${W-R+7}" y="${yy+4}" class="v21-tick">${v.toFixed(1)}</text>`;}out+=`<text x="${W-8}" y="${T+ph/2}" text-anchor="middle" transform="rotate(90 ${W-8} ${T+ph/2})" class="v21-axis">${xml(rightTitle)}</text>`;}
  const bars=series.filter(a=>a.kind!=='line'),lines=series.filter(a=>a.kind==='line');
  const slot=pw/Math.max(1,sites.length),barWidth=Math.min(stacked?54:34,slot*.67/Math.max(1,stacked?1:bars.length));
  sites.forEach((s,i)=>{
    let accum=0;
    bars.forEach((a,j)=>{
      const raw=n(s[a.key]);if(raw===null)return;
      const v=Math.max(0,raw*(a.percent?100:1));
      const top=stacked?y(accum+v):y(v),height=Math.max(0,v/max*ph);
      const xx=stacked?x(i)-barWidth/2:x(i)+(j-(bars.length-1)/2)*barWidth-barWidth*.45;
      out+=`<rect x="${xx}" y="${top}" width="${stacked?barWidth:barWidth*.9}" height="${height}" fill="${a.color}"><title>${xml(a.label)}: ${xml(a.percent?fmt(raw*100,1)+'%':fmt(raw,2))}</title></rect>`;
      const label=a.percent?fmt(raw*100,0)+'%':fmt(raw,1);
      if(stacked){if(height>18)out+=`<text x="${x(i)}" y="${top+height/2+4}" text-anchor="middle" class="v21-value">${xml(label)}</text>`;else if(v===0)out+=`<text x="${x(i)}" y="${top-4}" text-anchor="middle" class="v21-value">0%</text>`;}
      else if(height>6)out+=`<text x="${xx+barWidth*.45}" y="${top-5}" text-anchor="middle" class="v21-value">${xml(label)}</text>`;
      if(stacked)accum+=v;
    });
    const labels=xLines?xLines(s):[s.site_id];labels.forEach((line,j)=>out+=`<text x="${x(i)}" y="${base+19+j*17}" text-anchor="middle" class="v21-x">${xml(line)}</text>`);
  });
  lines.forEach(a=>{
    const pts=sites.map((s,i)=>({i,v:n(s[a.key])})).filter(p=>p.v!==null);
    out+=`<polyline fill="none" stroke="${a.color}" stroke-width="2.7" points="${pts.map(p=>`${x(p.i)},${base-Math.max(0,p.v)/rightMax*ph}`).join(' ')}"/>`;
    pts.forEach(p=>{const yy=base-Math.max(0,p.v)/rightMax*ph;out+=`<circle cx="${x(p.i)}" cy="${yy}" r="3.5" fill="${a.color}"/><text x="${x(p.i)}" y="${yy-9}" text-anchor="middle" class="v21-value">${fmt(p.v,2)}</text>`;});
  });
  out+='</svg>';
  return `<div class="v21-chart">${out}<div class="v2-legend">${series.map(a=>`<span><i style="background:${a.color}"></i>${xml(a.label)}</span>`).join('')}</div></div>`;
}
const grouped=(sites,defs,yTitle)=>plot(sites,{series:defs.map(([key,label,color])=>({key,label,color})),yTitle});
const solarChart=sites=>plot(sites,{series:[{key:'solar_performance_80_pct',label:'Solar Efficiency',color:LIME,percent:true},{key:'solar_psh',label:'Peak Sun Hours (PSH)',color:RED,kind:'line'}],yMax:100,percent:true,yTitle:'Efficiency',rightMax:5,rightTitle:'PSH',xLines:s=>[`${fmt(s.solar_energy_kwh,0)} kWh`,s.site_id]});
const mix=sites=>plot(sites,{series:[{key:'dg_grid_energy_pct',label:'DG/Grid Energy Production',color:BLUE,percent:true},{key:'solar_energy_pct',label:'Solar Energy Production',color:GREEN,percent:true}],yMax:100,percent:true,stacked:true,yTitle:'% of Total Energy',xLines:s=>[`${fmt(s.total_energy_kwh,0)} kWh`,s.site_id]});
const batteryChart=sites=>plot(sites,{series:[{key:'battery_run_hrs_total',label:'Battery Run Hours',color:YELLOW},{key:'battery_cycles',label:'Battery Cycles per Day',color:RED,kind:'line'}],yTitle:'Runtime Hours',rightMax:2,rightTitle:'Battery Cycles'});
function profileTable(rows,sites){const ids=sites.map(s=>s.site_id);const keys=[...new Set([...ids,...rows.flatMap(r=>r.sites.map(s=>s.site_id))])].sort();return `<div class="scroll"><table class="v2-table"><thead><tr><th rowspan="2">Month</th>${keys.map(s=>`<th colspan="2">${esc(s)}</th>`).join('')}</tr><tr>${keys.map(()=>'<th>Average kW</th><th>Peak kW</th>').join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.label)}</td>${keys.map(id=>{let s=r.sites.find(x=>x.site_id===id);return `<td>${fmt(s?.customer_average_load_kw,2)}</td><td>${fmt(s?.customer_peak_load_kw,2)}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>`}
export function renderEnergy({sites,profile,period}){const el=document.getElementById('app');const sum=k=>sites.reduce((a,s)=>a+(n(s[k])??0),0);const ratio=(a,b)=>b>0?a/b:null;const kpis=[['Customer Energy',fmt(sum('customer_energy_consumption_kwh'),1)+' kWh/day'],['DG/Grid Energy',fmt(sum('dg_grid_energy_kwh'),1)+' kWh/day'],['Solar Contribution',pct(ratio(sum('solar_energy_kwh'),sum('solar_energy_kwh')+sum('dg_grid_energy_kwh')))],['Battery Throughput',fmt(sum('battery_energy_throughput_kwh'),1)+' kWh/day'],['Solar Performance',pct(ratio(sites.filter(s=>String(s.site_topology||'').split('+').includes('S')).reduce((a,s)=>a+(n(s.solar_energy_kwh)??0),0),sites.filter(s=>String(s.site_topology||'').split('+').includes('S')).reduce((a,s)=>a+(n(s.solar_designed_capacity_kw)??0)*.8*(n(s.site_psh)??0),0)))]];el.innerHTML=`<div class="v2-page"><div class="v2-kpis">${kpis.map(([l,v],i)=>`<div class="v2-kpi v2-k${i}"><small>${l}</small><b>${v}</b></div>`).join('<span class="v2-arrow">➜</span>')}</div><div class="v2-chart-grid">${section('Runtime Performance of Each Power Source (hrs/day)',grouped(sites,[['dg_grid_run_hrs','DG/Grid Run Hours',colors[0]],['solar_availability_per_day_hrs','Solar Availability per Day',colors[1]],['battery_run_hrs_total','Battery Run Hours',colors[2]]],'Runtime Hours'))}${section('Equipment Energy Throughput (kWh/day)',grouped(sites,[['dg_grid_energy_kwh','DG/Grid Energy Production',colors[0]],['solar_energy_kwh','Solar Energy Production',colors[1]],['battery_energy_throughput_kwh','Battery Energy Throughput',colors[2]]],'kWh'))}${section('Solar Performance',solarChart(sites))}${section('Battery Run Hours & Cycles Per Day',batteryChart(sites))}${section('Energy Source Profile',mix(sites))}</div>${section('Monthly Customer Load Profile — 12 Months',profileTable(profile,sites))}<p class="v2-note">Reporting period: ${esc(period)}. Energy and runtime metrics follow API V1.22 per-day definitions; missing readings display N/A. The 12-month load profile is calculated by the Load Profile _tz V1.1 SQL API.</p></div>`}
