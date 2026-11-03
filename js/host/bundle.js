import {API_REGISTRY} from '../../config/api-registry.js';
import {rpc} from '../services/rpcClient.js';
import {validateResponse,context} from './context.js';
export async function fetchBundle(page,c,cache,generation,onProgress=()=>{}){
 const inputs={},provenance={},unavailable={};
 const emit=(id,state,extra={})=>{if(cache.active(generation))onProgress({id,state,...extra})};
 for(const id of [...new Set([...page.required,...page.optional])])emit(id,'waiting');
 for(const id of [...new Set([...page.required,...page.optional])]){
 if(!cache.active(generation))return null;
 try{
 if(id==='profiles'){
 const anchor=new Date(c.end+'T12:00:00Z');const months=Array.from({length:12},(_,i)=>{const first=new Date(Date.UTC(anchor.getUTCFullYear(),anchor.getUTCMonth()-11+i,1)),last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0));return {label:first.toLocaleString('en-GB',{month:'short',year:'numeric',timeZone:'UTC'}),start:first.toISOString().slice(0,10),end:last.toISOString().slice(0,10)}});
 const def=API_REGISTRY.load_profile,result=[],evidence=[];
 for(let index=0;index<months.length;index++){
 if(!cache.active(generation))return null;
 const m=months[index],mc=context(m.start,m.end,c.site,c.identity,c.policy);
 const hit=await cache.get(cache.key('load_profile',def,mc),async signal=>validateResponse(await rpc(def.name,def.params(mc),{signal,onStart:()=>emit(id,'loading',{completed:index,total:12})}),def,mc));
 result.push({...m,sites:hit.data.site_summary});evidence.push({retrievedAt:hit.retrievedAt,elapsedMs:hit.elapsedMs,reused:hit.reused,startAt:mc.startAt,endAt:mc.endAt});emit(id,hit.reused?'reused':'loading',{completed:index+1,total:12});}
 inputs.profiles=result;provenance.profiles={retrievedAt:Math.min(...evidence.map(x=>x.retrievedAt)),reused:evidence.every(x=>x.reused),months:evidence,api:def.name};emit(id,'complete',{reused:provenance.profiles.reused});continue;
 }
 const def=API_REGISTRY[id];if(!def)throw Error('Unknown registered API '+id);
 const request={...c,site:def.scope||c.site};
 const hit=await cache.get(cache.key(id,def,c),async signal=>validateResponse(await rpc(def.name,def.params(request),{signal,onStart:()=>emit(id,'loading')}),def,request));
 if(!cache.active(generation))return null;
 inputs[id]=hit.data;provenance[id]={retrievedAt:hit.retrievedAt,elapsedMs:hit.elapsedMs,reused:hit.reused,api:def.name,version:hit.data.metadata?.version||hit.data.api_version||null,requestScope:request.site};emit(id,'complete',{reused:hit.reused});
 }catch(e){if(!cache.active(generation))return null;emit(id,'failed');if(page.required.includes(id))throw e;unavailable[id]=e.message;}
 }
 if(!cache.active(generation))return null;
 return {context:{...c,identity:undefined},inputs,provenance,unavailable,generation,mode:'live',contract:'ce-rms-report-v1'};
}
