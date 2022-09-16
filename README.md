# Basic guide

## Setup
Copy `.secret.template` to `.secret` and fill in private keys of wallets required for deployment. NEVER share these keys unless you truly understand the risks.

## Compile
Run `yarn flatten` first to merge Solidity sources.
Run `yarn compile` to compile the contracts (this includes `flatten` step).

## Testing
Run `yarn dev` to start ganache dev blockchain
Run `yarn test` to do all the tests and simulations (can take up to 30 minutes to complete)

# Concept guide

## Purposes
1. Each REIT NFT represents a fund certificate, so it has to have the functionalities of a fund certificate.
2. The purpose of REIT NFT smart contract is to record the ownership of shareholders and to pay dividends and clearances in crypto currencies to them.
3. The INO smart contract is used for initial offering of REIT NFT.

## Roles
1. The governor can assign administrator roles for some parts of the smart contract. The primary role of governor is to withdraw funds to trusted addresses. Normally governor wallet is multi-sig and requires several approvals from Board of Director members to execute.
2. Administrator govern less critical parts of the smart contract like KYC, Loyalty Program, Whitelisting.
3. REIT NFT creator manages a REIT Fund. There can be many REIT NFT creators that manage many different REIT funds.

## Life cycle of a REIT Fund
1. Creation and initiation of REIT NFT.
2. Initial NFT offering event where investors can buy REIT NFT at initial unit price.
3. REIT NFT creator (manager) pays yield dividends at aggreed timings.
4. REIT NFT shareholders claim the yield dividends any time they want.
5. REIT NFT creator pays the clearance shares.
6. REIT NFT shareholders claim their clearance shares and forfeit all NFT ownership.

## Loyalty program
1. Investors can stake MEI tokens to gain better loyalty level.
2. Main benefits of loyalty program are: higher purchase limit at INO and lower transfer tax.

## Note on NFT ownership transfer
1. When transfer REIT NFT, it is required to pay for transfer tax. The tax rate depends on the loyalty level of REIT NFT holder.
2. The final owner of the REIT NFT is payer of the transfer tax.
3. If 2 wallets are KYC-ed to be the same people, they can transfer without tax.
4. All yield dividends except the clearance shares are given to the previous owner before the transfer happens.

# Testnet guide

## Deployment
1. Run `deploy:usd:testnet` to deploy testnet mock USD for testing. This will create 3 mock stable-coins: MUSDT, MUSDC and MBUSD.
2. Run `deploy:nft:testnet` to deploy the NFT smart contract. This is the core contract of REIT NFT.
3. Run `deploy:ino:testnet` to deploy the INO smart contract. This is the contract that do the Initial NFT Offering.

## Setup
1. Deployment needs to be done before this step.
2. Run `npx hardhat setupTestnet --network testnet --id 1` in order to setup the REIT NFT and a sample INO. Detail steps can be found in comments of the source file `tools/setupTestnet.js`.

## Buying REIT NFTs
1. First, NFT creator needs to add an account to KYC list by calling `addToKYC`.
2. The account can call `purchaseWithToken` to INO smart contract to buy to REIT NFT afterward.
3. If `purchaseWithToken` is done before KYC, the holder needs to be KYC-ed and then call `claimPendingBalances` to INO smart contract to unlock their NFTs.

## Funding REIT dividends
1. After a while, it is mandatory for REIT NFT creator to pay dividends to the share-holders.
2. Run `npx hardhat testPayDividend --time 0 --network testnet`, with time being the time index of the payment. Details is explained in the source file `tools/testPayDividend.js`
3. NFT share holders can run function `claimDividends` to get their share.

## Funding REIT liquidations
1. When it is time to clear the asset and pay back capital and profits to share-holders, the REIT NFT creator will fund the liquidations.
2. Run `npx hardhat testPayLiquidation --amount 1000000 --share 20 --network testnet`, with share being the liquidated value of each share. Details is explained in the source file `tools/testPayDividend.js`
3. NFT creator will run `allowLiquidationClaims` to allow several accounts to claim the clearance (this is to further protect the funds from unknown possible vulnerabilities).
4. Allowed accounts can run `claimLiquidations` to get their final clearance shares.

## Faucets
BSC Testnet: https://testnet.binance.org/faucet-smart
