import {APP_CONFIG as CFG} from '../config/app-config.js';
import {API_REGISTRY} from '../config/api-registry.js';
import {PAGE_REGISTRY as PAGES} from '../config/page-registry.js';
import {verifiedUser,recoverAuthSession,signInGoogle,clearAuthToken} from './services/rpcClient.js';
import {displayDate} from './utils/dates.js';
import {ReportCache} from './host/cache.js';
import {context} from './host/context.js';
import {fetchBundle} from './host/bundle.js';
import {mountFrame,disposeFrame} from './host/frame.js';
import {LoadingPanel} from './host/loading-panel.js';
const loadingPanel=new LoadingPanel();
const cache=new ReportCache(CFG.cache),site=document.getElementById('site'),startDate=document.getElementById('startDate'),endDate=document.getElementById('endDate'),refresh=document.getElementById('refresh'),app=document.getElementById('app');
const centralPage={label:'Dashboard data',required:[],optional:[...new Set(Object.values(PAGES).flatMap(p=>[...p.required,...p.optional]))]};
let freshnessTimer;
let userAllowed=false,userIdentity='',currentPage=Object.keys(PAGES).find(k=>PAGES[k].hash===location.hash)||'overview';
const NIGERIA_TZ='Africa/Lagos';
function lagosToday(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:NIGERIA_TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${v.year}-${v.month}-${v.day}`;}
const dateISO=d=>d.toISOString().slice(0,10);
const addDays=(iso,days)=>{const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return dateISO(d);};
function isoWeekStart(iso){const d=new Date(`${iso}T12:00:00Z`);const dow=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-dow+1);return dateISO(d);}
function isoWeekLabel(start){const d=new Date(`${start}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+3);const year=d.getUTCFullYear();const jan4=new Date(Date.UTC(year,0,4,12));jan4.setUTCDate(jan4.getUTCDate()-(jan4.getUTCDay()||7)+1);return `${year}-W${String(1+Math.round((d-jan4)/604800000)).padStart(2,'0')}`;}
function updateCalendarLabel(){
 const viewStart=document.getElementById('startDateView'),viewEnd=document.getElementById('endDateView');
 if(viewStart)viewStart.value=displayDate(startDate.value);if(viewEnd)viewEnd.value=displayDate(endDate.value);
 const label=document.getElementById('weekQuick');if(label)label.textContent=`Week ${isoWeekLabel(startDate.value||lagosToday())}`;}
function pickRange(start,end){startDate.value=start;endDate.value=end;updateCalendarLabel();load();}
function initDateShortcuts(){const today=lagosToday();startDate.value=today.slice(0,7)+'-01';endDate.value=today;
 const previous=addDays(today.slice(0,7)+'-01',-1);const lastWeek=addDays(isoWeekStart(today),-7);
 const dropdown=document.getElementById('weekSelect');if(dropdown){let monday=isoWeekStart(today);for(let i=0;i<105;i++){let begin=addDays(monday,-i*7);const opt=document.createElement('option');opt.value=begin;opt.textContent=`${isoWeekLabel(begin)} (${begin} — ${addDays(begin,6)})`;dropdown.add(opt);}dropdown.value=lastWeek;dropdown.onchange=()=>pickRange(dropdown.value,addDays(dropdown.value,6));}
 [['startDateView',startDate],['endDateView',endDate]].forEach(([id,native])=>{const control=document.getElementById(id);if(control)control.onclick=()=>{if(native.showPicker)native.showPicker();else native.focus();};});
 document.querySelectorAll('[data-date-preset]').forEach(btn=>btn.onclick=()=>{switch(btn.dataset.datePreset){case 'yesterday':{const day=addDays(lagosToday(),-1);pickRange(day,day);break;}case 'mtd':{const d=lagosToday();pickRange(d.slice(0,7)+'-01',d);break;}case 'lastmonth':{const d=addDays(lagosToday().slice(0,7)+'-01',-1);pickRange(d.slice(0,7)+'-01',d);break;}case 'week':{const start=addDays(isoWeekStart(lagosToday()),-7);pickRange(start,addDays(start,6));if(dropdown)dropdown.value=start;break;}}});updateCalendarLabel();}


