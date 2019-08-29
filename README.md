# Trusted-Token
:tada:Welcome to the EEA Trusted Token central repo!:tada:

## Background

EEA is launching a _trusted execution environment (TEE) testnet_ on top of a Blockchain network (Kaleido running the Pantheon client using tokenization features). 
The first use case is an EEA trusted reward token to incentivize EEA membership to participate more in EEA activities! 

## Workflows and High-level Architecture

[Token Flow](https://drive.google.com/file/d/1X1UHYsrOzYmEa2gLKGc2mpj6IXViD2o5/view)

[Token Model](https://docs.google.com/spreadsheets/d/1w1mtxifcpfeqjQk-vJFFGBjtH7UgcSrNj0urp6VXMbM/edit#gid=0)

## Token Description

The **EEA Reward Token** is used to incentivize participation of EEA member organizations and their employees in EEA SIGs and TWGs. Tokens are issued as "Grants" for participation in EEA activities such as working group calls, deliverables or F2F meetings. The **EEA Reward Token Grant** represents the potential reward that can be earned by following through with the commitment that the grant represents. The larger committment to perform and contribute towards an activity by an organization, the higher potential reward in the grant. The grant also has a potential negative reward if the commitment is not followed through. A grant has a vesting schedule that indicates when the tokens in the grant can be transformed. Tokens in the grant remain as potential until a vesting occurs. The number of vests defined in the schedule determines the percentage of the tokens in the grant that can be transformed for each vesting event. 

The token grant vests at the end of the organization's membership year where the token grant transitions or spawns into **two** different tokens, one that is Redemable and the other a Reputation.  The reputation token is a "Lifetime" score of reputation for an individual within the EEA. The Redemable token is transferable and can be spent, or burned, towards annual membership dues. The Reputation token is non-transferable.

Vesting of the grant issues Redemable tokens to the organization and the Reputation tokens to the organization's contributors.

Initial issuance of token grants are based on "potential" activity the member commits to. Delivery of the commitment will allow the grant to vest at 100% into its positive value. Failure to deliver on a grant commitment will result in the negative value. The value of the grant, positive or negative, effects the overall Redemable and Reputation balances.

Redemable Tokens can be shared between members and can be used for financial credits against their membership, lowering an organization's annual membershp fee. At the same time, a negative balance will lead to an increase in either the renewal or the current annual membership fee. The normal token accounting period is the anniversary cycle of a membership organization (1 year -- not one calendar year).

Reputation Tokens are issued, upon vesting, to an organization's contributors establishing an individuals reputation. The token grant should be adjusted when commitments are met or before vesting, to split reputation tokens by percentage to the contributors listed in the grant. The reputation split between contributors is finalized when the grant vests. The reputation score of an organization is the sum of their contributors balances.

For example, if an organization's contributors collect grants worth 10,000 tokens during its annual membership cycle, the organization can redeem the tokens for say a $10,000 credit to its membership or simply accumulate. In addition, if the organizations reputation score was 100,000 at the beginning of the membership cycle it would be 110,000 at the end of the cycle. In addition, 10,000 reputation points would issue according to the percentages in the grant for the organization's contributors.

### Redemption

1 EEA Token can be redeemed at the end of a membership cycle (1 year) for fiat currency at an exchange rate of 1 EEA token to 0.x USD. Where x is a number that is currently TBD (Suggestion is x = 98). Negative balances have to be redeemed at the end of a membership cycle for either an additional payment for the membership cycle to the EEA or an appropriate increase to next year's membership price. Redemption can never be higher than the subsequent year's membership fee.

### Sharing

EEA Tokens that have not been redeemed can be transfered to any member organization.

### Initial Reward Token Distribution

Initial token amount is 0. No tokens are initially distributed. Tokens are created or destroyed (burned) based on validated total contributions against initial grant committments.

### Setting the Grant Values

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



## Role Based Access Control

Looking to implement Role Based Access Control (RBAC) for the token system.
Roles include:
 * EEA Secretary: Distributes tokens
 * EEA Organizations
 * EEA Members

Structure could follow something like [this](https://entethalliance.github.io/client-spec/spec.html#sec-example-permissioning-bespoke)
