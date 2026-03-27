#!/usr/bin/env python3
"""Dev server: serves static files + POST /save writes data.json."""
import json, os, subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler

REPO = os.path.dirname(os.path.abspath(__file__))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=REPO, **kw)

    def do_OPTIONS(self):
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path == '/save':
            try:
                length = int(self.headers.get('Content-Length', 0))
                data = json.loads(self.rfile.read(length))
                out = os.path.join(REPO, 'data.json')
                with open(out, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                self._cors()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"ok":true}')
            except Exception as ex:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(ex).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def _cors(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, fmt, *args):
        # Suppress noisy GET logs, keep POST /save visible
        if args and '/save' in str(args[0]):
            print(f'[save] {args[1]}')

os.chdir(REPO)
print(f'Serving {REPO} on http://localhost:3000')
HTTPServer(('', 3000), Handler).serve_forever()