function clearReport(){disposeFrame();clearTimeout(freshnessTimer);document.getElementById('reportProvenance').textContent='Data: preparing selected report';app.replaceChildren();document.getElementById('modal').replaceChildren();document.getElementById('healthHeader').textContent='Data Health: awaiting current report';}
function pending(text){const p=document.createElement('div');p.className='v3-report-pending';p.role='status';p.textContent=text;app.append(p);}
function updateShell(){document.getElementById('executiveContext').hidden=currentPage!=='overview';const page=PAGES[currentPage];document.querySelectorAll('nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage));document.getElementById('pageSubtitle').textContent=page.label;document.getElementById('pageTitle').textContent=page.label;document.getElementById('pageDescription').textContent='';document.getElementById('pageIntro').hidden=false;document.body.classList.toggle('v4-frame-page',Boolean(page.frame));}
export async function load({force=false}={}){
 loadingPanel.finish(loadingPanel.generation);const generation=cache.activate({refresh:force});clearReport();updateShell();document.getElementById('error').hidden=true;
 if(!userAllowed)return;
 refresh.disabled=true;refresh.textContent='Refreshing…';
 try{const c=context(startDate.value,endDate.value,site.value,userIdentity,CFG.configurationVersion+'|'+CFG.dataHealth.policyVersion);const page=PAGES[currentPage];loadingPanel.start(centralPage,generation,CFG.loading?.showAfterMs??120);pending('Loading '+page.label+' · '+c.start+' to '+c.end+' · '+(c.site==='ALL'?'All Sites':c.site));
 const bundle=await fetchBundle(centralPage,c,cache,generation,event=>loadingPanel.update(event,generation));if(!bundle||!cache.active(generation))return;
 for(const id of page.required)if(!bundle.inputs[id])throw Error((API_REGISTRY[id]?.label||id)+': '+(bundle.unavailable[id]||'Required data unavailable'));
 const provenance=Object.entries(bundle.provenance).map(([k,v])=>(API_REGISTRY[k]?.label||(k==='profiles'?'Monthly energy profile':k))+': '+new Date(v.retrievedAt).toLocaleString()+(v.reused?' (reused)':''));
 const status=document.getElementById('reportProvenance'),oldest=Math.min(...Object.values(bundle.provenance).map(v=>v.retrievedAt));
 status.textContent='Data current · '+c.start+' — '+c.end+' · '+(c.site==='ALL'?'All Sites':c.site)+' · Retrieved '+new Date(oldest).toLocaleString()+' · Reuse up to '+Math.round(CFG.cache.ttlMs/60000)+' min';status.title=provenance.join(' · ');
 freshnessTimer=setTimeout(()=>{if(cache.active(generation))load();},Math.max(1,oldest+CFG.cache.ttlMs-Date.now()));
 const health=bundle.inputs.data_health;document.getElementById('healthHeader').textContent=health?'Data Health: '+health.sites.filter(s=>c.site==='ALL'||s.site===c.site).map(s=>s.site+' '+(s.available_records??'N/A')+'/'+(s.expected_records??'N/A')+' records').join(' · '):'Data Health: unavailable';
 if(page.frame){await mountFrame(app,page,bundle,()=>cache.active(generation));}
 else{const mod=await import(new URL(page.module, new URL('./host/',import.meta.url)));if(!cache.active(generation))return;app.replaceChildren();mod.mount(bundle);}
 }catch(e){if(!cache.active(generation))return;clearReport();const error=document.getElementById('error');error.textContent=e.message;error.hidden=false;document.getElementById('reportProvenance').textContent='Current report unavailable. Previous figures have been cleared.';}
 finally{loadingPanel.finish(generation);if(cache.active(generation)){refresh.disabled=false;refresh.textContent='Refresh';}}
}
function setPage(key){if(!PAGES[key])return;currentPage=key;history.replaceState(null,'',PAGES[key].hash);load();}
async function setupAuth(){document.getElementById('loginGoogle').onclick=signInGoogle;document.getElementById('logout').onclick=()=>{cache.clear();clearReport();clearAuthToken();userAllowed=false;location.replace(location.pathname);};
 recoverAuthSession();let user=null;try{user=await verifiedUser()}catch{}
 const email=String(user?.email||'').toLowerCase();if(!email.endsWith('@'+CFG.auth.domain)||!Boolean(user?.email_confirmed_at||user?.confirmed_at)){document.getElementById('loginGate').hidden=false;if(user?.email)document.getElementById('loginError').textContent='This account is not verified for @'+CFG.auth.domain;return false;}
 userIdentity=user.id+'|'+email;userAllowed=true;document.getElementById('loginGate').hidden=true;document.getElementById('logout').hidden=false;document.getElementById('userStatus').textContent=email;return true;}
CFG.sites.forEach(id=>site.add(new Option(id,id)));site.onchange=()=>load();startDate.onchange=endDate.onchange=()=>{updateCalendarLabel();load()};refresh.onclick=()=>load({force:true});document.querySelectorAll('nav button[data-page]').forEach(b=>{b.textContent=PAGES[b.dataset.page].label;b.onclick=()=>setPage(b.dataset.page)});addEventListener('hashchange',()=>{const key=Object.keys(PAGES).find(k=>PAGES[k].hash===location.hash);if(key&&key!==currentPage){currentPage=key;load();}});
initDateShortcuts();updateShell();if(await setupAuth())load();
// Diagnostic state contains no credentials or API payloads.
window.CERMS={version:CFG.version,context:()=>({page:currentPage,start:startDate.value,end:endDate.value,site:site.value}),refresh:()=>load({force:true})};
