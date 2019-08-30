# !/usr/bin/python3

import argparse
import asyncio
import json
import os
import web3
from web3          import Web3, HTTPProvider
from web3.contract import Contract


LISTENER_SLEEP_DURATION = 5 # seconds


class EventProcessor:
	async def listener(self, eventListener):
		while True:
			for event in eventListener.get_new_entries():
				await self.queue.put(event)
			await asyncio.sleep(LISTENER_SLEEP_DURATION)

	async def handler(self, callback):
		while True:
			event = await self.queue.get()
			callback(event)
			self.queue.task_done()

	async def start(self, eventListener, callback):
		self.queue = asyncio.Queue()
		self.listeners = [ asyncio.create_task(self.listener(eventListener)) for _ in range(1) ]
		self.handlers  = [ asyncio.create_task(self.handler(callback))       for _ in range(8) ]
		await asyncio.gather(*self.listeners) # infinite loop
		await queue.join() # this code should never run
		await self.stop() # this code should never run

	async def stop(self):
		for process in self.listeners: process.cancel()
		for process in self.handlers:  process.cancel()
		print("---exit---")



def handleEvent(event):
	value = event.args['value']
	print(f'handler got event with value {value}')
	Beacon.functions.ping(2*value+0).transact({ 'from': account.address })
	Beacon.functions.ping(2*value+1).transact({ 'from': account.address })



# contractList = [ 'EEAClaimsIssuer', 'EEAOperator' ]
contractList = [ 'Beacon' ]

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--gateway',   type=str, default='http://localhost:8545')
	parser.add_argument('--contracts', type=str, default='build/contracts')
	parser.add_argument('--address',   type=str, default='0x0000000000000000000000000000000000000000')
	config = parser.parse_args()

	account = web3.Account.privateKeyToAccount(os.environ['MNEMONIC2'])
	contracts = { filename: json.load(open('{}/{}.json'.format(config.contracts, filename))) for filename in contractList }

	w3 = Web3(HTTPProvider(config.gateway))
	Beacon = w3.eth.contract(         \
		address=config.address,         \
		abi=contracts['Beacon']['abi'], \
		ContractFactoryClass=Contract,  \
	)

	eventListener = Beacon.events.Pong.createFilter(fromBlock='latest')

	Beacon.functions.ping(1).transact({ 'from': account.address })

	try:
		daemon = EventProcessor()
		asyncio.get_event_loop().run_until_complete(daemon.start(eventListener, handleEvent))
	except KeyboardInterrupt:
		asyncio.get_event_loop().run_until_complete(daemon.stop())
