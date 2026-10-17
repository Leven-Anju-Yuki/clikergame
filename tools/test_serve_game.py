import importlib.util
from pathlib import Path
import threading
import unittest
from urllib.request import urlopen, Request
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location('serve_game', Path(__file__).with_name('serve-game.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ServerTest(unittest.TestCase):
    def test_custom_errors_without_service_worker(self):
        with module.make_server(0) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            base = f'http://127.0.0.1:{server.server_port}'
            try:
                for path, code in [('/iindex.html', 404), ('/inconnu/page.html', 404), ('/.env', 403)]:
                    with self.assertRaises(HTTPError) as caught:
                        urlopen(base + path)
                    self.assertEqual(caught.exception.code, code)
                    self.assertIn(f'error-{code}.png', caught.exception.read().decode())
                    caught.exception.close()
                with urlopen(base + '/assets/icons/error-404.png') as image:
                    self.assertEqual(image.status, 200)
                    image.read()
                with urlopen(base + '/index.html') as page:
                    self.assertIn('gameRoot', page.read().decode())
                with self.assertRaises(HTTPError) as caught:
                    urlopen(Request(base + '/iindex.html', method='HEAD'))
                self.assertEqual(caught.exception.read(), b'')
                caught.exception.close()
            finally:
                server.shutdown()
                thread.join()


if __name__ == '__main__':
    unittest.main()
