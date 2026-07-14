# Public access setup

This app is currently a local Node server. A `172.x`, `192.168.x`, or `127.0.0.1`
address only works on the same network. To let people on different Ethernet,
different Wi-Fi, or outside the lab open the page, use one of these options.

## Best option: deploy to a cloud server

Deploy this folder:

```text
outputs/data-portal
```

### Render example

1. Put `outputs/data-portal` in a GitHub repository.
2. In Render, create a new **Web Service** from that repository.
3. Set the root directory to `outputs/data-portal` if the whole Codex folder was uploaded.
4. Use this build command:

```bash
pip install -r requirements.txt
```

5. Use this start command:

```bash
npm start
```

6. Add a persistent disk/volume and set `DATA_DIR` to that mount path.

Start command:

```bash
npm start
```

Environment variables:

```text
PORT=4173
DATA_DIR=/data
PYTHON=python
```

Use a persistent disk/volume mounted at `/data`, otherwise saved figures and
users can disappear when the cloud server restarts.

## Temporary option: tunnel

Use a tunnel service such as Cloudflare Tunnel or ngrok to expose local port
`4173`. This is quick for testing, but less suitable for permanent lab data.

## Local network only

If everyone is on the same Wi-Fi/LAN, use the local IP:

```text
http://<this-computer-ip>:4173/
```

This does not work across different networks unless router port-forwarding or
a tunnel/cloud server is used.
