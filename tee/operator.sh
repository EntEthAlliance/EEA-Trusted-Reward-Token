#!/bin/bash

export WEB3_PROVIDER_URI=https://u0a28iodso:ODoDt4BWc25KC3UhCDKH7YimdzRNZyUnnD8p0Yk0G3o@u0mk4ij9wg-u0o7d9q03b-rpc.us0-aws.kaleido.io
export enclave_key=0xeb4d187ea8b589ac0658ae90df0c89b803b993eb574ae448469b73624020a7bc
python operator.py --input eeaToken_issue.json --address 0xD8ef41b5746c0a22A022AF4eB472b6654d2735df
