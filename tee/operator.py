#!/bin/python3

import argparse
import json
import re
import os
import web3
from web3          import Web3, HTTPProvider
from web3.contract import Contract

# Types → Success → Value (positive values are reward, negative values are penalty)
businessRules = {
	0: { True:  +1, False:  -1},
	1: { True:  +5, False:  -3},
	2: { True: +10, False:  -6},
	3: { True: +25, False: -10},
}

didToAddr = lambda did: Web3.toChecksumAddress(re.search('^did:ethr:[0-9a-f]{0,24}([0-9a-f]{40})$', did).group(1))

class EEAOperator:
	def __init__(self, config):
		self.contract = Web3(HTTPProvider(config.gateway)).eth.contract(        \
			address=config.address,                                             \
			abi=json.load(open(f'{config.contracts}/EEAOperator.json'))['abi'], \
			ContractFactoryClass=Contract,                                      \
		)
		self.account = web3.Account.privateKeyToAccount(os.environ['enclave_key'])

	def issue_burn_tokens(self, data):
		organizationID = didToAddr(data['organization_ID'])
		operations = [
			(
				organizationID,
				didToAddr(request['account']),
				businessRules[request['type']][request['success']]
			)
			for request in data['token_request']
		]

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
		raise NotImplementedError

	def share(self, data):
		raise NotImplementedError


if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--input',     type=str, default='/encryptedInputs/eeaToken.json')
	parser.add_argument('--gateway',   type=str, default='http://localhost:8545')
	parser.add_argument('--contracts', type=str, default='.')
	parser.add_argument('--address',   type=str, default='0xd4c2F43544e2453b99770c1188A039E7bee4Ac41')
	config = parser.parse_args()

	eeaoperator = EEAOperator(config)

	with open(config.input) as file:
		[ key, raw ] = re.search('(\w*)\[\]:(.*)', file.read()).groups()
	try:
		getattr(eeaoperator, key)(json.loads(raw))
	except NotImplementedError:
		print(f'[Error] {key} is not implemented')
