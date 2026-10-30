// Memory only. Identity belongs to the key; no tokens or payloads in persistent storage.
export class ReportCache{
 constructor({ttlMs=300000,maxEntries=64,now=()=>Date.now()}={}){Object.assign(this,{ttlMs,maxEntries,now});this.done=new Map();this.pending=new Map();this.controllers=new Map();this.epoch=0;this.refreshEpoch=0;this.generation=0;}
 activate({refresh=false}={}){this.generation++;if(refresh){for(const controller of this.controllers.values())controller.abort();this.controllers.clear();this.refreshEpoch++;this.done.clear();this.pending.clear();}return this.generation;}
 active(g){return g===this.generation;}
 clear(){for(const controller of this.controllers.values())controller.abort();this.controllers.clear();this.epoch++;this.refreshEpoch++;this.generation++;this.done.clear();this.pending.clear();}
 key(id,def,c){return JSON.stringify([id,def.version,c.startAt,c.endAt,def.scope||c.site,c.identity,c.policy]);}
 async get(key,loader){const t=this.now(),hit=this.done.get(key);if(hit&&t-hit.retrievedAt<this.ttlMs)return {...hit,reused:true};this.done.delete(key);if(this.pending.has(key))return this.pending.get(key);
 const started=this.now(),epoch=this.epoch,refresh=this.refreshEpoch,controller=new AbortController();this.controllers.set(key,controller);
 const task=Promise.resolve().then(()=>loader(controller.signal)).then(data=>{const value={data,retrievedAt:this.now(),elapsedMs:this.now()-started,reused:false};if(epoch===this.epoch&&refresh===this.refreshEpoch){this.done.set(key,value);while(this.done.size>this.maxEntries)this.done.delete(this.done.keys().next().value);}return value;}).finally(()=>{if(this.pending.get(key)===task){this.pending.delete(key);this.controllers.delete(key)}});
 this.pending.set(key,task);return task;}
}
