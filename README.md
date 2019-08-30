# EEA-Trusted-Token
:tada:Welcome to the EEA Trusted Token central repo!:tada:

@see https://github.com/trufflesuite/truffle/releases

@see https://github.com/trufflesuite/truffle

@see http://web3js.readthedocs.io/en/1.0/

@see https://github.com/trufflesuite/ganache-core

## Background

EEA is launching a _trusted execution environment (TEE) testnet_ on top of a Blockchain network (Kaleido running the Pantheon client using tokenization features). 
The first use case is an EEA trusted reward token to incentivize EEA membership to participate more in EEA activities! 

## Token Descriptions

[Token Sequence Diagrams](ttf/grant-flow.md)

[TTF EEA Grant Specification](ttf/eea-grant-spec.json)
[TTF EEA Reward Specification](ttf/eea-reward-spec.json)
[TTF EEA Reputation Specification](ttf/eea-reputation-spec.json)
=======
There are **3 tokens** in the EEA Token ecosystem (EEA Reputation, EEA Reward, and EEA Penalty). 

The tokens are used to incentivize participation of EEA member organizations and their employees in EEA SIGs and TWGs. Tokens are issued for participation in EEA activities such as working group calls, deliverables or F2F meetings. The more committment that is required by a member organization to perform an activity, the higher the reward. If a member organization commits to something and does not deliver on the the committment, tokens are taken away from the organization's balance. 

The **EEA Reward Token** is used to incentivize participation of EEA member organizations and their employees in EEA SIGs and TWGs. Tokens are issued as "Grants" for participation in EEA activities such as working group calls, deliverables or F2F meetings. The **EEA Reward Token Grant** represents the potential reward that can be earned by following through with the commitment that the grant represents. The larger committment to perform and contribute towards an activity by an organization, the higher potential reward in the grant. The grant also has a potential negative reward if the commitment is not followed through. A grant has a vesting schedule that indicates when the tokens in the grant can be transformed. Tokens in the grant remain as potential until a vesting occurs. The number of vests defined in the schedule determines the percentage of the tokens in the grant that can be transformed for each vesting event. 

The token grant vests at the end of the organization's membership year where the token grant transitions or spawns into **two** different tokens, one that is Redemable and the other a Reputation.  The reputation token is a "Lifetime" score of reputation for an individual within the EEA. The Redemable token is transferable and can be spent, or burned, towards annual membership dues. The Reputation token is non-transferable.

Vesting of the grant issues Redemable tokens to the organization and the Reputation tokens to the organization's contributors.

Initial issuance of token grants are based on "potential" activity the member commits to. Delivery of the commitment will allow the grant to vest at 100% into its positive value. Failure to deliver on a grant commitment will result in the negative value. The value of the grant, positive or negative, effects the overall Redemable and Reputation balances.

Redemable Tokens can be shared between members and can be used for financial credits against their membership, lowering an organization's annual membershp fee. At the same time, a negative balance will lead to an increase in either the renewal or the current annual membership fee. The normal token accounting period is the anniversary cycle of a membership organization (1 year -- not one calendar year).

Reputation Tokens are issued, upon vesting, to an organization's contributors establishing an individuals reputation. The token grant should be adjusted when commitments are met or before vesting, to split reputation tokens by percentage to the contributors listed in the grant. The reputation split between contributors is finalized when the grant vests. The reputation score of an organization is the sum of their contributors balances.

For example, if an organization's contributors collect grants worth 10,000 tokens during its annual membership cycle, the organization can redeem the tokens for say a $10,000 credit to its membership or simply accumulate. In addition, if the organizations reputation score was 100,000 at the beginning of the membership cycle it would be 110,000 at the end of the cycle. In addition, 10,000 reputation points would issue according to the percentages in the grant for the organization's contributors.
=======
Negative balances are possible and are maintained by the **EEA Penalty token** on chain. Only **EEA Reward tokens** can be shared between members; also, they can be redeemed for financial credits against their membership, lowering an organization's annual membershp fee. At the same time, a negative balance, captured by the **EEA Penalty token**, will lead to an increase in either the renewal or the current annual membership fee. **EEA Penalty tokens** are **not** transferrable. The normal token accounting period is the anniversary cycle of a membership organization (1 year -- not one calendar year). 

