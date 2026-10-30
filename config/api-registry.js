import {APP_CONFIG as C} from './app-config.js';
const at=c=>({p_start_at:c.startAt,p_end_at:c.endAt});
const utc=c=>({p_site_id:c.site==='ALL'?null:c.site,p_start_utc:c.startAt,p_end_utc:c.endAt});
// Energy and Health have portfolio request scope; Health needs peer sites for approved solar estimates.
export const API_REGISTRY={
 energy:{label:"Energy Analysis",name:C.api.energy,version:'energy-summary-v1',scope:'ALL',params:at,rows:'site_summary',bounds:'date'},
 uptime:{label:"Uptime & Backup SLA",name:C.api.uptimeSla,version:'uptime-v3',params:utc,rows:'site_summary',bounds:'utc'},
 battery_usage:{label:"Battery usage",name:C.api.batteryUsage,version:'battery-usage-v3',params:utc,rows:'site_summary',bounds:'utc'},
 load_profile:{label:"Customer load",name:C.api.loadProfile,version:'load-profile-v1',params:c=>({...at(c),p_site_id:c.site==='ALL'?null:c.site}),rows:'site_summary',bounds:'date'},
 bms:{label:"Battery BMS Monitoring",name:C.api.bms,version:'2.0.1',params:c=>({...at(c),p_site_ids:c.site==='ALL'?null:[c.site]}),rows:'sites',bounds:'metadata'},
 data_health:{label:"Data Health",name:C.api.dataHealth,version:C.dataHealth.policyVersion,scope:'ALL',params:c=>({...at(c),p_site_ids:null}),rows:'sites',bounds:'metadata'}
};