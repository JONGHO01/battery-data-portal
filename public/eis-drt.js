/* EIS-only view and state. No routing, shared CSS, or global store changes. */
const EisDrt = (() => {
  const analysisVersion = 'rc-drt-4';
  const cache = new WeakMap();
  let viewEvents = null;
  let unfoldRaw = () => {};
  function screenSize(width=1100,height=1000) {
    return {w:Math.max(480,Math.round(width||1100)),h:Math.max(680,Math.round((height||1000)*.55))};
  }
  function peakGroups(peaks=[]) {
    const priority=p=>Number(p.major===true||p.priorityMajor===true);
    const ranked=peaks.filter(p=>p.interpretationEligible!==false).sort((a,b)=>priority(b)-priority(a)||(number(b.prominence)||0)-(number(a.prominence)||0)||a.tau_peak-b.tau_peak);
    const selected=new Set(ranked.slice(0,5));
    return {major:peaks.filter(p=>selected.has(p)),minor:peaks.filter(p=>!selected.has(p))};
  }
  function foldRawData(d,host,entry) {
    unfoldRaw();
    const raw=host.parentElement?.querySelector('.excelPreview');
    if(!raw)return;
    const fold=document.createElement('details'),summary=document.createElement('summary');
    fold.dataset.eisRaw='';fold.open=Boolean(entry.rawOpen);
    summary.textContent=`Raw EIS Data (${d.rows.length} points) `;
    const toggle=document.createElement('button');toggle.type='button';
    toggle.style.cssText='width:auto;padding:5px 12px;margin-left:12px';
    const sync=()=>{toggle.textContent=fold.open?'Hide':'Show';toggle.setAttribute('aria-expanded',String(fold.open));entry.rawOpen=fold.open;};
    toggle.onclick=event=>{event.preventDefault();event.stopPropagation();fold.open=!fold.open;sync();};
    fold.ontoggle=sync;sync();summary.append(toggle);fold.append(summary);
    raw.before(fold);fold.append(raw);
    const observer=new MutationObserver(()=>{if(!host.querySelector('.eisDrtFigure'))unfoldRaw();});
    observer.observe(host,{childList:true,subtree:true});
    unfoldRaw=()=>{observer.disconnect();fold.before(raw);fold.remove();unfoldRaw=()=>{};};
  }
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = value => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  function kkSummary(metadata) {
    const diagnostic=metadata?.kkConsistency;
    if(!diagnostic)return 'KK 진단 없음';
    const error=number(diagnostic.relativeComplexRMSEPercent);
    if(error===null)return 'KK 진단: 판정 불가';
    return `KK RMSE: ${fmt(error)}%${diagnostic.selectionReliable===true?'':' · 차수 선택 미확정'}`;
  }
  const header = value => String(value).toLowerCase().replace(/−/g,'-').replace(/″/g,"''").replace(/′/g,"'").replace(/\[.*?\]|\/\s*(?:ohm|Ω|ω).*/g,'').replace(/[\s_(){}]/g,'');
  function source(row, aliases) {
    const key = Object.keys(row).find(key => aliases.includes(header(key)));
    return [key !== undefined, key === undefined ? null : number(row[key])];
  }
  function normalizeRows(rows) {
    const points = (rows || []).map((item,rowIndex) => {
      const row = item && typeof item === 'object' ? item : {};
      const raw = row._raw && typeof row._raw === 'object' ? row._raw : {};
      const field = (canonical,aliases) => {
        const key = canonical.find(k=>Object.hasOwn(row,k));
        if (key !== undefined) return number(row[key]);
        const [found,value] = source(row,aliases);
        return found ? value : source(raw,aliases)[1];
      };
      const frequency_Hz = field(['frequency_Hz','frequency_hz','frequency'],['frequencyhz','freqhz','frequency','freq','f/hz','f']);
      const z_real_ohm = field(['z_real_ohm','zreal'],['rez',"z'",'zreal','zrealohm']);
      let z_imag_ohm = field(['z_imag_ohm','zimag'],['imz',"z''",'zimag','zimagohm']);
      const aliases = ['-imz',"-z''",'-zimag','-zimagohm'];
      let [found,negative] = source(raw,aliases);
      if (!found) [found,negative] = source(row,aliases);
      if (found && row.signConvention !== 'Z = Re(Z) + i Im(Z)' &&
          ((!Object.hasOwn(row,'z_imag_ohm') && !Object.hasOwn(row,'zimag')) || (negative !== null && z_imag_ohm === negative))) {
        z_imag_ohm = negative === null ? null : -negative;
      }
      const sweep = String(String(row.sweep ?? '').trim() ? row.sweep : raw.sweep ?? '').trim() || null;
      return {frequency_Hz,z_real_ohm,z_imag_ohm,rowIndex,sweep};
    });
    return splitSpectra(points).flat();
  }
  function splitSpectra(points) {
    const groups=[];
    let previousFrequency=null,direction=0,lastSweep=null,seen=new Set();
    for (const point of points) {
      const f=point.frequency_Hz,positive=f!==null && Number.isFinite(f) && f>0;
      const delta=positive && previousFrequency!==null ? Math.sign(f-previousFrequency) : 0;
      const sweepChange=point.sweep!==null && lastSweep!==null && point.sweep!==lastSweep;
      if (!groups.length || sweepChange || (positive && (seen.has(f) || (direction && delta && delta!==direction)))) {
        groups.push([]);previousFrequency=null;direction=0;seen=new Set();
      }
      if (positive) {
        if (previousFrequency!==null) direction=Math.sign(f-previousFrequency);
        previousFrequency=f;seen.add(f);
      }
      if (point.sweep!==null) lastSweep=point.sweep;
      groups.at(-1).push({...point,spectrumIndex:groups.length-1});
    }
    return groups;
  }
  const valid = p => p.frequency_Hz !== null && p.frequency_Hz > 0 && p.z_real_ohm !== null && p.z_imag_ohm !== null;
  const hz = f => f>=1e6 ? `${fmt(f/1e6)} MHz` : f>=1e3 ? `${fmt(f/1e3)} kHz` : `${fmt(f)} Hz`;
  function tauBounds(points) {
    const fs=points.filter(valid).map(p=>p.frequency_Hz);
    if(!fs.length)return null;
    const min=Math.min(...fs),max=Math.max(...fs);
    return {data:[1/(2*Math.PI*max),1/(2*Math.PI*min)],grid:[.1/(2*Math.PI*max),10/(2*Math.PI*min)]};
  }
  function frequencyRanges(points) {
    const ranges=new Map();
    for(const group of splitSpectra(points)) {
      const fs=group.filter(p=>p.frequency_Hz>0).map(p=>p.frequency_Hz);
      if(!fs.length)continue;
      const min=Math.min(...fs),max=Math.max(...fs),key=JSON.stringify([min,max]);
      const index=group[0].spectrumIndex;
      const complete=group.every(valid)&&new Set(fs).size>=3;
      if(!ranges.has(key))ranges.set(key,{min,max,label:`${hz(max)} – ${hz(min)}`,indices:[],spectrumIndex:index,complete:false});
      const range=ranges.get(key);range.indices.push(index);
      if(complete&&!range.complete){range.spectrumIndex=index;range.complete=true;}
    }
    return [...ranges.values()];
  }
  const assignmentOptions=['Unassigned','R_SEI','R_ct','R_ion','Diffusion','Other'];
  const candidateLabels=[
    ['HF','고주파 계면·피막 관련 영역','High-frequency interfacial / film process'],
    ['MF','전하전달 관련 영역','Charge-transfer process'],
    ['LF','이온수송·확산 관련 영역','Low-frequency transport / diffusion process']
  ];
  // Relative visual guides only. Quantiles of log-time anchors move with the
  // measured span and in-band peaks; they are not physical process boundaries.
  function interpretationBands(points,peaks=[]) {
    const bounds=tauBounds(points);if(!bounds||bounds.data[0]>=bounds.data[1])return [];
    const [lo,hi]=bounds.data;
    const anchors=[lo,...new Set(peaks.map(p=>number(p.tau_peak)).filter(t=>t>lo&&t<hi)),hi].sort((a,b)=>a-b).map(Math.log);
    const at=q=>{const n=q*(anchors.length-1),i=Math.floor(n);return Math.exp(anchors[i]+(anchors[Math.min(i+1,anchors.length-1)]-anchors[i])*(n-i));};
    const edges=[lo,at(1/3),at(2/3),hi];
    return candidateLabels.map(([short,ko,en],i)=>({short,ko,en,min:edges[i],max:edges[i+1]}));
  }
  function assignmentContext(datasetId,runId,result) {
    if(!datasetId||!runId||!result)return null;
    return JSON.stringify([datasetId,runId,result.metadata?.spectrumIndex??null,(result.peaks||[]).map(p=>[p.Peak,p.tau_peak,p.f_peak,p.R_region])]);
  }
  function readAssignments(record,context,peaks=[]) {
    if(!context||record?.context!==context||record.source!=='user')return {};
    return Object.fromEntries(peaks.filter(p=>assignmentOptions.slice(1).includes(record.values?.[p.Peak])).map(p=>[p.Peak,record.values[p.Peak]]));
  }
  function coordinates(points) {
    const measured = points.filter(p=>p.z_real_ohm !== null && p.z_imag_ohm !== null);
    return {left:measured.map(p=>({...p,x:p.z_real_ohm,y:-p.z_imag_ohm})),right:measured.map(p=>({...p,x:p.z_real_ohm,y:p.z_imag_ohm}))};
  }
  function matches(result,points) {
    const measured = points.filter(valid), fitted = result?.reconstruction;
    return Array.isArray(fitted) && fitted.length === measured.length && fitted.every((p,i)=>
      p.frequency_Hz === measured[i].frequency_Hz && p.z_real_raw_ohm === measured[i].z_real_ohm && p.z_imag_raw_ohm === measured[i].z_imag_ohm &&
      (p.rowIndex === undefined || p.rowIndex === measured[i].rowIndex));
  }
  function integrate(tau,gamma,a,b) {
    if (!(tau.length >= 2 && a >= tau[0] && b <= tau.at(-1) && a < b)) throw Error('DRT 격자 안에서 τ 시작값 < 끝값을 선택하세요.');
    const u = tau.map(Math.log), ua = Math.log(a), ub = Math.log(b);
    const grid = [ua,...u.filter(v=>v>ua && v<ub),ub];
    const at = value => {
      const j = Math.max(0,Math.min(u.length-2,u.findIndex(v=>v>=value)-1));
      return gamma[j]+(gamma[j+1]-gamma[j])*(value-u[j])/(u[j+1]-u[j]);
    };
    return grid.slice(1).reduce((sum,v,i)=>sum+(v-grid[i])*(at(v)+at(grid[i]))/2,0);
  }
  function csv(fields,rows) { return [fields.join(','),...rows.map(row=>fields.map(k=>row[k] ?? '').join(','))].join('\r\n'); }
  const fmt = v => Number.isFinite(v) ? Number(v.toPrecision(4)).toString() : '—';
  const warningText = text => {
    if(text.startsWith('Duplicate frequencies'))return '중복 주파수를 평균하거나 삭제하지 않았습니다. 여러 sweep이 섞였다면 단일 정상상태 스펙트럼인지 확인하세요.';
    if(text.startsWith('Invalid rows'))return '비유한값·누락값·f≤0인 행만 이번 계산에서 제외했습니다. 원본은 유지됩니다.';
    if(text.startsWith('L-curve corner'))return 'L-curve corner가 불명확해 자동 선택을 채택하지 않았습니다. 입력한 수동 λ 결과를 표시합니다.';
    if(text.startsWith('Reconstruction error'))return '재구성 오차가 5%를 넘습니다. 비음수 RC 모델이 측정 스펙트럼을 충분히 설명하지 못할 수 있습니다.';
    if(text.startsWith('Outside measured'))return '측정 대역 밖 — 해석 주의. 피크만으로 SEI·전하 전달·이온 수송 메커니즘을 확정할 수 없습니다.';
    if(text.startsWith('Peak locations'))return '측정 대역 밖 피크는 주요 해석 후보에서 제외했습니다. 적분 경계가 대역 밖인 R_region도 외삽에 의존합니다. 모든 계산값은 보존됩니다.';
    return text;
  };
  function path(points,sx,sy) {
    return points.map((p,i)=>`${i && p.spectrumIndex === points[i-1].spectrumIndex && p.sweep === points[i-1].sweep ? 'L':'M'}${sx(p.x).toFixed(3)},${sy(p.y).toFixed(3)}`).join(' ');
  }
  function plot({x,y,w,h,title,xlabel,ylabel,points,fit=[],color,id,logX=false,band=null,empty='',domains=null,showGrid=true,connectPoints=true,markerSize=4,guide=[],peaks=[],assignments={}}) {
    const all = [...points,...fit];
    const xx = all.map(p=>logX ? Math.log10(p.x) : p.x), yy = all.map(p=>p.y);
    const range = (values,zero) => {
      if (!values.length) return [0,1];
      let lo=Math.min(...values),hi=Math.max(...values);
      const padding = Math.max(hi-lo,Math.abs(hi)*.08,1e-9)*.07;
      if (zero) return [Math.min(0,lo-padding),Math.max(0,hi+padding)];
      return [lo-padding,hi+padding];
    };
    const xd=[...(domains?.x || range(xx,!logX))],yd=[...(domains?.y || range(yy,true))];
    const unavailable=id==='drt'&&!points.length&&!domains?.x;
    if(id==='drt'){yd[0]=0;if(yy.length&&!domains?.y)yd[1]=Math.max(...yy)*1.2||1;}
    const sx = value=>x+((logX?Math.log10(value):value)-xd[0])/(xd[1]-xd[0])*w;
    const sy = value=>y+h-(value-yd[0])/(yd[1]-yd[0])*h;
    const ticks = domain=>Array.from({length:5},(_,i)=>domain[0]+(domain[1]-domain[0])*i/4);
    const text = (tx,ty,value,anchor='start',size=12,extra='')=>`<text x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="${size}" ${extra}>${esc(value)}</text>`;
    let content = `<g data-eis-panel="${id}" data-x-min="${xd[0]}" data-x-max="${xd[1]}" data-y-min="${yd[0]}" data-y-max="${yd[1]}" data-plot-width="${w}" data-plot-height="${h}">${text(x,y-18,title,'start',id==='drt'?15:18,'font-weight="700"')}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" stroke="#1f2937"/>`;
    if (band && points.length) {
      const lo=Math.max(x,Math.min(x+w,sx(band[0]))),hi=Math.max(x,Math.min(x+w,sx(band[1])));
      content += `<rect x="${x}" y="${y}" width="${lo-x}" height="${h}" fill="#fef3c7"/><rect x="${hi}" y="${y}" width="${x+w-hi}" height="${h}" fill="#fef3c7"/>`;
    }
    for (const value of unavailable?[]:ticks(xd)) {
      const pos=x+(value-xd[0])/(xd[1]-xd[0])*w;
      if(showGrid)content+=`<line x1="${pos}" x2="${pos}" y1="${y}" y2="${y+h}" stroke="#cbd5e1" stroke-dasharray="2 6"/>`;
      content+=`${text(pos,y+h+19,logX?fmt(10**value):fmt(value),'middle')}`;
    }
    for (const value of unavailable?[]:ticks(yd)) {
      if(showGrid)content+=`<line x1="${x}" x2="${x+w}" y1="${sy(value)}" y2="${sy(value)}" stroke="#cbd5e1" stroke-dasharray="2 6"/>`;
      content+=`${text(x-8,sy(value)+4,fmt(value),'end')}`;
    }
    if (points.length) {
      if(id==='drt'||connectPoints) content+=`<path class="eis-drt-measured-line" d="${path(points,sx,sy)}" fill="none" stroke="${color}" stroke-width="${id==='drt'?2.2:1}" opacity="${id==='drt'?1:.45}"/>`;
      if (id!=='drt') for (const p of points) {
        content+=`<circle class="eis-drt-measured" cx="${sx(p.x)}" cy="${sy(p.y)}" r="${Math.max(1,Math.min(12,Number(markerSize)||4))}" fill="white" stroke="${color}" data-real="${p.z_real_ohm}" data-imag="${p.z_imag_ohm}" data-y="${p.y}"><title>frequency_Hz: ${esc(p.frequency_Hz ?? 'missing')}\nRe(Z): ${p.z_real_ohm} Ω\nIm(Z): ${p.z_imag_ohm} Ω</title></circle>`;
      }
      const hf = id==='drt'?null:points.filter(p=>p.frequency_Hz !== null && p.frequency_Hz>0).reduce((a,p)=>!a||p.frequency_Hz>a.frequency_Hz?p:a,null);
      if (hf) content+=`<circle cx="${sx(hf.x)}" cy="${sy(hf.y)}" r="4" fill="${color}"/><text x="${Math.min(x+w-60,sx(hf.x)+8)}" y="${Math.max(y+14,sy(hf.y)-8)}" font-size="11" fill="${color}">HF start</text>`;
    } else content+=text(x+w/2,y+h/2,empty,'middle',12);
    if (fit.length) content+=`<path class="eis-drt-fit" d="${path(fit,sx,sy)}" fill="none" stroke="#dc6b32" stroke-width="2" stroke-dasharray="7 4"/>`;
    if(id==='drt') {
      const labels=[];
      for(const p of peakGroups(peaks).major) {
        if(!(p.tau_peak>0)||!points.length)continue;
        const nearest=points.reduce((a,b)=>Math.abs(Math.log(b.x/p.tau_peak))<Math.abs(Math.log(a.x/p.tau_peak))?b:a);
        const name=assignmentOptions.slice(1).includes(assignments[p.Peak])?`${p.Peak} → ${assignments[p.Peak]}`:p.Peak;
        const tx=Math.max(x+40,Math.min(x+w-45,sx(p.tau_peak)));
        let ty=Math.max(y+14,sy(nearest.y)-12);
        const candidates=Array.from({length:40},(_,i)=>Math.max(y+14,Math.min(y+h-14,ty+(i%2?1:-1)*Math.ceil(i/2)*16)));
        ty=candidates.find(v=>!labels.some(label=>Math.abs(label.x-tx)<(label.width+name.length*6)/2+6&&Math.abs(label.y-v)<15))??ty;
        labels.push({x:tx,y:ty,width:name.length*6});
        content+=text(tx,ty,name,'middle',11);
      }
      guide.forEach((region,i)=>{
        const a=Math.max(x,Math.min(x+w,sx(region.min))),b=Math.max(a,Math.min(x+w,sx(region.max)));
        const lines=[['High-frequency','Interface / film'],['Mid-frequency','Charge transfer'],['Low-frequency','Transport / diffusion']][i];
        content+=`<g data-drt-guide="${region.short}"><title>${esc(region.ko+' / '+region.en+' — 해석 후보, 확정 아님')}</title><rect x="${a}" y="${y+h+44}" width="${b-a}" height="26" fill="${['#d9efef','#e6eafa','#faeadb'][i]}"/>${text((a+b)/2,y+h+54,b-a>=105?lines[0]:region.short,'middle',9)}${b-a>=105?text((a+b)/2,y+h+66,lines[1],'middle',9):''}</g>`;
      });
      if(guide.length)content+=text(x+w/2,y+h+82,'해석 후보 영역 · 확정적 저항 할당 아님','middle',9);
    }
    content+=text(x+w/2,y+h+38,xlabel,'middle',14);
    content+=`<text transform="translate(${x-52},${y+h/2}) rotate(-90)" text-anchor="middle" font-size="14">${esc(ylabel)}</text></g>`;
    return content;
  }
  function svg(points,result,options) {
    const {w,title,date}=options,stacked=options.screen&&w<950&&!options.onlyNyquist;
    const h=stacked?1300:options.onlyNyquist||options.screen?options.h:Math.max(options.h,850);
    const color=/^#[0-9a-f]{6}$/i.test(options.color)?options.color:'#14888a';
    const only=options.onlyNyquist;
    const side=only?Math.min(w-136,h-228):stacked?w-110:(w-190)*.55;
    const nx=only?Math.round((w-side)/2):68,ny=options.screen?76:110;
    const panelGap=90,plotHeight=only?side:stacked?360:h-(options.screen?155:190);
    const rx=stacked?nx:nx+side+panelGap,rw=stacked?side:(w-190)*.45,gap=options.screen?110:130,rh=stacked?270:(plotHeight-gap)/2;
    const ry=stacked?ny+plotHeight+95:ny;
    const coords=coordinates(points);
    const chartStyle={showGrid:options.showGrid!==false,connectPoints:options.connectPoints!==false,markerSize:options.markerSize};
    const byRow=new Map(points.map(p=>[p.rowIndex,p]));
    const fit=(result?.reconstruction||[]).map(p=>({x:p.z_real_fit_ohm,y:p.z_imag_fit_ohm,sweep:byRow.get(p.rowIndex)?.sweep,spectrumIndex:byRow.get(p.rowIndex)?.spectrumIndex}));
    let panels=plot({...chartStyle,x:nx,y:ny,w:side,h:plotHeight,title:'Nyquist plot',xlabel:"Re(Z) / Ω",ylabel:"-Im(Z) / Ω",points:coords.left,fit:fit.map(p=>({...p,y:-p.y})),color,id:'left',empty:'유효한 Re(Z), Im(Z)가 없습니다.',domains:options.leftDomains});
    if (!only) {
      const bounds=tauBounds(points);
      panels+=plot({...chartStyle,x:rx,y:ry,w:rw,h:rh,title:'DRT — nonnegative RC model',xlabel:'τ / s',ylabel:'γ(ln τ) / Ω',points:(result?.drt||[]).map(p=>({x:p.tau_s,y:p.gamma_ohm})),color,id:'drt',logX:true,domains:bounds?{x:bounds.grid.map(Math.log10)}:null,band:result?.metadata.measuredTimeBand,empty:bounds?'DRT 계산 전':'유효한 주파수가 필요합니다.',guide:interpretationBands(points,result?.peaks),peaks:result?.peaks,assignments:options.assignments});
      panels+=plot({...chartStyle,x:rx,y:ry+rh+gap,w:rw,h:rh,title:'Nyquist — Im(Z)',xlabel:'Re(Z) / Ω',ylabel:'Im(Z) / Ω',points:coords.right,fit,color,id:'imag'});
      panels+=`<text x="${rx}" y="${ry+rh+gap-3}" font-size="10">Same EIS data, original imaginary sign</text>`;
    }
    const poorFit=Number(result?.relative_complex_RMSE_percent)>5;
    const footer=poorFit?`Fit RMSE: ${fmt(result.relative_complex_RMSE_percent)}% · 해석 주의: RC 모델·측정 일관성 확인 필요 · ○ 원본 측정값 / 주황 점선 재구성`:'○ 측정값 · 주황 점선: DRT 재구성 · 노란 영역: 측정 대역 밖 — 해석 주의';
    const diagnosticLine=result?`<text x="72" y="${h-8}" font-size="11">${esc(kkSummary(result.metadata))} · 물리 검증: 미완료</text>`:'';
    return `<svg id="paperFigure" class="eisDrtFigure" style="--figure-width:${w}px;width:100%;max-width:none;height:auto" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Noto Sans KR, Arial, sans-serif" fill="#475569"><rect width="${w}" height="${h}" fill="white"/><text x="72" y="${options.screen?22:48}" font-size="18" font-weight="700" fill="#111827">${esc(title)}</text><text x="72" y="${options.screen?42:74}" font-size="14">${esc(date)}</text>${panels}<text x="72" y="${result?h-25:h-8}" font-size="11" fill="${poorFit?'#b45309':'#475569'}">${esc(footer)}</text>${diagnosticLine}</svg>`;
  }
  function download(name,content,type='text/csv;charset=utf-8') {
    const url=URL.createObjectURL(new Blob([content],{type}));
    const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function render(d) {
    viewEvents?.abort();viewEvents=new AbortController();
    const allPoints=normalizeRows(d.rows), signature=JSON.stringify(allPoints);
    let entry=cache.get(d);
    if (!entry || entry.signature!==signature) {
      entry={signature,result:null,settings:{M:100,lambda:1e-3,includeL:true,mode:'auto'},spectrumIndex:null,pending:false,revision:0,autoAttempted:false};cache.set(d,entry);
    }
    const spectra=splitSpectra(allPoints);
    const ranges=frequencyRanges(allPoints);
    if(entry.spectrumIndex===null&&ranges.length)entry.spectrumIndex=(ranges.find(r=>r.complete)||ranges[0]).spectrumIndex;
    const selectedRange=ranges.find(r=>r.spectrumIndex===entry.spectrumIndex);
    const needsSelection=false;
    const points=entry.spectrumIndex===null ? allPoints : allPoints.filter(p=>p.spectrumIndex===entry.spectrumIndex);
    if (needsSelection) entry.result=null;
    const style=currentFigureStyle();syncFigureControls(style);
    const size=figureSvgSize(style,'eis'),title=figureDatasetLabel(d);
    const options={...size,showGrid:style.showGrid,connectPoints:style.connectPoints,markerSize:style.markerSize,title,date:`${d.cell?.date||''} ${d.cell?.condition||''}`,color:normalizeHexColor(style.seriesColor),onlyNyquist:d.figureKind==='nyquist'};
    const leftBounds=cleanNyquistBounds(coordinates(points).left);
    options.leftDomains=resolveFigureAxisDomains(leftBounds.x,leftBounds.y,'eis');
    $('figureTitle').textContent=title;
    $('figureSubtitle').textContent=`${d.cell?.date||''} ${d.cell?.material||''} ${points.length} points`;
    $('metaGrid').innerHTML=[['Material',d.cell?.material],['Electrolyte',d.cell?.electrolyte],['Condition',d.cell?.condition],['Owner',d.ownerName||d.ownerId],['Notes',d.cell?.notes]].map(([k,v])=>`<div class="metaItem"><strong>${k}</strong>${esc(v||'-')}</div>`).join('');
    const host=$('figureCanvas');
    host.innerHTML=`<div data-eis-plot style="width:100%;overflow-x:auto"></div><div data-eis-controls></div>`;
    const plotHost=host.querySelector('[data-eis-plot]'),controls=host.querySelector('[data-eis-controls]');
    const current=()=>host.contains(controls)&&cache.get(d)===entry&&JSON.stringify(normalizeRows(d.rows))===signature;
    const context=()=>assignmentContext(d.id,entry.runId,entry.result);
    const assignments=()=>readAssignments(entry.assignmentDraft||d.figureEdits?.eisDrtAssignments,context(),entry.result?.peaks);
    const draw=()=>{plotHost.innerHTML=svg(points,entry.result,{...options,...screenSize(host.clientWidth,typeof window==='undefined'?1000:window.innerHeight),screen:true,assignments:assignments(),title:entry.spectrumIndex===null ? title : `${title} · 구간 ${entry.spectrumIndex+1}`});applyAnnotationsToSvg();};
    draw();
    foldRawData(d,host,entry);
    if(typeof window!=='undefined')window.addEventListener('resize',()=>{if(current())draw();},{signal:viewEvents.signal});
    const spectrumControl=`<label>측정 구간 <select data-eis-spectrum name="spectrum">${ranges.length?ranges.map(r=>`<option value="${r.spectrumIndex}" ${entry.spectrumIndex===r.spectrumIndex?'selected':''}>${r.label}</option>`).join(''):'<option value="">주파수 없음</option>'}</select></label>`;
    const acquisitionInfo=`<details style="margin:8px 0;font-size:12px"><summary>측정 메타데이터 · 동일 범위 ${selectedRange?.indices.length||0}회</summary><p>같은 범위는 첫 유효 측정을 대표로 사용합니다. 평균·삭제하지 않습니다. 선택된 원본 측정: ${(entry.spectrumIndex??0)+1}</p>${(selectedRange?.indices||[]).map(i=>`<div>원본 측정 ${i+1}: ${fmt(spectra[i][0].frequency_Hz)} → ${fmt(spectra[i].at(-1).frequency_Hz)} Hz · ${spectra[i].length}점</div>`).join('')}</details>`;
    if (options.onlyNyquist) {
      controls.innerHTML=spectrumControl+acquisitionInfo;
      const selector=controls.querySelector('[data-eis-spectrum]');
      if(selector)selector.onchange=()=>{entry.spectrumIndex=selector.value===''?null:Number(selector.value);entry.result=null;entry.loaded=false;entry.revision++;render(d);};
      return;
    }
    controls.innerHTML=`<style>
      [data-drt-form] label{font-size:12px;min-width:0;margin:0}
      [data-drt-form] input:not([type=checkbox]),[data-drt-form] select,[data-drt-form] button{height:32px;padding:5px 9px;box-sizing:border-box;margin:2px 0 0}
      [data-peak-card] td,[data-peak-card] th{padding:4px 8px;font-size:12px;line-height:1.3}
      [data-peak-card] select{height:28px;padding:2px 6px;margin:0}
    </style><section data-drt-card style="box-sizing:border-box;width:100%;margin:6px 0;padding:8px 12px;border:1px solid #cbdfe4;border-radius:8px;background:#f8fcfd"><h3 style="font-size:12px;margin:0 0 4px">DRT Controls</h3><form data-drt-form>${spectrumControl}<label>λ mode <select name="mode"><option value="auto">자동</option><option value="manual">수동</option></select></label><input name="lambdaSlider" type="hidden" value="${Math.log10(Math.max(1e-6,entry.settings.lambda))}"><label>현재 λ <input name="lambda" type="number" min="0" max="10" step="any" value="${entry.settings.lambda}" required></label><label>M (20–200) <input name="M" type="number" min="20" max="200" step="1" value="${entry.settings.M}" required></label><label style="display:flex;gap:8px;align-items:center;height:32px"><input name="includeL" type="checkbox" ${entry.settings.includeL?'checked':''}> 직렬 L 포함</label><button type="submit" style="width:auto;max-width:160px;justify-self:start">DRT 계산·저장</button></form><p data-drt-status role="status" style="font-size:12px;line-height:1.5;margin:6px 0 0"></p>${acquisitionInfo}</section><div data-drt-result></div>`;
    const form=controls.querySelector('form'),status=controls.querySelector('[data-drt-status]'),details=controls.querySelector('[data-drt-result]');
    const legend=`<details aria-label="DRT 해석 후보 영역" style="font-size:11px;margin:4px 0"><summary>HF: Interface / film · MF: Charge transfer · LF: Transport / diffusion — 참고 영역, 확정적 assignment 아님</summary>${candidateLabels.map(([short,ko,en])=>`<div>${short} · ${ko} / ${en}</div>`).join('')}<span>경계는 현재 측정 범위와 대역 내 피크에 따른 시각적 가이드입니다. 대역 밖은 해석 주의.</span></details>`;
    // Insert before the controls without changing the portal or shared styles.
    if(controls.insertAdjacentHTML)controls.insertAdjacentHTML('afterbegin',legend);
    const selector=controls.querySelector('[data-eis-spectrum]');
    if(selector)selector.onchange=()=>{
      if(entry.pending)return;
      entry.spectrumIndex=selector.value===''?null:Number(selector.value);entry.result=null;entry.loaded=false;entry.autoAttempted=true;entry.revision++;render(d);
    };
    form.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px 12px;align-items:end;max-width:1180px';
    form.elements.includeL.style.width='auto';
    form.elements.mode.value=entry.settings.mode;
    form.elements.lambdaSlider.oninput=()=>{form.elements.lambda.value=(10**Number(form.elements.lambdaSlider.value)).toExponential(2);};
    form.elements.lambda.oninput=()=>{form.elements.lambdaSlider.value=Math.log10(Math.max(1e-6,Number(form.elements.lambda.value)));};
    const validPoints=points.filter(valid),excluded=points.length-validPoints.length;
    const missingFrequency=validPoints.length===0;
    const qualityText=`Data: ${validPoints.length} points · Range: ${selectedRange?.label||'—'}`;
    const setStatus=(state,note='')=>{const r=entry.result,m=r?.metadata;status.textContent=`${qualityText} · DRT: ${state}${m?` · λ: ${Number(m.lambda).toExponential(1)} · Rs: ${fmt(m.Rs)} Ω · L: ${fmt(m.L*1e6)} µH · Major peaks: ${peakGroups(r.peaks).major.length} · Fit RMSE: ${fmt(r.relative_complex_RMSE_percent)}%${r.relative_complex_RMSE_percent>5?' · 해석 주의: 모델·측정 일관성 확인 필요':''} · ${kkSummary(m)} · 물리 검증: 미완료`:''}${m&&m.analysisVersion!==analysisVersion?' · 이전 계산 기준: 새 기준 적용은 재계산 필요':''}${note?' · '+note:''}`;};
    const syncMode=()=>{form.elements.lambda.disabled=entry.pending||form.elements.mode.value==='auto';form.elements.lambdaSlider.disabled=form.elements.lambda.disabled;};
    form.elements.mode.onchange=syncMode;
    setStatus('not calculated',missingFrequency?'frequency, Re(Z), Im(Z)가 필요합니다.':'');
    [...form.elements].forEach(e=>e.disabled=needsSelection);
    syncMode();
    const showResult=()=>{
      const r=entry.result;if(!r){details.replaceChildren();return;}
      const m=r.metadata;
      const names=assignments();
      const groups=peakGroups(r.peaks);
      const table=peaks=>`<div style="overflow-x:auto"><table><thead><tr><th>Peak</th><th>tau_peak / s</th><th>f_peak / Hz</th><th>R_region / Ω</th><th>Assignment</th></tr></thead><tbody>${peaks.map(p=>`<tr><td><details><summary>${esc(p.Peak)}${p.interpretationEligible===false?' · 대역 밖':''}</summary><small>τ: ${fmt(p.tau_a)} – ${fmt(p.tau_b)} s<br>Prominence: ${fmt(p.prominence)} Ω<br>Width: ${number(p.width_decades)===null?`${fmt(p.width_samples)} grid points`:`${fmt(p.width_decades)} decades`}<br>R_region = ∫ γ(ln τ) d(ln τ); 피크 높이가 아닙니다.${p.regionOutsideMeasuredBand?'<br>해석 주의: 적분 경계가 측정 대역 밖으로 이어집니다.':''}</small></details></td><td>${fmt(p.tau_peak)}</td><td>${fmt(p.f_peak)}</td><td title="${p.regionOutsideMeasuredBand?'외삽에 의존하는 적분 경계':'ln tau 적분'}">${fmt(p.R_region)}${p.regionOutsideMeasuredBand?' *':''}</td><td><select data-peak-assignment data-peak="${esc(p.Peak)}" aria-label="${esc(p.Peak)} Assignment" style="width:auto;min-width:125px" ${!context()||entry.savingAssignments?'disabled':''}>${assignmentOptions.map(a=>`<option value="${a}" ${(names[p.Peak]||'Unassigned')===a?'selected':''}>${a}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="5">검출된 주요 피크가 없습니다.</td></tr>'}</tbody></table></div>`;
      const peakTable=`<section data-peak-card style="max-width:1050px;font-size:12px;margin:8px 0"><h3 style="font-size:13px;margin:6px 0">DRT Peaks · 사용자 해석</h3>${table(groups.major)}${groups.minor.length?`<details><summary>Additional minor peaks detected (${groups.minor.length})</summary>${table(groups.minor)}</details>`:''}<p style="margin:6px 0"><button type="button" data-save-assignments style="width:auto;padding:5px 10px" ${!context()||!r.peaks.length||entry.savingAssignments?'disabled':''}>Assignment 저장</button> <button type="button" data-export="peaks" style="width:auto;padding:5px 10px">피크 CSV</button> <span role="status">${esc(entry.assignmentNote||'Assignment: 사용자 해석만 표시 · 기본 Unassigned')}</span></p></section>`;
      const displayWarnings=r.warnings.map(warningText);
      details.innerHTML=`<p>Series resistance Rs: <strong>${fmt(m.Rs)} Ω</strong> · Series inductance L: <strong>${fmt(m.L*1e6)} µH</strong> (${m.includeL?'포함':'제외, 정확히 0'})</p><p>relative_complex_RMSE_percent: <strong>${fmt(r.relative_complex_RMSE_percent)}%</strong> · λ=${fmt(m.lambda)} · M=${m.M}</p><p>측정 시간 대역: ${fmt(m.measuredTimeBand[0])}–${fmt(m.measuredTimeBand[1])} s. 대역 밖 — 해석 주의.</p><p>제외 ${r.quality.excludedCount}행 · 중복 주파수 ${r.quality.duplicateFrequencyCount}행 (평균·삭제하지 않음)</p><ul>${displayWarnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><p>피크 구간은 이웃 최소값 사이의 수치적 구간입니다. 피크 위치만으로 SEI·전하 전달·이온 수송을 확정하지 않습니다. Rs는 피크가 아닙니다.</p><p>선택 구간 저항: ln(τ) 좌표에서 경계 보간 후 적분</p><label>τ 시작 / s <input data-tau-a type="number" step="any" value="${m.tau_min}"></label><label>τ 끝 / s <input data-tau-b type="number" step="any" value="${m.tau_max}"></label><button type="button" data-integrate>구간 적분</button><output data-integral></output><p><button type="button" data-export="drt">DRT CSV</button> <button type="button" data-export="fit">재구성 CSV</button> <button type="button" data-export="metadata">메타데이터 JSON</button> <button type="button" data-expand>DRT 확대</button></p>`;
      const reasons=document.createElement('p');
      // The editable peak table is visible; numerical diagnostics stay collapsed.
      details.innerHTML=peakTable+`<details style="font-size:13px;max-width:950px"><summary>분석 상세 · 오차 ${fmt(r.relative_complex_RMSE_percent)}% · 피크 ${r.peaks.length}개 · export</summary><p>${esc(kkSummary(m))} · diagnostic-only · 물리 검증: 미완료. KK 근사 모델의 수치 잔차만 확인하며, 작은 오차도 측정 선형성·정상성이나 저항의 물리적 의미를 증명하지 않습니다.${m.kkConsistency?` 차수: ${esc(m.kkConsistency.modelOrder??'—')} · μ: ${number(m.kkConsistency.mu)===null?'—':fmt(m.kkConsistency.mu)}.`:''}</p><p>정규화: ‖W(Ax−b)‖² + λ²‖D²x‖². 기존 수동 λ 의미는 유지됩니다. 다른 도구의 λ와 숫자만 비교하지 마세요. 작은 오차도 물리적 검증을 뜻하지 않습니다.</p>${details.innerHTML}</details>`;
      details.querySelectorAll('[data-peak-assignment]').forEach(select=>select.onchange=()=>{
        if(!current()||!context()||entry.savingAssignments)return;
        if(!assignmentOptions.includes(select.value))return;
        const values={...assignments()};
        if(select.value==='Unassigned')delete values[select.dataset.peak];else values[select.dataset.peak]=select.value;
        entry.assignmentDraft={context:context(),source:'user',values};
        entry.assignmentNote='미저장 변경 · Assignment 저장을 누르세요.';draw();showResult();
      });
      details.querySelector('[data-save-assignments]').onclick=async()=>{
        if(!current()||!context()||entry.savingAssignments)return;
        const record={context:context(),source:'user',values:assignments()};
        entry.savingAssignments=true;entry.assignmentNote='저장 중…';showResult();
        try {
          const response=await fetchJsonWithTimeout(`/api/datasets/${encodeURIComponent(d.id)}`,{method:'PATCH',headers:authHeaders({'Content-Type':'application/json'}),body:JSON.stringify({figureEdits:{eisDrtAssignments:record}})},15000);
          if(!current()||context()!==record.context)return;
          if(!response.res.ok)throw Error(apiErrorMessage(response.body,'Assignment 저장 실패'));
          d.figureEdits={...(d.figureEdits||{}),eisDrtAssignments:record};
          entry.assignmentDraft=record;entry.assignmentNote='Assignment 저장 완료';
        } catch(error){if(current()&&context()===record.context)entry.assignmentNote=`미저장 · ${error.message}`;}
        finally {entry.savingAssignments=false;if(current())showResult();}
      };
      const reasonLabels={missing_or_nonfinite_frequency:'주파수 누락·비유한값',nonpositive_frequency:'0 이하 주파수',missing_or_nonfinite_impedance:'임피던스 누락·비유한값'};
      reasons.textContent='제외 사유: '+(Object.entries(r.quality.excludedReasons||{}).map(([key,count])=>`${reasonLabels[key]||key} ${count}행`).join(' · ')||'없음');
      details.querySelector('details')?.append?.(reasons);
      details.querySelector('[data-integrate]').onclick=()=>{
        const out=details.querySelector('[data-integral]');
        try {out.textContent=` R_region = ${fmt(integrate(r.drt.map(p=>p.tau_s),r.drt.map(p=>p.gamma_ohm),Number(details.querySelector('[data-tau-a]').value),Number(details.querySelector('[data-tau-b]').value)))} Ω`;}
        catch(error){out.textContent=error.message;}
      };
      details.querySelectorAll('[data-export]').forEach(button=>button.onclick=()=>{
        const kind=button.dataset.export;
        const peakRows=r.peaks.map(p=>({...p,Assignment:assignments()[p.Peak]||'Unassigned'}));
        if(kind==='metadata')download('eis-drt-metadata.json',JSON.stringify({...m,quality:r.quality,warnings:r.warnings,peaks:peakRows,assignmentSource:'user interpretation, not automatic identification',assignmentContext:context()},null,2),'application/json');
        else if(kind==='peaks')download('eis-drt-peaks.csv',csv(['Peak','tau_peak','f_peak','R_region','Assignment'],peakRows));
        else if(kind==='drt')download('eis-drt.csv',csv(['tau_s','gamma_ohm'],r.drt));
        else download('eis-reconstruction.csv',csv(['frequency_Hz','z_real_raw_ohm','z_imag_raw_ohm','z_real_fit_ohm','z_imag_fit_ohm','residual_real','residual_imag'],r.reconstruction));
      });
      details.querySelector('[data-expand]').onclick=()=>{
        const dialog=document.createElement('dialog');
        dialog.innerHTML=`<button type="button">닫기</button><svg viewBox="0 0 950 600" width="900" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">${plot({x:85,y:55,w:800,h:440,title:'DRT — nonnegative RC model',xlabel:'τ / s',ylabel:'γ(ln τ) / Ω',points:r.drt.map(p=>({x:p.tau_s,y:p.gamma_ohm})),color:options.color,id:'drt',logX:true,band:m.measuredTimeBand,guide:interpretationBands(points,r.peaks),peaks:r.peaks,assignments:assignments()})}</svg>${legend}`;
        host.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.showModal();
      };
    };
    showResult();
    if(entry.result)setStatus('completed');
    form.addEventListener('input',()=>{
      entry.revision++;
      entry.autoAttempted=true;
      if(entry.result){entry.result=null;showResult();draw();setStatus('stale','설정 변경 · 다시 계산하세요.');}
    });
    const calculate=async()=>{
      if(entry.pending||!current())return;
      entry.autoAttempted=true;
      if(needsSelection){status.textContent='측정 구간을 하나 선택하세요. 여러 구간을 한 DRT로 계산하지 않습니다.';return;}
      if(!validPoints.length){status.textContent='DRT 계산에는 frequency, Re(Z), Im(Z)가 필요합니다.';return;}
      if(new Set(validPoints.map(p=>p.frequency_Hz)).size<3){status.textContent='DRT 계산에는 서로 다른 양의 주파수가 최소 3개 필요합니다.';return;}
      entry.revision++;entry.result=null;showResult();draw();
      const requestRevision=entry.revision;
      entry.settings={M:Number(form.elements.M.value),lambda:Number(form.elements.lambda.value),includeL:form.elements.includeL.checked,mode:form.elements.mode.value};
      if(entry.spectrumIndex!==null)entry.settings.spectrumIndex=entry.spectrumIndex;
      if(selector)selector.disabled=true;
      entry.pending=true;[...form.elements].forEach(e=>e.disabled=true);setStatus('calculating');
      try {
        const health=await fetchJsonWithTimeout('/api/health',{},15000);
        if(!current()||entry.revision!==requestRevision)return;
        if(!health.res.ok||health.body.eisDrtAnalysisVersion!==analysisVersion)throw Error('새 DRT 계산 기준을 적용하려면 포탈 서버 업데이트·재시작 후 다시 계산하세요.');
        if(entry.spectrumIndex!==null&&health.body.eisDrtSpectrumSelection!==true)throw Error('현재 백엔드가 구간 선택을 지원하지 않습니다. 포탈 서버 업데이트·재시작 후 다시 계산하세요.');
        const response=await fetchJsonWithTimeout(`/api/datasets/${encodeURIComponent(d.id)}/analyses`,{method:'POST',headers:authHeaders({'Content-Type':'application/json'}),body:JSON.stringify({analysisName:'eis-drt',parameters:entry.settings})},120000);
        if(!current()||entry.revision!==requestRevision)return;
        if(!response.res.ok)throw Error(apiErrorMessage(response.body,'DRT 계산에 실패했습니다. 백엔드 버전과 입력값을 확인하세요.'));
        if(entry.spectrumIndex!==null && response.body.result?.metadata?.spectrumIndex!==entry.spectrumIndex)throw Error('현재 백엔드가 구간 선택을 지원하지 않습니다. 포탈 서버 업데이트·재시작 후 다시 계산하세요.');
        if(entry.settings.mode==='auto'&&response.body.result?.metadata?.autoSelectionReliable!==true)throw Error(response.body.result?.metadata?.autoSelection?.reason==='poor_model_fit'?'자동 λ 채택 안 함: RC 모델 재구성 오차가 5%를 넘습니다. 측정 일관성을 확인한 뒤 수동 계산하세요.':'자동 λ 선택이 불확실합니다. 수동 λ를 선택하고 계산 버튼을 누르세요.');
        if(!matches(response.body.result,points))throw Error('저장된 데이터와 현재 표시 데이터가 다릅니다. 표 저장 또는 Dataset 새로고침 후 다시 계산하세요.');
        entry.result=response.body.result;
        entry.runId=response.body.id;entry.assignmentDraft=null;entry.assignmentNote='';
        entry.settings.lambda=entry.result.metadata.lambda;
        form.elements.lambda.value=entry.settings.lambda;
        form.elements.lambdaSlider.value=Math.log10(Math.max(1e-6,entry.settings.lambda));
        draw();showResult();setStatus('completed');
      } catch(error) {if(current()&&entry.revision===requestRevision){entry.result=null;draw();showResult();setStatus('failed',error.message||'계산 버튼으로 다시 시도하세요.');}}
      finally {entry.pending=false;if(current()&&entry.revision===requestRevision){[...form.elements].forEach(e=>e.disabled=false);if(selector)selector.disabled=false;syncMode();}}
    };
    form.onsubmit=event=>{event.preventDefault();return calculate();};
    $('smartFile')?.addEventListener('change',()=>{
      if(!current())return;
      entry.revision++;entry.autoAttempted=true;entry.result=null;draw();showResult();
      [...form.elements].forEach(e=>e.disabled=true);
      status.textContent='선택 파일이 변경되어 이전 DRT 결과를 지웠습니다. 새 Dataset을 생성하거나 저장된 Fig를 다시 여세요.';
    },{signal:viewEvents.signal});
    // Restore first; only a complete, newly loaded view attempts automatic fitting once.
    if(!needsSelection&&!entry.result&&!entry.loaded&&!entry.pending&&d.id){
      entry.loaded=true;
      const revision=entry.revision;
      fetchJsonWithTimeout(`/api/datasets/${encodeURIComponent(d.id)}/analyses`,{headers:authHeaders()},15000).then(response=>{
        if(!current()||entry.pending||entry.revision!==revision||!response.res.ok)return;
        const saved=Array.isArray(response.body)?response.body.find(run=>run.analysisName==='eis-drt'&&matches(run.result,points)):null;
        if(saved){
          if(saved.result.metadata.mode==='auto'&&saved.result.metadata.autoSelectionReliable!==true){entry.autoAttempted=true;setStatus('not calculated','이전 자동 λ 선택 불확실 · 수동 계산이 필요합니다.');return;}
          entry.result=saved.result;
          entry.runId=saved.id;entry.assignmentDraft=null;entry.assignmentNote='';
          const m=saved.result.metadata;
          entry.settings={M:m.M,lambda:m.lambda,includeL:m.includeL,mode:m.mode};
          form.elements.M.value=m.M;form.elements.lambda.value=m.lambda;
          form.elements.includeL.checked=m.includeL;form.elements.mode.value=m.mode;
          form.elements.lambdaSlider.value=Math.log10(Math.max(1e-6,m.lambda));
          syncMode();draw();showResult();setStatus('completed');
        } else if(!entry.autoAttempted&&entry.settings.mode==='auto'&&allPoints.every(valid)&&points.every(valid)&&points.length>=3&&new Set(points.map(p=>p.frequency_Hz)).size>=3&&allPoints.length<=2000){
          return calculate();
        }
      }).catch(()=>{if(current())setStatus('not calculated','저장 결과 확인 실패 · 계산 버튼으로 다시 시도하세요.');});
    }
  }
  return {normalizeRows,coordinates,matches,integrate,csv,svg,render,frequencyRanges,tauBounds,interpretationBands,assignmentContext,readAssignments,screenSize,peakGroups,foldRawData};
})();
if (typeof module !== 'undefined') module.exports=EisDrt;
