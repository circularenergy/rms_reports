import {dependencies} from '../js/config/displayController.js';
const needs=(page,base)=>[...new Set([...base,...dependencies(page).map(x=>x==='battery'?'battery_usage':x)])];
export const PAGE_REGISTRY={
 overview:{label:'Executive Dashboard',hash:'#overview',frame:'pages/executive/index.html',required:['energy','uptime','battery_usage','load_profile','bms'],optional:['data_health']},
 uptime:{label:'Uptime & Backup SLA',hash:'#uptime-sla',module:'./retained/uptime.js',required:needs('uptime',['uptime','battery_usage']),optional:['data_health']},
 energy:{label:'Energy Analysis',hash:'#energy-analysis',module:'./retained/energy.js',required:needs('energy',['energy','profiles']),optional:['data_health']},
 bms:{label:'Battery BMS Monitoring',hash:'#bms',frame:'pages/bms/index.html',required:['bms'],optional:['data_health']},
 health:{label:'Data Health',hash:'#data-health',frame:'pages/data-health/index.html',required:['data_health','energy','bms'],optional:[]}
};