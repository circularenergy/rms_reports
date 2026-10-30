/* CE_RMS V3 | _tz Battery Usage RPC; preserve V2.2 mapping and calculations. */
import {mapBatteryUsageApi} from './batteryUsageMapper.js';
import {rpc,localDateToInstant} from './rpcClient.js';
import {APP_CONFIG as CFG} from '../../config/app-config.js';
export async function getBatteryUsageData({siteId=null,startDate,endDateExclusive}){
 const api=await rpc(CFG.api.batteryUsage,{p_site_id:siteId,p_start_utc:localDateToInstant(startDate),p_end_utc:localDateToInstant(endDateExclusive)});
 const start=new Date(startDate+'T12:00:00Z'),end=new Date(endDateExclusive+'T12:00:00Z');
 const days=Math.max(1,Math.round((end-start)/86400000));
 return {period:{days,startDate,endDateExclusive},...mapBatteryUsageApi(api,{days})};
}
