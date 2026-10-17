"""Serveur local Warrenfall avec pages d'erreur personnalisées."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class GameHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        parts = unquote(urlsplit(self.path).path).split('/')
        if any(part.startswith('.') and part not in ('', '.', '..') for part in parts):
            self.send_error(403)
            return None
        return super().send_head()

    def send_error(self, code, message=None, explain=None):
        if code in (403, 404):
            content = (ROOT / f'{code}.html').read_bytes()
            self.send_response(code)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(content)
            return
        super().send_error(code, message, explain)


def make_server(port=8001):
    return ThreadingHTTPServer(('127.0.0.1', port), partial(GameHandler, directory=str(ROOT)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8001)
    args = parser.parse_args()
    with make_server(args.port) as server:
        print(f'Warrenfall : http://localhost:{server.server_port}/', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
