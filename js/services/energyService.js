/* CE_RMS V3 | _tz Energy and monthly Load Profile RPCs; never alter numerical mappers. */
import {mapEnergy} from './energyMapper.js';
import {getUptimeSlaData} from './uptimeSlaService.js';
import {rpc,apiWindow,localDateToInstant} from './rpcClient.js';
import {APP_CONFIG as CFG} from '../../config/app-config.js';
import {addDays} from '../utils/dates.js';
export async function getEnergy(startDate,endDate){return mapEnergy(await rpc(CFG.api.energy,apiWindow(startDate,addDays(endDate,1))));}
export async function getProfile(startDate,endDate,siteId=null){const result=await rpc(CFG.api.loadProfile,{...apiWindow(startDate,addDays(endDate,1)),p_site_id:siteId});return Array.isArray(result.site_summary)?result.site_summary:[];}
export async function getExecutiveUptime(params){return getUptimeSlaData(params);}
