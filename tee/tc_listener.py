#!/usr/bin/python3

import argparse
import asyncio
import os
import tempfile
from quart import Quart, jsonify, make_response, request

# +---------------------------------------------------------------------------+
# |                           ENVIRONMENT VARIABLES                           |
# +---------------------------------------------------------------------------+

app = Quart("TCF Listener")

# +---------------------------------------------------------------------------+
# |                               APP ENDPOINTS                               |
# +---------------------------------------------------------------------------+

def jsonifySuccess(data): return jsonify({ 'ok': True,  'errorMessage': "",  'data': data })
def jsonifyFailure(msg):  return jsonify({ 'ok': False, 'errorMessage': msg, 'data': {}   })

async def run(cmd):
	proc = await asyncio.create_subprocess_shell(cmd)
	await proc.wait()
	print(f'[{cmd!r} exited with {proc.returncode}]')

async def proccessRequest(req):
	mode = 1
	prefix = '/app/mode_hw/tee/inputs/' if mode == 1 else '/app/mode_sim/data/'
	path   = '/app/mode_hw/'            if mode == 1 else '/app/mode_sim/'

	fd, fp = tempfile.mkstemp(prefix=prefix)
	try:
		with os.fdopen(fd, 'w') as file:
			file.write(req)
			await run(f'/bin/bash {path}/run.sh {fp.split("/")[-1]}')
	finally:
		os.remove(fp)

@app.route('/', methods=['POST'])
async def index(*args,**kwargs):
	req = await request.data
	# asyncio.create_task(proccessRequest(req.decode()))
	asyncio.get_event_loop().create_task(proccessRequest(req.decode()))
	return await make_response(jsonifySuccess(req.decode()))

@app.errorhandler(404)
async def not_found(error):
	return await make_response(jsonifyFailure('Not found'), 404)

# +---------------------------------------------------------------------------+
# |                                   MAIN                                    |
# +---------------------------------------------------------------------------+
if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--host', type=str, default='0.0.0.0', help='REST api host - default: 0.0.0.0')
	parser.add_argument('--port', type=int, default=5000,      help='REST api port - default: 5000'   )
	params = parser.parse_args()

	# RUN DAEMON
	app.run(host=params.host, port=params.port, debug=False)
