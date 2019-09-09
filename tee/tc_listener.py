#!/usr/bin/python3

import argparse
from flask import Flask, jsonify, make_response, request

# +---------------------------------------------------------------------------+
# |                           ENVIRONMENT VARIABLES                           |
# +---------------------------------------------------------------------------+
app = Flask("TCF Listener")

# +---------------------------------------------------------------------------+
# |                               APP ENDPOINTS                               |
# +---------------------------------------------------------------------------+

class RevertError(Exception): pass

def jsonifySuccess(data): return jsonify({ 'ok': True,  'errorMessage': "",  'data': data })
def jsonifyFailure(msg):  return jsonify({ 'ok': False, 'errorMessage': msg, 'data': {}   })

@app.route('/', methods=['POST'])
def index(*args,**kwargs):
	print(request.data)
	return make_response(jsonifySuccess(request.data.decode()))

@app.errorhandler(404)
def not_found(error):
	return make_response(jsonifyFailure('Not found'), 404)

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
