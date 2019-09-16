#!/usr/bin/python3

import argparse
import asyncio
import json
import os
import random
import tempfile
from quart import Quart, jsonify, make_response, request
from web3.auto import w3

NULL_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

# +---------------------------------------------------------------------------+
# |                           ENVIRONMENT VARIABLES                           |
# +---------------------------------------------------------------------------+

app = Quart('TCF Listener')

# +---------------------------------------------------------------------------+
# |                           BLOCKCHAIN ENDPOINTS                            |
# +---------------------------------------------------------------------------+

class Blockchain:
	def __init__(self, config):
		self.contract = w3.eth.contract(                                      \
			address=config.address,                                           \
			abi=json.load(open(f'{config.abis}/WorkerRegistry.json'))['abi'], \
		)

	def getRandomWorker(self, workerType=0, organizationId=NULL_BYTES32, appTypeId=NULL_BYTES32):
		[ _, _, ids ] = self.contract.functions.workerLookUp(workerType, organizationId, appTypeId).call()
		# worker_did = random.choice(ids)
		worker_did = NULL_BYTES32 # DEBUG
		[ status, workerType, organizationId, appTypeIds, details ] = self.contract.functions.workerRetrieve(worker_did).call()
		# data = json.loads(details)
		data = json.loads('{"IP": "40.91.240.124"}') # DEBUG
		return worker_did, data

# +---------------------------------------------------------------------------+
# |                               APP ENDPOINTS                               |
# +---------------------------------------------------------------------------+

def jsonifySuccess(data): return jsonify({ 'ok': True,  'errorMessage': '',  'data': data })
def jsonifyFailure(msg):  return jsonify({ 'ok': False, 'errorMessage': msg, 'data': {}   })

async def run(cmd):
	proc = await asyncio.create_subprocess_shell(cmd)
	await proc.wait()
	print(f'[{cmd!r} exited with {proc.returncode}]')

async def proccessRequest(req):
	_, data = blockchain.getRandomWorker()

	mode = 1
	prefix = '/app/mode_hw/tee/inputs/' if mode == 1 else '/app/mode_sim/data/'
	path   = '/app/mode_hw/'            if mode == 1 else '/app/mode_sim/'

	fd, fp = tempfile.mkstemp(prefix=prefix)
	try:
		with os.fdopen(fd, 'w') as file:
			file.write(req)
		await run(f'/bin/bash {path}/run.sh {fp.split("/")[-1]} {data["IP"]}')
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
	parser.add_argument('--host',    type=str, default='0.0.0.0', help='REST api host - default: 0.0.0.0')
	parser.add_argument('--port',    type=int, default=5000,      help='REST api port - default: 5000'   )
	parser.add_argument('--abis',    type=str, default='.')
	parser.add_argument('--address', type=str, default='0x692b4603339A28d951249824885Cae9f1Cb66DD0')
	params = parser.parse_args()

	blockchain = Blockchain(params)

	# RUN DAEMON
	app.run(host=params.host, port=params.port, debug=False)
