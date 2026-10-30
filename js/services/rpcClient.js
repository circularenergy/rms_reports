/* CE_RMS V3 | Single RPC transport. Exact SQL signatures verified 24-Oct-2026. */
import {APP_CONFIG as CFG} from '../../config/app-config.js';
import {RequestScheduler} from '../host/request-scheduler.js';
const scheduler=new RequestScheduler(CFG.loading?.maxConcurrentRequests??1);
export function rpc(name,body,options={}){return scheduler.run(()=>executeRpc(name,body,options),options);}
const audience='ce-rms-auth';
let token=null, expiresAt=0;
export function getAuthToken(){return token;}
export function setAuthToken(value,expiry=0){token=value||null;expiresAt=expiry||0;}
export function clearAuthToken(){token=null;expiresAt=0;sessionStorage.removeItem(audience);}
export function recoverAuthSession(){
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 if(hash.has('access_token')){
  const data={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_at:Date.now()+Number(hash.get('expires_in')||3600)*1000};
  sessionStorage.setItem(audience,JSON.stringify(data));history.replaceState(null,'',location.pathname+location.search+'#overview');
 }
 try {const saved=JSON.parse(sessionStorage.getItem(audience)||'null');if(saved?.access_token){setAuthToken(saved.access_token,saved.expires_at);return saved;}}catch{}
 return null;
}
async function refreshAuthTokenInternal(){
 let sess;try{sess=JSON.parse(sessionStorage.getItem(audience)||'null')}catch{return null}
 if(!sess?.refresh_token)return null;
 if(sess.expires_at>Date.now()+60000)return sess.access_token;
 const res=await fetch(`${CFG.database.url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',cache:'no-store',headers:{apikey:CFG.database.anonKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:sess.refresh_token})});
 if(!res.ok){clearAuthToken();return null;}
 const data=await res.json();sess={access_token:data.access_token,refresh_token:data.refresh_token||sess.refresh_token,expires_at:Date.now()+Number(data.expires_in||3600)*1000};sessionStorage.setItem(audience,JSON.stringify(sess));setAuthToken(sess.access_token,sess.expires_at);return token;
}
let refreshPending=null;
export function refreshAuthToken(){if(!refreshPending)refreshPending=refreshAuthTokenInternal().finally(()=>{refreshPending=null});return refreshPending;}
export async function verifiedUser(){const bearer=await refreshAuthToken();if(!bearer)return null;const res=await fetch(`${CFG.database.url}/auth/v1/user`,{headers:{apikey:CFG.database.anonKey,Authorization:`Bearer ${bearer}`}});if(!res.ok)return null;return res.json();}
export function signInGoogle(){const redirect=location.origin+location.pathname;const url=`${CFG.database.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`;location.assign(url);}
async function executeRpc(name,body,{signal}={}){
 let bearer=CFG.database.anonKey;
 if(CFG.auth.enabled){bearer=await refreshAuthToken();if(!bearer)throw new Error('Sign in with your company Google account to access the dashboard.');}
 const res=await fetch(`${CFG.database.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:CFG.database.anonKey,Authorization:`Bearer ${bearer}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body),signal});
 const txt=await res.text();if(!res.ok)throw new Error(`${name}: HTTP ${res.status} ${txt.slice(0,340)}`);
 let data;try{data=JSON.parse(txt)}catch{throw new Error(`${name} returned invalid JSON`)}
 if(Array.isArray(data))data=data[0]||{};return data?.[name]??data;
}
export function localDateToInstant(localDate){return `${localDate}T00:00:00+01:00`;}
export function apiWindow(startDate,endDateExclusive){return {p_start_at:localDateToInstant(startDate),p_end_at:localDateToInstant(endDateExclusive)};}
export function siteArray(siteId){return siteId&&siteId!=='ALL'?[siteId]:null;}
