import {renderEnergy} from '../../components/energyAnalysisPage.js';
import {scopeRows} from '../context.js';
import {applyDisplay} from '../../config/displayController.js';
import {mapUptimeSlaApi} from '../../services/uptimeSlaMapper.js';
import {mapBatteryUsageApi} from '../../services/batteryUsageMapper.js';
import {batteryContext,uptimeContext} from './display-context.js';
export function mount(b){renderEnergy({sites:scopeRows(b.inputs.energy.site_summary,b.context.site),profile:b.inputs.profiles,period:b.context.start+' to '+b.context.end});const days=(Date.parse(b.context.endAt)-Date.parse(b.context.startAt))/86400000;applyDisplay('energy',{energy:{sites:scopeRows(b.inputs.energy.site_summary,b.context.site)},uptime:b.inputs.uptime?uptimeContext(mapUptimeSlaApi(b.inputs.uptime),b.context.site):{},battery:b.inputs.battery_usage?batteryContext({period:{days},...mapBatteryUsageApi(b.inputs.battery_usage,{days})},b.context.site):{}});}
