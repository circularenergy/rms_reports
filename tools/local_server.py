"""Local static host only. The GitHub deployment needs no server process."""
import argparse,functools,http.server,socket,sys,webbrowser
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--host',default='127.0.0.1');p.add_argument('--port',type=int,default=5500);p.add_argument('--open',action='store_true');a=p.parse_args()
root=Path(__file__).resolve().parent.parent
class Handler(http.server.SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store');super().end_headers()
class LocalServer(http.server.ThreadingHTTPServer):
 allow_reuse_address=False
 def server_bind(self):
  if hasattr(socket,'SO_EXCLUSIVEADDRUSE'):
   self.socket.setsockopt(socket.SOL_SOCKET,socket.SO_EXCLUSIVEADDRUSE,1)
  super().server_bind()
try: server=LocalServer((a.host,a.port),functools.partial(Handler,directory=str(root)))
except OSError as e:
 print('ERROR: Cannot start this project on '+a.host+':'+str(a.port)+'. The port may be occupied. Stop the old server or edit config/local-server.cmd and permit that URL in Supabase.');sys.exit(1)
url='http://'+a.host+':'+str(a.port)+'/'
print('Serving '+str(root)+' at '+url+' — stop with Ctrl+C',flush=True)
if a.open:webbrowser.open(url)
try:server.serve_forever()
except KeyboardInterrupt:print('Server stopped.')
finally:server.server_close()
