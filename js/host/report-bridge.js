// Trusted same-origin parent bridge. Height synchronization leaves the host as the single page scroller.
export function installReceiver(report){
 const page=new URLSearchParams(location.search).get('page'),nonce=new URLSearchParams(location.search).get('nonce');let accepted=-1,lastHeight=0,raf=0;
 const send=message=>parent.postMessage({channel:'ce-rms-report-v1',page,nonce,generation:accepted,...message},location.origin);
 function measure(){raf=0;if(accepted<0)return;const nodes=[...document.body.children].filter(el=>!['SCRIPT','STYLE','DIALOG'].includes(el.tagName)&&!el.matches('.modal')&&getComputedStyle(el).position!=='fixed'&&getComputedStyle(el).display!=='none');const bottom=Math.max(1,...nodes.map(el=>el.getBoundingClientRect().bottom+scrollY+(parseFloat(getComputedStyle(el).marginBottom)||0)));const h=Math.ceil(bottom+Math.max(0,innerHeight-document.documentElement.clientHeight));if(h!==lastHeight){lastHeight=h;send({type:'height',height:h});}}
 const schedule=()=>{if(!raf)raf=requestAnimationFrame(measure)};
 if(parent===window){document.body.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Open this page through the dashboard or tests/test-shell.html.'}));return;}
 addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin)return;const m=e.data;
 if(m?.channel!=='ce-rms-report-v1'||m.page!==page||m.nonce!==nonce||!Number.isInteger(m.generation))return;
 if(m.type==='viewport'&&m.generation===accepted){if(Number.isFinite(m.top)&&m.top>=0&&Number.isFinite(m.height)&&m.height>0){document.documentElement.style.setProperty('--ce-host-top',m.top+'px');document.documentElement.style.setProperty('--ce-host-height',m.height+'px');}return;}
 if(m.type!=='render'||m.generation<accepted||m.bundle?.contract!=='ce-rms-report-v1'||m.bundle?.generation!==m.generation)return;
 accepted=m.generation;try{report.render(m.bundle);measure();send({type:'rendered'});schedule();}catch(err){send({type:'error',message:err.message});}});
 new ResizeObserver(schedule).observe(document.body);new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});addEventListener('resize',schedule);document.fonts.ready.then(schedule);send({type:'ready'});
}
