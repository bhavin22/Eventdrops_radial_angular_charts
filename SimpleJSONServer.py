# adapted from https://pymotw.com/2/BaseHTTPServer/
from BaseHTTPServer import BaseHTTPRequestHandler
import urlparse
import json
import os


class GetHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed_path = urlparse.urlparse(self.path)
        f = open(os.curdir + os.sep + parsed_path.path, 'rb') #self.path has /test.html
        self.send_response(200)
        self.end_headers()
        self.wfile.write(f.read())
        f.close()
        return


if __name__ == '__main__':
    from BaseHTTPServer import HTTPServer
    server = HTTPServer(('localhost', 9999), GetHandler)
    print('Starting server, use <Ctrl-C> to stop')
    server.serve_forever()