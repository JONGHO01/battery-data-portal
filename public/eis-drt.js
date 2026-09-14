/* EIS-only view and state. No routing, shared CSS, or global store changes. */
const EisDrt = (() => {
  const cache = new WeakMap();
  let viewEvents = null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = value => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
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
    return text;
  };
  function path(points,sx,sy) {
    return points.map((p,i)=>`${i && p.spectrumIndex === points[i-1].spectrumIndex && p.sweep === points[i-1].sweep ? 'L':'M'}${sx(p.x).toFixed(3)},${sy(p.y).toFixed(3)}`).join(' ');
  }
  function plot({x,y,w,h,title,xlabel,ylabel,points,fit=[],color,id,logX=false,band=null,empty='',domains=null,showGrid=true,connectPoints=true,markerSize=4}) {
    const all = [...points,...fit];
    const xx = all.map(p=>logX ? Math.log10(p.x) : p.x), yy = all.map(p=>p.y);
    const range = (values,zero) => {
      if (!values.length) return [0,1];
      let lo=Math.min(...values),hi=Math.max(...values);
      const padding = Math.max(hi-lo,Math.abs(hi)*.08,1e-9)*.07;
      if (zero) return [Math.min(0,lo-padding),Math.max(0,hi+padding)];
      return [lo-padding,hi+padding];
    };
    const xd=domains?.x || range(xx,!logX),yd=domains?.y || range(yy,true);
    if(id==='drt')yd[0]=0;
    const sx = value=>x+((logX?Math.log10(value):value)-xd[0])/(xd[1]-xd[0])*w;
    const sy = value=>y+h-(value-yd[0])/(yd[1]-yd[0])*h;
    const ticks = domain=>Array.from({length:5},(_,i)=>domain[0]+(domain[1]-domain[0])*i/4);
    const text = (tx,ty,value,anchor='start',size=12,extra='')=>`<text x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="${size}" ${extra}>${esc(value)}</text>`;
    let content = `<g data-eis-panel="${id}">${text(x,y-18,title,'start',id==='drt'?15:18,'font-weight="700"')}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" stroke="#1f2937"/>`;
    if (band && points.length) {
      const lo=Math.max(x,Math.min(x+w,sx(band[0]))),hi=Math.max(x,Math.min(x+w,sx(band[1])));
      content += `<rect x="${x}" y="${y}" width="${lo-x}" height="${h}" fill="#fef3c7"/><rect x="${hi}" y="${y}" width="${x+w-hi}" height="${h}" fill="#fef3c7"/>`;
    }
    for (const value of ticks(xd)) {
      const pos=x+(value-xd[0])/(xd[1]-xd[0])*w;
      if(showGrid)content+=`<line x1="${pos}" x2="${pos}" y1="${y}" y2="${y+h}" stroke="#cbd5e1" stroke-dasharray="2 6"/>`;
      content+=`${text(pos,y+h+19,logX?fmt(10**value):fmt(value),'middle')}`;
    }
    for (const value of ticks(yd)) {
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
    content+=text(x+w/2,y+h+38,xlabel,'middle',14);
    content+=`<text transform="translate(${x-52},${y+h/2}) rotate(-90)" text-anchor="middle" font-size="14">${esc(ylabel)}</text></g>`;
    return content;
  }
  function svg(points,result,options) {
    const {w,h,title,date}=options;
    const color=/^#[0-9a-f]{6}$/i.test(options.color)?options.color:'#14888a';
    const only=options.onlyNyquist;
    const side=only?Math.min(w-136,h-228):Math.max(300,Math.min(Math.round(w*.45),Math.round(h*.70)));
    const nx=only?Math.round((w-side)/2):68,ny=110;
    const panelGap=Math.min(140,Math.max(24,w-nx-side-68-230));
    const rx=nx+side+panelGap,rw=Math.max(230,w-rx-68),gap=82,rh=Math.max(120,(side-gap)/2);
    const coords=coordinates(points);
    const chartStyle={showGrid:options.showGrid!==false,connectPoints:options.connectPoints!==false,markerSize:options.markerSize};
    const byRow=new Map(points.map(p=>[p.rowIndex,p]));
    const fit=(result?.reconstruction||[]).map(p=>({x:p.z_real_fit_ohm,y:p.z_imag_fit_ohm,sweep:byRow.get(p.rowIndex)?.sweep,spectrumIndex:byRow.get(p.rowIndex)?.spectrumIndex}));
    let panels=plot({...chartStyle,x:nx,y:ny,w:side,h:side,title:'Nyquist plot',xlabel:"Z' / Ω",ylabel:"-Z'' / Ω",points:coords.left,fit:fit.map(p=>({...p,y:-p.y})),color,id:'left',empty:'유효한 Re(Z), Im(Z)가 없습니다.',domains:options.leftDomains});
    if (!only) {
      panels+=plot({...chartStyle,x:rx,y:ny,w:rw,h:rh,title:'DRT — nonnegative RC model',xlabel:'τ / s',ylabel:'γ(ln τ) / Ω',points:(result?.drt||[]).map(p=>({x:p.tau_s,y:p.gamma_ohm})),color,id:'drt',logX:true,band:result?.metadata.measuredTimeBand,empty:'아래에서 DRT 계산을 실행하세요.'});
      panels+=plot({...chartStyle,x:rx,y:ny+rh+gap,w:rw,h:rh,title:'Nyquist — Im(Z)',xlabel:'Re(Z) / Ω',ylabel:'Im(Z) / Ω',points:coords.right,fit,color,id:'imag'});
    }
    return `<svg id="paperFigure" class="eisDrtFigure" style="--figure-width:${w}px" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Noto Sans KR, Arial, sans-serif" fill="#475569"><rect width="${w}" height="${h}" fill="white"/><text x="72" y="48" font-size="18" font-weight="700" fill="#111827">${esc(title)}</text><text x="72" y="74" font-size="14">${esc(date)}</text>${panels}<text x="72" y="${Math.min(h-20,ny+side+78)}" font-size="12">○ 측정값 · 주황 점선: DRT 재구성 · 노란 영역: 측정 대역 밖 — 해석 주의</text></svg>`;
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
      entry={signature,result:null,settings:{M:100,lambda:1e-3,includeL:true,mode:'manual'},spectrumIndex:null,pending:false,revision:0};cache.set(d,entry);
    }
    const spectra=splitSpectra(allPoints);
    const needsSelection=spectra.length>1 && entry.spectrumIndex===null;
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
    host.innerHTML='<div data-eis-plot></div><div data-eis-controls></div>';
    const plotHost=host.querySelector('[data-eis-plot]'),controls=host.querySelector('[data-eis-controls]');
    const current=()=>host.contains(controls)&&cache.get(d)===entry&&JSON.stringify(normalizeRows(d.rows))===signature;
    const draw=()=>{plotHost.innerHTML=svg(points,entry.result,{...options,title:entry.spectrumIndex===null ? title : `${title} · 구간 ${entry.spectrumIndex+1}`});applyAnnotationsToSvg();};
    draw();
    const spectrumControl=spectra.length>1 ? `<label>측정 구간 선택 <select data-eis-spectrum><option value="">전체 ${spectra.length}구간 보기 · DRT 계산 전 구간 선택</option>${spectra.map((group,index)=>{
      const fs=group.filter(p=>p.frequency_Hz>0).map(p=>p.frequency_Hz);
      return `<option value="${index}" ${entry.spectrumIndex===index?'selected':''}>구간 ${index+1} · ${group.length}점 · ${fmt(fs[0])} → ${fmt(fs.at(-1))} Hz</option>`;
    }).join('')}</select></label><p>반복 측정과 주파수 진행 방향을 구분했습니다. 전체 보기에서는 구간 사이를 연결하지 않습니다. DRT는 선택한 한 구간만 계산합니다. 원본은 유지됩니다.</p>` : '';
    if (options.onlyNyquist) {
      controls.innerHTML=spectrumControl;
      const selector=controls.querySelector('[data-eis-spectrum]');
      if(selector)selector.onchange=()=>{entry.spectrumIndex=selector.value===''?null:Number(selector.value);entry.result=null;entry.loaded=false;entry.revision++;render(d);};
      return;
    }
    controls.innerHTML=`<details open><summary>DRT 설정 · 저장된 Dataset 기준</summary><p>기본 M=100, λ=0.001은 시작값이며 항상 최적은 아닙니다. 표를 수정했다면 표 저장 후 계산하세요. 계산 결과는 별도 분석 기록으로 저장됩니다.</p><form data-drt-form><label>M (20–200) <input name="M" type="number" min="20" max="200" step="1" value="${entry.settings.M}" required></label><label>λ (0–10) <input name="lambda" type="number" min="0" max="10" step="any" value="${entry.settings.lambda}" required></label><label>λ 로그 조절 (10⁻⁶–10¹) <input name="lambdaSlider" type="range" min="-6" max="1" step="0.1" value="${Math.log10(Math.max(1e-6,entry.settings.lambda))}"></label><label><input name="includeL" type="checkbox" ${entry.settings.includeL?'checked':''}> 직렬 L 포함</label><label>λ 선택 <select name="mode"><option value="manual">수동</option><option value="auto">L-curve 자동 탐색 (41개)</option></select></label><button type="submit">DRT 계산·저장</button></form><p data-drt-status role="status"></p><div data-drt-result></div></details>`;
    controls.innerHTML=spectrumControl+controls.innerHTML;
    const form=controls.querySelector('form'),status=controls.querySelector('[data-drt-status]'),details=controls.querySelector('[data-drt-result]');
    const selector=spectra.length>1 ? controls.querySelector('[data-eis-spectrum]') : null;
    if(selector)selector.onchange=()=>{
      if(entry.pending)return;
      entry.spectrumIndex=selector.value===''?null:Number(selector.value);entry.result=null;entry.loaded=false;entry.revision++;render(d);
    };
    form.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px';
    form.elements.includeL.style.width='auto';
    form.elements.mode.value=entry.settings.mode;
    form.elements.lambdaSlider.oninput=()=>{form.elements.lambda.value=(10**Number(form.elements.lambdaSlider.value)).toPrecision(5);};
    form.elements.lambda.oninput=()=>{form.elements.lambdaSlider.value=Math.log10(Math.max(1e-6,Number(form.elements.lambda.value)));};
    const validPoints=points.filter(valid),excluded=points.length-validPoints.length;
    const missingFrequency=validPoints.length===0;
    const qualityText=`DRT 유효 ${validPoints.length}행 / 제외 ${excluded}행 (주파수 누락·비유한값·f≤0 또는 임피던스 누락·비유한값). 원본은 삭제하지 않습니다.`;
    status.textContent=needsSelection?'측정 구간을 하나 선택하세요. 여러 구간을 섞은 DRT 결과는 표시하지 않습니다.':missingFrequency?'DRT 계산에는 frequency, Re(Z), Im(Z)가 필요합니다.':qualityText;
    [...form.elements].forEach(e=>e.disabled=needsSelection);
    const showResult=()=>{
      const r=entry.result;if(!r){details.replaceChildren();return;}
      const m=r.metadata;
      const displayWarnings=r.warnings.map(warningText);
details.innerHTML=`<p>Series resistance Rs: <strong>${fmt(m.Rs)} Ω</strong> · Series inductance L: <strong>${fmt(m.L*1e6)} µH</strong> (${m.includeL?'포함':'제외, 정확히 0'})</p><p>relative_complex_RMSE_percent: <strong>${fmt(r.relative_complex_RMSE_percent)}%</strong> · λ=${fmt(m.lambda)} · M=${m.M}</p><p>측정 시간 대역: ${fmt(m.measuredTimeBand[0])}–${fmt(m.measuredTimeBand[1])} s. 대역 밖 — 해석 주의.</p><p>제외 ${r.quality.excludedCount}행 · 중복 주파수 ${r.quality.duplicateFrequencyCount}행 (평균·삭제하지 않음)</p><ul>${displayWarnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><p>피크 구간은 이웃 최소값 사이의 수치적 구간입니다. 피크 위치만으로 SEI·전하 전달·이온 수송을 확정하지 않습니다. Rs는 피크가 아닙니다.</p><table><thead><tr><th>Peak</th><th>tau_peak / s</th><th>f_peak / Hz</th><th>R_region / Ω</th></tr></thead><tbody>${r.peaks.map(p=>`<tr><td>${esc(p.Peak)}</td><td>${fmt(p.tau_peak)}</td><td>${fmt(p.f_peak)}</td><td>${fmt(p.R_region)}</td></tr>`).join('')}</tbody></table><p>선택 구간 저항: ln(τ) 좌표에서 경계 보간 후 적분</p><label>τ 시작 / s <input data-tau-a type="number" step="any" value="${m.tau_min}"></label><label>τ 끝 / s <input data-tau-b type="number" step="any" value="${m.tau_max}"></label><button type="button" data-integrate>구간 적분</button><output data-integral></output><p><button type="button" data-export="drt">DRT CSV</button> <button type="button" data-export="fit">재구성 CSV</button> <button type="button" data-export="metadata">메타데이터 JSON</button> <button type="button" data-expand>DRT 확대</button></p>`;
      const reasons=document.createElement('p');
      const reasonLabels={missing_or_nonfinite_frequency:'주파수 누락·비유한값',nonpositive_frequency:'0 이하 주파수',missing_or_nonfinite_impedance:'임피던스 누락·비유한값'};
      reasons.textContent='제외 사유: '+(Object.entries(r.quality.excludedReasons||{}).map(([key,count])=>`${reasonLabels[key]||key} ${count}행`).join(' · ')||'없음');
      details.prepend(reasons);
      details.querySelector('[data-integrate]').onclick=()=>{
        const out=details.querySelector('[data-integral]');
        try {out.textContent=` R_region = ${fmt(integrate(r.drt.map(p=>p.tau_s),r.drt.map(p=>p.gamma_ohm),Number(details.querySelector('[data-tau-a]').value),Number(details.querySelector('[data-tau-b]').value)))} Ω`;}
        catch(error){out.textContent=error.message;}
      };
      details.querySelectorAll('[data-export]').forEach(button=>button.onclick=()=>{
        const kind=button.dataset.export;
        if(kind==='metadata')download('eis-drt-metadata.json',JSON.stringify({...m,quality:r.quality,warnings:r.warnings},null,2),'application/json');
        else if(kind==='drt')download('eis-drt.csv',csv(['tau_s','gamma_ohm'],r.drt));
        else download('eis-reconstruction.csv',csv(['frequency_Hz','z_real_raw_ohm','z_imag_raw_ohm','z_real_fit_ohm','z_imag_fit_ohm','residual_real','residual_imag'],r.reconstruction));
      });
      details.querySelector('[data-expand]').onclick=()=>{
        const dialog=document.createElement('dialog');
        dialog.innerHTML=`<button type="button">닫기</button><svg viewBox="0 0 950 600" width="900" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">${plot({x:85,y:55,w:800,h:450,title:'DRT — nonnegative RC model',xlabel:'τ / s',ylabel:'γ(ln τ) / Ω',points:r.drt.map(p=>({x:p.tau_s,y:p.gamma_ohm})),color:options.color,id:'drt',logX:true,band:m.measuredTimeBand})}</svg>`;
        host.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.showModal();
      };
    };
    showResult();
    form.addEventListener('input',()=>{
      entry.revision++;
      if(entry.result){entry.result=null;showResult();draw();status.textContent='설정이 변경되었습니다. DRT를 다시 계산하세요.';}
    });
    form.onsubmit=async event=>{
      event.preventDefault();if(entry.pending||!current())return;
      if(needsSelection){status.textContent='측정 구간을 하나 선택하세요. 여러 구간을 한 DRT로 계산하지 않습니다.';return;}
      if(!validPoints.length){status.textContent='DRT 계산에는 frequency, Re(Z), Im(Z)가 필요합니다.';return;}
      if(new Set(validPoints.map(p=>p.frequency_Hz)).size<3){status.textContent='DRT 계산에는 서로 다른 양의 주파수가 최소 3개 필요합니다.';return;}
      entry.revision++;entry.result=null;showResult();draw();
      const requestRevision=entry.revision;
      entry.settings={M:Number(form.elements.M.value),lambda:Number(form.elements.lambda.value),includeL:form.elements.includeL.checked,mode:form.elements.mode.value};
      if(entry.spectrumIndex!==null)entry.settings.spectrumIndex=entry.spectrumIndex;
      if(selector)selector.disabled=true;
      entry.pending=true;[...form.elements].forEach(e=>e.disabled=true);status.textContent='DRT 계산 중입니다. 완료 후 별도 분석 기록으로 저장합니다.';
      try {
        if(entry.spectrumIndex!==null){
          const health=await fetchJsonWithTimeout('/api/health',{},15000);
          if(!current()||entry.revision!==requestRevision)return;
          if(!health.res.ok||health.body.eisDrtSpectrumSelection!==true)throw Error('현재 백엔드가 구간 선택을 지원하지 않습니다. 포탈 서버 업데이트·재시작 후 다시 계산하세요.');
        }
        const response=await fetchJsonWithTimeout(`/api/datasets/${encodeURIComponent(d.id)}/analyses`,{method:'POST',headers:authHeaders({'Content-Type':'application/json'}),body:JSON.stringify({analysisName:'eis-drt',parameters:entry.settings})},120000);
        if(!current()||entry.revision!==requestRevision)return;
        if(!response.res.ok)throw Error(apiErrorMessage(response.body,'DRT 계산에 실패했습니다. 백엔드 버전과 입력값을 확인하세요.'));
        if(entry.spectrumIndex!==null && response.body.result?.metadata?.spectrumIndex!==entry.spectrumIndex)throw Error('현재 백엔드가 구간 선택을 지원하지 않습니다. 포탈 서버 업데이트·재시작 후 다시 계산하세요.');
        if(!matches(response.body.result,points))throw Error('저장된 데이터와 현재 표시 데이터가 다릅니다. 표 저장 또는 Dataset 새로고침 후 다시 계산하세요.');
        entry.result=response.body.result;draw();showResult();status.textContent=`계산·저장 완료. ${qualityText}`;
      } catch(error) {if(current()&&entry.revision===requestRevision){entry.result=null;draw();showResult();status.textContent=error.message||'DRT 계산 실패. 이전 결과는 표시하지 않습니다.';}}
      finally {entry.pending=false;if(current()&&entry.revision===requestRevision){[...form.elements].forEach(e=>e.disabled=false);if(selector)selector.disabled=false;}}
    };
    $('smartFile')?.addEventListener('change',()=>{
      if(!current())return;
      entry.revision++;entry.result=null;draw();showResult();
      [...form.elements].forEach(e=>e.disabled=true);
      status.textContent='선택 파일이 변경되어 이전 DRT 결과를 지웠습니다. 새 Dataset을 생성하거나 저장된 Fig를 다시 여세요.';
    },{signal:viewEvents.signal});
    // Read-only restoration; never auto-create a new analysis when opening a Fig.
    if(!needsSelection&&!entry.result&&!entry.loaded&&!entry.pending&&d.id){
      entry.loaded=true;
      const revision=entry.revision;
      fetchJsonWithTimeout(`/api/datasets/${encodeURIComponent(d.id)}/analyses`,{headers:authHeaders()},15000).then(response=>{
        if(!current()||entry.pending||entry.revision!==revision||!response.res.ok)return;
        const saved=Array.isArray(response.body)?response.body.find(run=>run.analysisName==='eis-drt'&&matches(run.result,points)):null;
        if(saved){
          entry.result=saved.result;
          const m=saved.result.metadata;
          entry.settings={M:m.M,lambda:m.lambda,includeL:m.includeL,mode:m.mode};
          form.elements.M.value=m.M;form.elements.lambda.value=m.lambda;
          form.elements.includeL.checked=m.includeL;form.elements.mode.value=m.mode;
          form.elements.lambdaSlider.value=Math.log10(Math.max(1e-6,m.lambda));
          draw();showResult();status.textContent=`저장된 DRT 결과. ${qualityText}`;
        }
      }).catch(()=>{if(current())status.textContent=`저장된 DRT 결과를 불러오지 못했습니다. ${qualityText}`;});
    }
  }
  return {normalizeRows,coordinates,matches,integrate,csv,svg,render};
})();
if (typeof module !== 'undefined') module.exports=EisDrt;
