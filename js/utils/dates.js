/* CE_RMS V3 date helpers. Dates are Nigeria-local calendar labels, not browser timezone instants. */
export const dateISO=d=>d.toISOString().slice(0,10);
export const addDays=(iso,days)=>{const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return dateISO(d);};
export function lagosToday(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${v.year}-${v.month}-${v.day}`;}
export const displayDate=iso=>iso?`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(iso.slice(5,7))-1]}/${iso.slice(8,10)}/${iso.slice(0,4)}`:'';
