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

didToAddr = lambda did: web3.utils.normalizers.to_checksum_address(re.search('^did:ethr:[0-9a-f]{0,24}([0-9a-f]{40})$', did).group(1))

class EEAOperator:
	def __init__(self, config):
		self.contract = Web3(HTTPProvider(config.gateway)).eth.contract(        \
			address=config.address,                                             \
			abi=json.load(open(f'{config.contracts}/EEAOperator.json'))['abi'], \
			ContractFactoryClass=Contract,                                      \
		)
		self.account = web3.Account.privateKeyToAccount(os.environ['MNEMONIC2'])

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
	parser.add_argument('--gateway',   type=str, default='http://localhost:8545')
	parser.add_argument('--contracts', type=str, default='build/contracts')
	parser.add_argument('--address',   type=str, default='0x0000000000000000000000000000000000000000')
	eeaoperator = EEAOperator(parser.parse_args())

	# redeem[]:[{did:ethr:8a5d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741368,100},{did:ethr:111d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741301,90}]
	# share[]:[{did:ethr:8a5d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741368,{100, did:ethr:aaad93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741301},{200, did:ethr:bbbd93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741301}},{did:ethr:111d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741301,{400, did:ethr:222d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb841301},{500, did:ethr:333d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb841301}}]
	EXAMPLE = 'issue_burn_tokens[]:{"organization_ID":"did:ethr:8a5d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741368","token_request":[{"account": "did:ethr:8a5d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741361", "type":3, "success": true},{"account": "did:ethr:8a5d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741364", "type": 2, "success": true},{ "account": "did:ethr:8a5d93cc5613ab0ace80a282029ff721923325ce276db5cadcb62537bb741364", "type": 3, "success": false}]}'

	[ key, raw ] = re.search('(\w*)\[\]:(.*)', EXAMPLE).groups()

	try:
		getattr(eeaoperator, key)(json.loads(raw))
	except NotImplementedError:
		print(f'[Error] {key} is not implemented')
