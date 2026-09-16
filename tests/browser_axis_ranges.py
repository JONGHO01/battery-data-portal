"""Disposable axis form/renderer QA; synthetic points and memory-only saves."""
from http.server import BaseHTTPRequestHandler, HTTPServer
import re
from test_axis_range_behavior import ROOT, SETUP, helpers


def main():
    source = (ROOT / "public/app.js").read_text(encoding="utf-8")
    html = (ROOT / "public/index.html").read_text(encoding="utf-8")
    form = re.search(r'<details class="figureRangeEditor">.*?</details>', html, re.S).group()
    form = form.replace('<details ', '<details open ')
    functions = helpers()
    for name in ("drawPaperAxes", "integerTicks", "changeFigureAxisRangeTarget"):
        functions += "\n" + re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S).group()
    setup = re.sub(r'const elements=.*?;\n', 'const $=id=>document.getElementById(id);\n', SETUP)
    setup = setup.replace('const renderCurrent=()=>{};', '')
    setup = re.sub(r'const drawPaperAxes=.*?;\n', '', setup, flags=re.S)
    setup = setup.replace('const saveFigureEdits=()=>saved.push(structuredClone(style));',
        "const saveFigureEdits=()=>{saved.push(structuredClone(style));$('saved').textContent=JSON.stringify(saved.at(-1).axisRanges);};")
    bindings = "\n".join(line for line in source.splitlines() if re.match(
        r'  on\("(?:applyFigureAxisRange|resetFigureAxisRange|figureAxisRangeTarget)"', line))
    page = '''<!doctype html><html lang="ko"><meta charset="utf-8"><title>Axis range QA</title>
<link rel="stylesheet" href="/style.css"><style>
main{max-width:1100px;margin:24px auto}.qaPlot svg{width:640px;height:480px;display:block;margin:auto}
.qaPlot .frame,.qaPlot .axis{fill:none;stroke:#334155}.qaPlot .grid{stroke:#e5e7eb}
.qaPlot .capLine,.qaPlot .profileLine{fill:none;stroke:#0f766e;stroke-width:2}
.qaPlot circle{fill:white;stroke:#0f766e}.qaPlot text{font:12px sans-serif;fill:#334155}
</style><main><h1>축 범위 검증 — 합성 데이터 / 실제 저장 없음</h1>''' + form + '''
<button id="restore">저장 범위 다시 열기</button><p id="view"></p><p id="domains"></p>
<div id="figureTitle"></div><div id="figureSubtitle"></div><div id="metaGrid" hidden></div>
<div id="figureCanvas" class="qaPlot"></div><pre id="saved"></pre><p id="status"></p></main><script>
''' + setup + functions + '''
function renderCurrent(){
 scales=[];
 const view=activeCycFigureViewKind(fixture);$('view').textContent='View: '+view;
 if(view==='voltage-profile'){
   $('figureCanvas').innerHTML='<svg viewBox="0 0 640 480">'+cycProfilePanel({x:90,y:45,w:510,h:370,profile,style})+'</svg>';
 }else{renderCycPerformanceFigure(fixture);}
 $('domains').textContent='Domains: '+JSON.stringify(scales);
}
const on=(id,event,handler)=>$(id).addEventListener(event,handler);
''' + bindings + '''
$('restore').onclick=()=>{if(!saved.length)return;style=JSON.parse(JSON.stringify(saved.at(-1)));syncFigureAxisRangeControls();renderCurrent();};
renderCurrent();
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
