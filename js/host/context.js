export const addDays=(day,n)=>{const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
export function context(start,end,site='ALL',identity='anonymous',policy='1'){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||start>end)throw Error('Select a valid start and end date.');
 const exclusive=addDays(end,1);return Object.freeze({start,end,endExclusive:exclusive,startAt:start+'T00:00:00+01:00',endAt:exclusive+'T00:00:00+01:00',site,identity,policy,timezone:'Africa/Lagos'});
}
export function validateResponse(data,definition,c){
 if(!data||typeof data!=='object'||!Array.isArray(data[definition.rows]))throw Error(definition.name+': invalid response schema');
 const m=definition.bounds==='metadata'?data.metadata:data.filters;
 const a=definition.bounds==='metadata'?m?.start_at:definition.bounds==='utc'?m?.start_utc:m?.start_date;
 const b=definition.bounds==='metadata'?m?.end_at_exclusive:definition.bounds==='utc'?m?.end_utc:m?.end_date;
 if(Date.parse(a)!==Date.parse(c.startAt)||Date.parse(b)!==Date.parse(c.endAt))throw Error(definition.name+': response period mismatch; figures blocked.');
 if(definition.bounds==='metadata'&&data.metadata.api!==definition.name)throw Error('API identity mismatch');
 if(c.site!=='ALL'&&definition.scope!=='ALL'&&data[definition.rows].some(s=>(s.site_id??s.site)!==c.site))throw Error(definition.name+': response site mismatch');
 return data;
}
export const scopeRows=(rows,site)=>rows.filter(r=>site==='ALL'||(r.site_id??r.site??r.siteId)===site);
