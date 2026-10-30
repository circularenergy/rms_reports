import {render} from '../../components/uptimeBackupPage.js';
import {mapUptimeSlaApi} from '../../services/uptimeSlaMapper.js';
import {mapBatteryUsageApi} from '../../services/batteryUsageMapper.js';
import {applyDisplay} from '../../config/displayController.js';
import {batteryContext,uptimeContext} from './display-context.js';
export function mount(bundle){const c=bundle.context,days=(Date.parse(c.endAt)-Date.parse(c.startAt))/86400000,period={days,startDate:c.start,endDateExclusive:c.endExclusive};const uptime={period,...mapUptimeSlaApi(bundle.inputs.uptime)},battery={period,...mapBatteryUsageApi(bundle.inputs.battery_usage,{days})};render({uptime,battery},c.site);applyDisplay('uptime',{uptime:uptimeContext(uptime,c.site),battery:batteryContext(battery,c.site),energy:{sites:(bundle.inputs.energy?.site_summary||[]).filter(s=>c.site==='ALL'||s.site_id===c.site)}});}
