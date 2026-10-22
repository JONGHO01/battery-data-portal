const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),root=process.argv[2];
class Node{
 constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this.isConnected=true;}
 append(...nodes){this.children.push(...nodes);} setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,v){this.listeners[k]=v;} remove(){this.removed=true;} focus(){this.focused=true;}
 showModal(){this.open=true;} close(){this.open=false;this.listeners.close?.();}
}
const body=new Node('body'),document={body,createElement:tag=>new Node(tag)},calls=[];
const window={},fixture=JSON.parse(fs.readFileSync(root+'/public/equipment-catalog.json','utf8'));
const context={window,document,AbortController,setTimeout,clearTimeout,URL,fetch:async(path,options)=>{calls.push({path,options});return {ok:true,text:async()=>JSON.stringify(fixture)};}};
vm.runInNewContext(fs.readFileSync(root+'/public/equipment-catalog.js','utf8'),context);
(async()=>{
 const k=await window.BatteryEquipment.forType('KNEADING');assert.equal(k.model,'NEP-0.5K');assert.equal(await window.BatteryEquipment.forType('OTHER'),null);
 const x=await window.BatteryEquipment.forType('MIXING');assert.equal(x.model,null);assert.equal(calls.length,1);assert.equal(calls[0].options.credentials,'omit');assert(!calls[0].options.body);
 const trigger=window.BatteryEquipment.button(k,'<img onerror=bad>');assert.equal(trigger.textContent,'NEP-0.5K');trigger.listeners.click();
 const dialog=body.children.at(-1);assert.equal(dialog.tagName,'dialog');assert.equal(dialog.open,true);
 const all=n=>[n,...n.children.flatMap(c=>typeof c==='object'?all(c):[])],nodes=all(dialog);
 assert(nodes.some(n=>n.tagName==='img'&&n.src==='/equipment/kmtech-nep.jpg'));
 assert(nodes.some(n=>n.textContent==='<img onerror=bad>'));assert(!nodes.some(n=>n.innerHTML));
 assert(nodes.some(n=>n.tagName==='a'&&n.rel==='noopener noreferrer'));
 nodes.find(n=>n.tagName==='button').listeners.click();assert(dialog.removed);assert(trigger.focused);
 console.log('equipment catalog browser PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
