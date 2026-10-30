export class RequestScheduler{
 constructor(limit=1){this.limit=Math.max(1,Math.floor(Number(limit)||1));this.active=0;this.queue=[];}
 run(task,{signal,onStart}={}){return new Promise((resolve,reject)=>{const item={task,signal,onStart,resolve,reject};this.queue.push(item);this.pump();});}
 pump(){while(this.active<this.limit&&this.queue.length){const item=this.queue.shift();if(item.signal?.aborted){item.reject(new DOMException('Request cancelled','AbortError'));continue;}this.active++;Promise.resolve().then(()=>{item.onStart?.();return item.task();}).then(item.resolve,item.reject).finally(()=>{this.active--;this.pump();});}}
}
