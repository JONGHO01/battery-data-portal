"""Disposable localhost UI fixture. Never opens the portal's real DB or B2."""
import os
import socket
import sys
import tempfile
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))


def main():
    with tempfile.TemporaryDirectory(prefix="battery-eis-drt-smoke-") as scratch:
        os.environ.update(DATA_DIR=scratch,SQLITE_DB=str(Path(scratch)/"test.sqlite3"),DATABASE_URL="",
                          APP_ENV="local",STORAGE_BACKEND="local",DATABASE_ROWS_MODE="full",RENDER="",
                          BOOTSTRAP_ADMIN_ID="drt-demo",BOOTSTRAP_ADMIN_NAME="DRT Test",
                          BOOTSTRAP_ADMIN_PASSWORD="test-only-drt-demo",JWT_SECRET="test-only-drt-secret",
                          ALLOW_LEGACY_USER_HEADER="false")
        import python_backend as portal
        import numpy as np
        import uvicorn
        portal.init_db()
        f=np.logspace(-2,6,161);w=2*np.pi*f
        z=3+1j*w*1e-6+5/(1+1j*w*1e-4)+15/(1+1j*w*.1)
        eis=[dict(frequency_Hz=float(a),z_real_ohm=float(b.real),z_imag_ohm=float(b.imag)) for a,b in zip(f,z)]
        fixtures=[("EIS-TWO-RC","eis","eis-combined",eis),
                  ("EIS-NO-FREQUENCY","eis","eis-combined",[{"zreal":5,"zimag":-2},{"zreal":6,"zimag":-3}]),
                  ("CYC-UNCHANGED","cyc","cycling-performance",[{"cycle":i,"capacity":150-i} for i in range(1,8)]),
                  ("CV-UNCHANGED","cv","cv-curve",[{"voltage":i/10,"current":float(np.sin(i/4))} for i in range(21)])]
        with portal.connect() as conn:
            for name,kind,figure,rows in fixtures:
                portal.save_dataset(conn,{"id":name,"ownerId":"drt-demo","ownerName":"DRT Test","dataType":kind,
                                          "sourceName":name+".csv","figureKind":figure,"rows":rows,"columns":list(rows[0]),
                                          "cell":{"cellId":name,"sampleName":name,"date":"2026-09-10"}})
        sock=socket.socket();sock.bind(("127.0.0.1",0))
        print(f"DRT_SMOKE_URL=http://127.0.0.1:{sock.getsockname()[1]}",flush=True)
        uvicorn.Server(uvicorn.Config(portal.app,log_level="warning")).run(sockets=[sock])


if __name__ == "__main__":
    main()
