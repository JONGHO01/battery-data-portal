/* Reviewed public catalog only. No research data, browser storage or external fetches. */
(() => {
  'use strict';
  let pending;
  const sources={MIXING:'https://kmtech.kr/bsr/board.php?bo_table=battery&wr_id=13',KNEADING:'https://kmtech.kr/bsr/board.php?bo_table=battery&wr_id=10'};
  const photos={MIXING:'/equipment/kmtech-pls.jpg',KNEADING:'/equipment/kmtech-nep.jpg'};
  const node=(tag,text,attrs={})=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;Object.assign(n,attrs);return n;};
  async function forType(type){
    if(!Object.hasOwn(sources,type))return null;
    if(!pending)pending=(async()=>{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
      try{
        const response=await fetch('/equipment-catalog.json',{credentials:'omit',signal:controller.signal});
        if(!response.ok)throw Error('장비 정보를 불러오지 못했습니다.');
        const text=await response.text();if(text.length>20000)throw Error('장비 정보의 크기가 올바르지 않습니다.');
        const data=JSON.parse(text);if(data.version!==1)throw Error('장비 정보 버전을 확인해 주세요.');
        for(const key of Object.keys(sources)){
          const v=data.equipment?.[key];
          if(!v||v.sourceUrl!==sources[key]||v.photo!==photos[key]||!Array.isArray(v.specifications)||v.specifications.length>8||
            !['displayName','manufacturer','productName','specificationNote'].every(k=>typeof v[k]==='string'&&v[k].length<=500)||
            !v.specifications.every(row=>Array.isArray(row)&&row.length===2&&row.every(cell=>typeof cell==='string'&&cell.length<=240)))throw Error('장비 정보를 확인할 수 없습니다.');
        }
        return data.equipment;
      }finally{clearTimeout(timer);}
    })().catch(err=>{pending=null;throw err;});
    return (await pending)[type];
  }
  function button(info,recorded=''){
    const trigger=node('button',info.displayName,{type:'button',className:'ew-equipment-link'});
    trigger.setAttribute('aria-label',info.displayName+' 장비 사진·사양 보기');trigger.setAttribute('aria-haspopup','dialog');
    trigger.addEventListener('click',()=>{
      const dialog=node('dialog',null,{className:'ew-equipment-dialog'}),bar=node('div',null,{className:'ew-equipment-bar'});
      dialog.setAttribute('aria-label',info.displayName+' 장비 정보');
      const close=node('button','닫기',{type:'button'});close.addEventListener('click',()=>dialog.close());bar.append(node('h3',info.displayName),close);
      const image=node('img',null,{src:info.photo,alt:info.manufacturer+' '+info.productName+' 제품군 대표사진',decoding:'async'});
      const notice=node('p','사진을 불러오지 못했습니다. 제조사 페이지에서 확인해 주세요.',{hidden:true});image.addEventListener('error',()=>{image.hidden=true;notice.hidden=false;});
      const facts=node('dl',null,{className:'ew-equipment-facts'});
      for(const [label,value] of [['제조사',info.manufacturer],['제품군',info.productName],['모델명',info.model||'미확정'],...info.specifications])facts.append(node('dt',label),node('dd',value));
      dialog.append(bar,image,notice,facts,node('p',info.specificationNote,{className:'ew-equipment-note'}));
      if(recorded&&recorded!==info.displayName){const original=node('details');original.append(node('summary','원래 기록의 장비 표기'),node('p',recorded));dialog.append(original);}
      dialog.append(node('a','사진·제품 정보 출처: 케이엠텍',{href:info.sourceUrl,target:'_blank',rel:'noopener noreferrer'}));
      dialog.addEventListener('close',()=>{dialog.remove();if(trigger.isConnected)trigger.focus();});(trigger.closest?.('#experimentWorkspaceView')||document.body).append(dialog);dialog.showModal();
    });
    return trigger;
  }
  window.BatteryEquipment={forType,button};
})();
