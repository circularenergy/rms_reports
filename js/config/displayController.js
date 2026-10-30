/* CE RMS V2.2 — display settings apply only after original page render. */
import {dashboardDisplayConfig as CONFIG} from '../../config/dashboard-display-config.js?v=2.2';
import {METRICS,resolveMetric,formatMetric,sourceOf} from './metricRegistry.js?v=2.2';
export function dependencies(page){return [...new Set((CONFIG[page]?.kpis||[]).map(k=>sourceOf(k.metric)).filter(Boolean))];}
export function applyDisplay(page,ctx={}){
 const cfg=CONFIG[page];if(!cfg)return;
 const body=document.getElementById('app');if(!body)return;
 const kpis=body.querySelectorAll(page==='uptime'?'.combined-page-kpis .combined-kpi':page==='energy'||page==='overview'?'.v2-kpis .v2-kpi':'.kpis.five .kpi');
 kpis.forEach((el,i)=>{const spec=cfg.kpis?.[i];if(!spec)return;
 const title=el.querySelector(page==='uptime'?'span':page==='energy'||page==='overview'?'small':'.l');if(title&&typeof spec.label==='string')title.textContent=spec.label;
 if(!spec.metric || spec.metric===spec.originalMetric)return; if(!METRICS[spec.metric]){console.warn('CE RMS V2.2 invalid configured metric',spec.metric);return;}
 const result=resolveMetric(spec.metric,ctx),val=el.querySelector(page==='uptime'||page==='energy'||page==='overview'?'b':'.v');if(val)val.textContent=formatMetric(result);
 });
 body.querySelectorAll('.section').forEach((el,i)=>{let title=cfg.sectionTitles?.[i];const head=el.querySelector('.sh h2,.sh');if(head&&typeof title==='string'&&title)head.textContent=title;
 const description=cfg.sectionDescriptions?.[i];if(typeof description==='string'){const dest=el.querySelector('.sub,.section-subtitle,.desc');if(dest)dest.textContent=description;}
 });
 for(const [sel,t] of Object.entries(cfg.tableTitles||{})){try{const node=body.querySelector(sel);if(node)node.textContent=t;}catch(e){console.warn('Invalid tableTitle selector',sel);}}
 for(const [sel,t] of Object.entries(cfg.footnotes||{})){try{const node=body.querySelector(sel);if(node)node.textContent=t;}catch(e){console.warn('Invalid footnote selector',sel);}}
 // Table-only zero display rule: do not mutate source data, graphs, or KPI values.
 body.querySelectorAll('table tbody td,table tfoot td').forEach(cell=>{if(cell.children.length)return;const raw=cell.textContent.trim();if(/^(?:[+-]?0+(?:\.0+)?)(?:\s*(?:h|kWh|%|°C))?$/.test(raw))cell.textContent='–';});
}
