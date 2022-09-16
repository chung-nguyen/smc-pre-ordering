require("@openzeppelin/hardhat-upgrades");

const fs = require("fs");

const interact = require("./tools/interact");

const argv = require("minimist")(process.argv.slice(2));
const env = require("./env.json")[argv.network];

const secret = JSON.parse(fs.readFileSync(".secret"));
for (let key in secret) {
  secret[key] = Array.isArray(secret[key]) ? secret[key] : [secret[key]];
}

task("interact", "Interact with REIT NFT Contract").setAction(interact);

/**
 * Contract deployment task
 */
task("deploy", "Deploy Pre-Ordering Contract")
  .setAction(async () => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contractFileName = "PreOrdering";

  console.log(`Deploying ${contractFileName}...`);

  const Token = await ethers.getContractFactory(contractFileName);
  const nft = await upgrades.deployProxy(Token, [
    env.UNIT_PRICE
  ]);
  await nft.deployed();

  console.log("Setup contract");
  
  const contract = Token.attach(nft.address, deployer);    

  for (const key in env.TOKENS) {
    const allowUSDT = await contract.allowPayableToken(key, env.TOKENS[key]);
    await allowUSDT.wait();
  }

  console.log("Contract deployed to:", nft.address);

  fs.writeFileSync(`test/deployed-pre-ordering-${argv.network}.json`, JSON.stringify({ proxy: nft.address }));
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    dev: {
      url: "http://localhost:8545",
      accounts: [
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
        "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1",
        "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
        "0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913",
        "0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743",
        "0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd",
        "0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52",
        "0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3",
        "0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4",
        "0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773",
      ]
    },

    // MAINNET
    avax: {
      url: "https://rpc.ankr.com/avalanche",
      accounts: secret.avax,
      chainId: 43114
    },

    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: secret.bsc,
      chainId: 56
    },

    // TESTNET
    avaxTest: {
      url: "https://rpc.ankr.com/avalanche_fuji",
      accounts: secret.avaxTest,
      chainId: 43113
    },

    bscTest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: secret.bscTest,
      chainId: 97
    }
  },
  mocha: {
    timeout: 1000000
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
