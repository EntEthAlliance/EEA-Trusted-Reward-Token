#!/bin/python3

import argparse
import functools
import json
import operator
import os
import re
from web3.auto        import w3
from web3.contract    import Contract
from web3.middleware  import construct_sign_and_send_raw_middleware, geth_poa_middleware

# Types => Success => Value (positive values are reward, negative values are penalty)
businessRules = {
	0: { True:  +1, False:  -1},
	1: { True:  +5, False:  -3},
	2: { True: +10, False:  -6},
	3: { True: +25, False: -10},
}

didToAddr = lambda did: w3.toChecksumAddress(re.search('^did:ethr:[0-9a-f]{0,24}([0-9a-f]{40})$', did).group(1))

class EEAOperator:
	def __init__(self, config):
		self.contract = w3.eth.contract(                                        \
			address=config.address,                                             \
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

		self.contract.functions.batchMintRewards(
			[  orgId for (orgId, addr, value) in operations if value > 0 ],
			[   addr for (orgId, addr, value) in operations if value > 0 ],
			[ +value for (orgId, addr, value) in operations if value > 0 ]
		).transact({ 'from': self.account.address })

		self.contract.functions.batchMintPenalties(
			[  orgId for (orgId, addr, value) in operations if value < 0 ],
			[   addr for (orgId, addr, value) in operations if value < 0 ],
			[ -value for (orgId, addr, value) in operations if value < 0 ]
		).transact({ 'from': self.account.address })

	def redeem(self, data):
		raise NotImplementedError("Redeem: What should I do?")


if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--input',   type=str, default='/encryptedInputs/eeaToken.json')
	parser.add_argument('--abis',    type=str, default='.')
	parser.add_argument('--address', type=str, default='0xE778DC1eC36aa3625A99AF70318c5c78f8c8ae32')
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