In addition, **EEA Reputation tokens** are like airline miles, where tokens accumulate over the lifetime of an organization and represent the level of committment of an organization to the EEA; it becomes a measure of an organization's EEA reputation. This also extends to the employees of the organization who earn the tokens in the first place; they will also keep those tokens as reputation tokens for the organization.  The **EEA Reputation tokens** are lifetime tokens and are **not** transferable for any member that has earned them. 

For example, if an organization collects 10,000 tokens during its annual membership cycle, they can redeem the **EEA Rewards tokens** for say $10,000 credit to its membership, or continue to accumulate. In addition, if the organization's lifetime membership **EEA Reputation tokens** total was 100,000 at the beginning of the membership cycle, it would be 110,000 at the end of the cycle in this example. In addition, 10,000 points would be split across the organization's employees who earned them.

### Redemptions

**EEA Rewards token** can be redeemed, by the organization, at the end of a membership cycle (1 year) for fiat currency at an exchange rate of 1 **EEA Rewards token** to 0.x USD. Where x is a number that is currently TBD (Suggestion is x = 98). Negative balances, captured by the **EEA Penalty token**, must be redeemed at the end of a membership cycle for either an additional payment for the membership cycle to the EEA or an appropriate increase to next year's membership price. Redemption can never be higher than the subsequent year's membership fee.

### Sharing

EEA Tokens that have not been redeemed can be transfered to any member organization.
=======
Only **EEA Reward Tokens** that have not been redeemed can be transfered to any member organization.

### Initial Token Distributions

Initial token amount is 0. No tokens are initially distributed. Tokens are created or destroyed (burned) based on validated total contributions against initial grant committments.

### Setting the Grant Values
=======
All initial token amounts are 0. No tokens are initially distributed. Tokens are created or destroyed (burned) based on validated submission of (not) completed actions.

### Creation of EEA Reward Tokens

Any defined EAA activity that is deemed appropriate to earn tokens can create a token grant. The grant has initial settings for positive and negative vesting.

Initial Suggested List: 

1. Organization participating in any SIG/TWG/Steering Committee (SC) meeting (whether 1 or more participate is not relevant): +10 Token 
2. Being a chair of a SIG/TWG/SC meeting: +5 Token 
3. Contributing a written deliverable to a SIG/TWG/SC meeting: +100 Token 
4. Main editor to a written deliverable to a SIG/TWG/SC meeting: +200 Token 
5. Contributing to an EEA project: +1000 Token (Regular Contributor per resource -- resources can be people or compute resources), +2000 Token (Project Manager or highly specialized resourece), +10000 Token (Financial or Resource Project Sponsor)
6. Failure to deliver or participate after commitment: -10 Token

### Reputation Tokens

Reputation tokens are created based on the earned reward tokens. The reputation tokens for individuals and organizations are created and accounted for the following way:

* Reputation Tokens of an Organization = Sum of all earned rewards tokens of the employees of an organization participating in EEA activities
* Reputation Token of an individual =  Sum of all earned rewards tokens of an individual participating in EEA activities


## Token Questions

