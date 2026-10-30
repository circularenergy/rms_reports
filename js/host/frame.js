let activeCleanup=()=>{};
export function disposeFrame(){activeCleanup();activeCleanup=()=>{};}
export function mountFrame(container,page,bundle,isActive){
 disposeFrame();
 return new Promise((resolve,reject)=>{
 const frame=document.createElement('iframe'),nonce=crypto.randomUUID();frame.className='v4-report-frame';frame.title=page.label;frame.style.visibility='hidden';frame.src=new URL(page.frame,new URL('../../',import.meta.url)).href+'?page='+encodeURIComponent(page.label)+'&nonce='+nonce;
 let settled=false,disposed=false,raf=0;const timer=setTimeout(()=>fail(Error('Report frame did not acknowledge loading.')),20000);
 function cleanup(){if(disposed)return;disposed=true;clearTimeout(timer);cancelAnimationFrame(raf);removeEventListener('message',receive);removeEventListener('scroll',schedule,true);removeEventListener('resize',schedule);removal.disconnect();if(!settled){settled=true;reject(Error('Obsolete report context'));}}
 function fail(error){if(settled)return;settled=true;cleanup();frame.remove();reject(error);}
 function sendViewport(){raf=0;if(disposed)return;if(!frame.isConnected||!isActive()){cleanup();return;}const r=frame.getBoundingClientRect(),header=document.querySelector('body>header'),headerBottom=Math.max(0,header?.getBoundingClientRect().bottom||0),top=Math.max(headerBottom,r.top),height=Math.max(1,Math.min(innerHeight,r.bottom)-top);frame.contentWindow.postMessage({channel:'ce-rms-report-v1',type:'viewport',page:page.label,nonce,generation:bundle.generation,top:Math.max(0,top-r.top),height},location.origin);}
 function schedule(){if(!raf)raf=requestAnimationFrame(sendViewport);}
 function receive(e){const m=e.data;if(e.source!==frame.contentWindow||e.origin!==location.origin||m?.channel!=='ce-rms-report-v1'||m.page!==page.label||m.nonce!==nonce)return;
 if(!isActive()){cleanup();return;}
 if(m.type==='ready')frame.contentWindow.postMessage({channel:m.channel,type:'render',page:page.label,nonce,generation:bundle.generation,bundle},location.origin);
 if(m.generation!==bundle.generation)return;
 if(m.type==='height'&&Number.isFinite(m.height)&&m.height>=1&&m.height<2000000){frame.style.height=Math.ceil(m.height)+'px';schedule();}
 if(m.type==='rendered'&&!settled){container.querySelector('[role=status]')?.remove();frame.style.visibility='visible';settled=true;clearTimeout(timer);schedule();resolve(frame);}
 if(m.type==='error'){if(!settled)fail(Error(m.message));}
 }
 const removal=new MutationObserver(()=>{if(!frame.isConnected)cleanup()});activeCleanup=cleanup;addEventListener('message',receive);addEventListener('scroll',schedule,true);addEventListener('resize',schedule);container.append(frame);removal.observe(container,{childList:true});
 });
}
