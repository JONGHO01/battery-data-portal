"""Isolated browser check of real annotation handlers, with in-memory persistence."""
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def main():
    source = (ROOT / "public/app.js").read_text(encoding="utf-8")
    names = ("clampFontSize", "currentAnnotations", "selectAnnotation", "addOrUpdateAnnotation",
             "applyAnnotationsToSvg", "attachAnnotationDrag", "clearAnnotations",
             "changeAnnotationSize", "saveFigureEdits", "persistFigureEdits", "annotationSvg")
    helpers = "\n".join(re.search(r"^(?:async )?function " + name + r"\([^\n]*\).*?^}",
                                 source, re.M | re.S).group() for name in names)
    # Use the actual event bindings, including IME-aware Enter behavior.
    bindings = "\n".join(line for line in source.splitlines() if re.match(
        r'  on\("(?:addAnnotation|updateAnnotation|clearAnnotations|saveFigureEdits)"', line))
    bindings += re.search(r'  on\("annotationText", "keydown",.*?^  }\);', source, re.M | re.S).group()
    page = '''<!doctype html><html lang="ko"><meta charset="utf-8"><title>Annotation QA</title>
<link rel="stylesheet" href="/style.css"><main style="padding:24px;max-width:1100px">
<h1>문구 추가 테스트 — 실제 데이터 변경 없음</h1>
<input id="annotationText" aria-label="그래프에 넣을 글"><input id="annotationSize" type="number" value="13">
<button id="addAnnotation">글 추가</button><button id="updateAnnotation" hidden>선택 글 수정</button>
<button id="saveFigureEdits">Fig 저장</button><button id="clearAnnotations">전체 삭제</button>
<button id="restore">저장본 다시 열기</button><button id="export">SVG 내보내기</button>
<svg id="paperFigure" viewBox="0 0 1000 500" style="width:100%;border:1px solid #ccc"></svg>
<pre id="saved"></pre><p id="status"></p></main><script>
const $=id=>document.getElementById(id);
const on=(id,event,handler)=>$(id).addEventListener(event,handler);
const state={selectedId:'qa',selectedAnnotation:null,datasets:[{id:'qa'}],filtered:[],annotations:{},figureStyles:{qa:{}}};
const currentLayoutEdits=()=>({});const currentFigureStyle=()=>state.figureStyles.qa;
const applyLayoutEditsToSvg=()=>{};
const renderCurrent=()=>applyAnnotationsToSvg();
const normalizeHexColor=x=>x;const normalizeProfileSeriesColorOverrides=x=>x;
const normalizeFigureAspectRatio=x=>x;const normalizeFigureMarkerSize=x=>x;
const normalizeFigureAxisRanges=x=>x;const sampleLabel=()=>'';
const authHeaders=x=>x;const loadCellWorkspace=()=>{};
const setStatus=x=>$('status').textContent=x;
const escapeXml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let stored=null;
const fetch=async(url,opts)=>{
 const value=JSON.parse(opts.body);
 await new Promise(resolve=>setTimeout(resolve,150));
 if(opts.method==='PATCH'){
   stored={id:'qa',figureEdits:value.figureEdits};
   $('saved').textContent=JSON.stringify(stored.figureEdits.annotations);
   return {ok:true,json:async()=>JSON.parse(JSON.stringify(stored))};
 }
 return {ok:true,json:async()=>({})};
};
''' + helpers + bindings + '''
$('restore').onclick=async()=>{
 await Promise.all(state.figureSaveQueues?.values()||[]);
 if(!stored)return;
 state.datasets=[structuredClone(stored)];state.annotations={};state.selectedAnnotation=null;renderCurrent();
};
$('export').onclick=()=>{
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob(['<svg xmlns="http://www.w3.org/2000/svg">'+annotationSvg()+'</svg>'],{type:'image/svg+xml'}));
 a.download='annotations-qa.svg';a.click();URL.revokeObjectURL(a.href);
};
</script></html>'''

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            css = self.path == "/style.css"
            self.send_response(200)
            self.send_header("Content-Type", "text/css" if css else "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write((ROOT / "public/style.css").read_bytes() if css else page.encode("utf-8"))

        def log_message(self, *_args):
            pass

    server = HTTPServer(("127.0.0.1", 0), Handler)
    print(f"http://127.0.0.1:{server.server_port}/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
