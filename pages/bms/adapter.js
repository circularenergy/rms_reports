import {installReceiver} from '../../js/host/report-bridge.js';
import {legacyBms} from '../../js/host/bms-compat.js';
import {scopeRows} from '../../js/host/context.js';
const provenance=b=>Object.entries(b.provenance||{}).map(([k,v])=>k+': '+new Date(v.retrievedAt).toLocaleString()+(v.reused?' (reused)':'')).join(' · ');
installReceiver({render(b){const data=structuredClone(b.inputs.bms);data.sites=scopeRows(data.sites,b.context.site);window.CEReport.render({data,range:b.context.start+' — '+b.context.end+' · '+((Date.parse(b.context.endAt)-Date.parse(b.context.startAt))/86400000)+' days',source:provenance(b)+(b.unavailable?.data_health?' · Data Health unavailable':''),mode:b.mode});}});