|    Question   |    Process    |  Answer  |
| --- | --- | --- |
| Who controls a token grant, when, how and where?  | Sharing  | **Who:** EEA Member; **When:** Any time;  **How:** Sharing request to other member org; **Where:** No specific location required |
| Who issues a token grant, when, how and where?  | Issuance  | **Who:** EEA SIG/TWG chair on behalf of the EEA;  **When:** Upon commitment of activity by EEA Member; **How:** EEA members completes or does not complete committed to activity; **Where:** SIGs/TWGs/Projects |
| Who redeems a token, when, how and where? | Redemption | **Who:** EEA Member; **When:** At Membership Anniversary (within a certain time frame e.g. 1 month) the token grant will vest; **How:** Redemption request to EEA Secretary; **Where:** On extension/close-out of EEA membership |
| Who liquidates a token, when, how and where? | Redemption | See Answer for Redemption process |
| What, if any, are the restrictions on token control, issuance, redemption, and liquidation? | All Proccesses | Token rules governing all processes and financial accounting are controlled by the EEA Steering Committee and follow the established Change Control process of the EEA. See the Token Model for control and restriction details |
| What are the Legal triggers to be considered? (money transfer regulation, securities trigger, gift card regulation, …)? | All Proccesses | Token design is such that the EEA token is not a security (Is not used to raise money, is not promoted as an investment, will be issued on existing platform, is not freely exchangable, can only be used for one purpose, does not represent any interest in an entity) and cannot be traded except OTC through sharing and within the EEA ecosystem which is permissioned through the EEA membership rules. The EEA is using its established banking relationships to fullfill all applicable banking and money transfer law requirements. |
| Are there token usage fees? | Redemption | There is a fee through an exchange rate to cover the EEA administrative costs of the token |
| If there are token usage fees, what is the fee schedule by value exchange? | Redemption | Fee schedule is still TBD but will be fixed |
| Where and how is the economic value capture taking place and who are the participants? | Token Economics | **Where:** EEA SIGs and TWGs and Projects; **How:** Recording of EEA Member participation and contributions; **Who:** EEA Members, EEA Chairs, EEA Secretary|
| Where, how and through whom is economic value entering and leaving? | Token Economics | **Where:** EEA Secretary; **How:** Redemption Requests from Members: **Through Whom:** EEA Member and EEA Secretary |
| Are tokens treated as a GAAP liability or as a private currency? | N/A | GAAP Liability on EEA Balance Sheet |
| How are tokens financially accounted for? | N/A | Onchain in the token contract and offchain through a liability/credit on the EEA Balancesheet |
| Who is responsible for the financial accounting of tokens? | N/A | EEA Secreatary |
| What are the currency controls both qualitative and quantitative such as liquidity/supply requirements, exchange rates? | Relevant for a private currency only | Fixed exchange rate to account for EEA accounting costs. Redemption rules ensure that tokens can only be redeemed at the rate that membership dues are received. |
| Who or what sets those controls? | Relevant for a private currency only | EEA Steering Committee |
| Who or what implements them? | Relevant for a private currency only | Token SIG + Testnet TWG |
=======
###  Creation of Negative Penalty Tokens

Committing to any of the above (Creation of EEA Reward Tokens) activities such as registering to participate in a SIG/TWG/SC and then not contributing/participating to that activity. **EEA Reward Tokens** are not burned but rather negative balances are created, via **EEA Penalty Tokens** for member organizations which have to be redeemed at the end of a membership cycle.

### Reputation Tokens

**EEA Reputation tokens** are minted based on the earned **EEA Reward tokens** in a 1:1 relationship. The **EEA Reputation tokens** for individuals and organizations are created and accounted for the following way:

* **EEA Reputation Tokens** of an Organization = Sum of all earned **EEA Rewards tokens** of the employees of an organization participat**ing in EEA activities
* **EEA Reputation Token** of an individual =  Sum of all earned **EEA Rewards tokens** of an individual participating in EEA activities


## Role Based Access Control

Looking to implement Role Based Access Control (RBAC) for the token system.
Roles include:
 * EEA Secretary: Distributes tokens
 * EEA Organizations
 * EEA Members

