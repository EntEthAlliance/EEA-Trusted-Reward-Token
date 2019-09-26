#!/bin/python3

import argparse
import functools
import json
import operator
import os
import os.path
import re
import sys
from web3.auto       import w3
from web3.middleware import construct_sign_and_send_raw_middleware, geth_poa_middleware

# Types => Success => Value (positive values are reward, negative values are penalty)
businessRules = {
	1: { True: +10,    False: -10},
	2: { True: +5,     False: -10},
	3: { True: +100,   False: -10},
	4: { True: +200,   False: -10},
	5: { True: +1000,  False: -10},
	6: { True: +2000,  False: -10},
	7: { True: +10000, False: -10},
}

didToAddr = lambda did: w3.toChecksumAddress(re.search('^did:ethr:[0-9a-fA-F]{0,24}([0-9a-fA-F]{40})$', did).group(1))

class EEAOperator:
	def __init__(self, config):
		self.contract = w3.eth.contract(                                   \
			address=config.address,                                        \
			abi=json.load(open(f'{config.abis}/EEAOperator.json'))['abi'], \
		)
		self.account = w3.eth.account.from_key(os.environ['enclave_key'])
		w3.middleware_onion.add(construct_sign_and_send_raw_middleware(self.account))
		w3.middleware_onion.inject(geth_poa_middleware, layer=0)

	def issue_burn_tokens(self, data):
		operations = functools.reduce(
			operator.iconcat,
			[
				(
					(
						didToAddr(request_block['organization_ID']),
						didToAddr(request['account']),
						businessRules[request['type']][request['success']]
					)
					for request in request_block['token_request']
				)
				for request_block in data
			],
			[]
		)

		tx = self.contract.functions.batchMintRewards(
			[  orgId for (orgId, addr, value) in operations if value > 0 ],
			[   addr for (orgId, addr, value) in operations if value > 0 ],
			[ +value for (orgId, addr, value) in operations if value > 0 ]
		).transact({ 'from': self.account.address })
		print(f'batchMintRewards: {tx.hex()}')

		tx = self.contract.functions.batchMintPenalties(
			[  orgId for (orgId, addr, value) in operations if value < 0 ],
			[   addr for (orgId, addr, value) in operations if value < 0 ],
			[ -value for (orgId, addr, value) in operations if value < 0 ]
		).transact({ 'from': self.account.address })
		print(f'batchMintPenalties: {tx.hex()}')

	def redeem(self, data):
		for block in data:
			tx = self.contract.functions.burnRewards(
				didToAddr(block['organization_ID']),
				block['redeem_token'],
				''
			).transact({ 'from': self.account.address })
			print(f'burnRewards: {tx.hex()}')

if __name__ == '__main__':
	print ("EEA trusted token execution logic starts running in TEE.")
	# Only the EEA admin or organization owner is able to trigger the token request and then trigger
	# the TEE application running on worker.
	# the following 'runcounter' module is used to forbid the (malicious) worker to actively trigger
	# the same TEE application (i.e. hijack session information and run the Blockchain transaction
	# in the same session) multiple times by itself without being garanteed by EEA admin or
	# organization owner.
	counterFilePath = "/counter/runcounter"
	# read the runcounter file in a protected region to see whether the application has already
	# been triggered with the same session
	if os.path.isfile(counterFilePath):
		# malicious attacker could copy all the metadata with the same session, if the application
		# is already launched and runcounter (in the protected region) is recorded as 1 time,
		# application exists.
		with open(counterFilePath, "r") as countr:
			if countr.readline() == "1":
				sys.exit()
	else:
		# If it's the first time run with the current session, create runcounter to 1 and saves
		# the file in protected region.
		with open(counterFilePath, "w+") as countw:
			countw.write("1")

	# multiple requests can be done simultaneously, config reads the workorderid which corresponds to
	# the correct inputs file folder
	config = {}
	workorder_id = ""
	with open('/config') as f:
		for line in f:
			key, value = line.partition("=")[::2]
			config[key.strip()] = value.strip()
			if key.strip() == 'workorderid':
				workorder_id = value.strip()
	inputFile = '/encryptedInputs/' + workorder_id

	print (os.environ['enclave_key'])

	parser = argparse.ArgumentParser()
	parser.add_argument('--input',   type=str, default=inputFile)
	parser.add_argument('--abis',    type=str, default='/signer')
	parser.add_argument('--address', type=str, default='0xD8ef41b5746c0a22A022AF4eB472b6654d2735df')
	config = parser.parse_args()

	eeaoperator = EEAOperator(config)

	with open(config.input) as file:
		[ key, raw ] = re.search('(\w*)\[\]:(.*)', file.read()).groups()
	try:
		getattr(eeaoperator, key)(json.loads(raw))
	except NotImplementedError as e:
		print(f'[Error] {e}')
	except AttributeError as e:
		print(f'[Error] {e}')
