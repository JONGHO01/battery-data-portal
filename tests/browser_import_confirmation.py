"""Disposable UI-only harness: real dialog/helper, fake API, no disk data writes.

Run directly, open the printed loopback URL, stop with Ctrl+C after verification.
Backend persistence is separately covered by test_dataset_imports.py.
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import re
import json
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tests.test_import_confirmation_ui import duplicate_response_body


def main():
    source = (Path(__file__).resolve().parents[1] / "public/app.js").read_text(encoding="utf-8")
    helper = "\n".join(re.search(r"^(?:async )?function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S).group()
                       for name in ("confirmImportReplacement", "postDatasetImport"))
    page = '''<!doctype html><html lang="ko"><meta charset="utf-8"><title>Import confirmation QA</title>
<link rel="stylesheet" href="/style.css"><h1>중복 파일 확인 — 테스트 전용</h1><p>실제 파일 및 데이터베이스는 사용하지 않습니다.</p>
<button id="run">동일 제목 테스트 업로드</button><button id="reset">초기화</button>
<pre id="result">기존: same.csv / 요청: 0</pre><script>
let calls=0;
const state={datasets:[{id:'old'}],filtered:[{id:'old'}]};
const authHeaders=x=>x;
async function fetchJsonWithTimeout(url,opts){
 calls++;
 const value=JSON.parse(opts.body);
 if(!value.replaceExisting)return {res:{ok:false,status:409},body:RESPONSE_BODY};
 return {res:{ok:true,status:201},body:{dataset:{id:'new'},deletedIds:['old'],deleteFailures:[]}};
}
''' + helper + '''
document.getElementById('run').onclick=async()=>{
 const r=await postDatasetImport({sourceName:'same.csv'});
 document.getElementById('result').textContent=JSON.stringify({ok:r.res.ok,requests:calls,
 oldPreserved:state.datasets.some(x=>x.id==='old'),saved:r.body.id||null,message:r.body.detail||''},null,2);
};
document.getElementById('reset').onclick=()=>location.reload();
</script></html>'''
    page = page.replace("RESPONSE_BODY", json.dumps(duplicate_response_body()))
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/style.css":
                css = (Path(__file__).resolve().parents[1] / "public/style.css").read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/css")
                self.end_headers()
                self.wfile.write(css)
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page.encode("utf-8"))
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