Structure could follow something like [this](https://entethalliance.github.io/client-spec/spec.html#sec-example-permissioning-bespoke)


## Workflows and High-level Architecture

[Token Flow](https://drive.google.com/file/d/1X1UHYsrOzYmEa2gLKGc2mpj6IXViD2o5/view)

[Token Model](https://docs.google.com/spreadsheets/d/1w1mtxifcpfeqjQk-vJFFGBjtH7UgcSrNj0urp6VXMbM/edit#gid=0)


##  Initialization, Deployments, & Migrations


### Requirements
The server side scripts requires at least NodeJS 8, but currently names version 10.16.3
Go to [NodeJS](https://nodejs.org/en/download/) and install the appropriate version for your system.

Yarn is required to be installed globally to minimize the risk of dependency issues.
Go to [Yarn](https://yarnpkg.com/en/docs/install) and choose the right installer for your system.

Depending on your system the following components might be already available or have to be provided manually:
* Python 2.7
* make (on Ubuntu this is part of the commonly installed `sudo apt-get install build-essential`)
* On OSX the build tools included in XCode are required


### General
Before running the provided scripts, you have to initialize your current terminal via `source ./tools/initShell.sh` for every terminal in use. This will add the current directory to the system PATH variables and must be repeated for time you start a new terminal window from project base directory.

For Windows, use `./tools/initShell.ps1`.

__Every command must be executed from within the projects base directory!__

### Setup
Open your terminal and change into your project base directory. From here, install all needed dependencies.
```
cd <project base directory>
source ./tools/initShell.sh
yarn install
```
This will install all required dependecies in the directory _node_modules_.

For Windows

Open up Powershell and change into your project base directory. From here, install all needed dependencies.

```
cd <project base directory>
.\tools\initShell.ps1
yarn install
```


## Contract Deployment Order

The correct deployment order is already set in `2_deploy_contracts.js` under `migrations.` However, the deployment order follows:

1. Deploy `ERC1820Registry` to contract address: `0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24`
@see https://github.com/0xjac/ERC1820

2. Deploy `EthereumDIDRegistry` contact (ERC1056)
@see https://github.com/uport-project/ethr-did-registry

3. Deploy `EthereumClaimsRegistry` contract (ERC780)
@see https://github.com/uport-project/ethereum-claims-registry

4. Deploy `EEAClaimsIssuer` contract with address of `EthereumClaimsRegistry` as the EEA Admin

5. Deploy `EEAOperator` contract with addresses of (`EthereumDIDRegistry`, `EthereumClaimsRegistry`, `EEAClaimsIssuer`) as the EEA Admin

6. Deploy `ReputationToken` contract with address of `EEAOperator` as default operator. Can be deployed by any address.

7. Deploy `PenaltyToken` contract with address of `EEAOperator` as default operator. Can be deployed by any address.

8. Deploy `RewardToken` contract with addresses (`[(EEAOperator)]`, `EthereumDIDRegistry`, `EthereumClaimsRegistry`, `EEAClaimsIssuer`). Can be deployed by any address.

9. We now have to register all token contracts in the `EEAOperator` contract.
`function registerTokens(address _penaltyToken, address _rewardToken, address _reputationToken)` This must be called by the EEA Admin.


### EEA membership claims

EEA members must be registered **onchain** as EEA members to receive tokens. To do this we use the `EthereumClaimsRegistry` (ERC780) contract to set the claim. The `EthereumClaimsRegistry` uses the mapping: 

`mapping(address => mapping(address => mapping(bytes32 => bytes32))) public registry;` 

The function call to set claims in `EthereumClaimsRegistry` is: 

`function setClaim(address subject, bytes32 key, bytes32 value)` 

Since `bytes32 key` and `bytes32 value` must be exactly the same and the `issuer` must be similar, it is best to hardcode the information we need to set the claim. 

This is why we need `EEAClaimsIssuer`; it hardcodes `bytes32 key` and `bytes32 value` to: 

`keccak256(abi.encodePacked("membership"))` and `keccak256(abi.encodePacked("true"))`, respectively. 

Note: these values are actually:

 `0xe4d89b09a6eb94125ee9c6123f55fbaef99eabb81fcefd76640abb9269a84805` 
 and 
 `6273151f959616268004b58dbb21e5c851b7b8d04498b4aabee12291d22fc034`

It also standardizes the issuer of the claim as `EEAClaimsIssuer` is `msg.sender` and becomes the issuer. This means we can swap out EEA admin addresses, if required, but keep the same issuer address. 

To set EEA membership claims call:

`function setMembershipClaim(address organization)` 

as the owner of the contract, which should be the EEA admin

To revoke membership:

`function revokeMembership(address organization)`

The `EEAClaimsIssuer` can also set/remove any other claim through `setClaim` and `removeClaim`.




### Register Employees as delegates of an Organization 

To complete our network, organizations (the EEA member) must set their employees as delegates of the organization. This allows employees, or delegates, to act on behalf of the organization, own their own address, and set their own reputation. 

**An organization must set the employees as delegates for delegates and organizations to receive tokens**

To do this we leverage `EthereumDIDRegistry` to set delegates for an organization.

The function to do this is: 

`function addDelegate(address identity, bytes32 delegateType, address delegate, uint validity)`

This function **MUST** be called by the organization with:

1.  `identity` set to the employees address

2.  `delegateType` set to:

`keccak256("employee")`, or `0x863480501959a73cc3fea35fb3cf3402b6489ac34f0a59336a628ff703cd693e`

NOTE: if `delegateType` is set to anything else, the delegate will not be considered registered within the smart contract ecosystem.

3. `validity` set to some number in seconds for how long the claim is valid for (e.g., 31536000 = 1 year).
Note: the validity can be set to large numbers to ensure the claim is valid for the forseeable future (e.g., 3153600000 = 100 years)

That is it, once all of these steps are complete, the EEA Admin can start issuing rewards and penalties.


### Callable functions

**As EEA Admin**

For `EEAOperator` the callable functions are:

1. `function batchMintRewards(address[] memory _organization, address[] memory _account, uint256[] memory _amount)`

2. `function batchMintPenalties(address[] memory _organization, address[] memory _account, uint256[] memory _amount)`

3. `function burnPenalties(address organization, uint256 amount, bytes memory operatorData)`

4. `function burnRewards(address organization, uint256 amount, bytes memory operatorData)`

5. `function burnAll(address organization)`


For `EEAClaimsIssuer` the callable functions are:

1. `function setMembershipClaim(address organization)`

2. `function revokeMembership(address organization)`

3. `function setClaim(address subject, bytes32 key, bytes32 value)`

4. `function removeClaim(address subject, bytes32 key)`


** As an Organization **

For `RewardToken` the only callable functions are:

1. `function send(address recipient, uint256 amount, bytes memory data)`

2. `function transfer(address recipient, uint256 amount)`

3. `function transferFrom(address holder, address recipient, uint256 amount)`

4. `function approve(address spender, uint256 value) external returns (bool)`


** Callable by any **

For `EEA Operator` the only callable function is:

1. `function balance(address account) external view returns (uint256, uint256, uint256)`



All `EthereumClaimsRegistry` functions are callable; this is a public contract.

All `EthereumClaimsRegistry` functions are callable; this is a public contract.

All token **ReadOnly** functions are public functions.



### Compile, migrate and run unit tests
To deploy the smart contracts, go into the projects root directory, and change into the truffle development console.
```
cd <project base directory>
source ./tools/initShell.sh
yarn run dev
```

Now you can compile, migrate and run tests.
```
# Compile contract
compile

# Migrate contract
migrate

# Test the contract
test
```
__The development console will automatically start it's own TestRPC server for you!__



### Run the coverage test
To run the coverage tests, go into the projects root directory and run the coverage test.
```
cd <project base directory>
source ./initShell.sh
yarn run coverage
```
__The coverage test will automatically start it's own TestRPC server for you!__


### Kaleido Deployment

To deploy the smart contracts onto Kaleido you need to specify the network.

Kaleido documentation
@see https://docs.kaleido.io/

In `truffle-config.js`,a kaleido network is already specified, but you will need to enter credentials and URL in 
a `.env` file.

To compile and migrate

go into the projects root directory, and change into the truffle development console.
```
cd <project base directory>
source ./tools/initShell.sh
yarn run console
```

Now you can compile and migrate contract in Kaleido
```
# Compile contract
compile

# Migrate contract
migrate
```