const os = require("os");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const readline = require("readline");
const argv = require("minimist")(process.argv.slice(2));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(message) {
  return new Promise((resolve, reject) => {
    rl.question(message, function (result) {
      resolve(result);
    });
  });
}

async function runMethod(contract, command) {
  try {
    console.log("Run:", command, "...");
    const transaction = await eval(`contract.${command}`);
    if (transaction.wait) {
      const receipt = await transaction.wait();
      console.log(receipt);
    } else {
      console.log(transaction);
    }
  } catch (ex) {
    console.error(ex);
  }
}

async function interact () {
  const [owner] = await ethers.getSigners();
  console.log("Signer", owner.address);

  const contractData = JSON.parse(fs.readFileSync(path.join(__dirname, '../test', `deployed-private-offering-${argv.network}.json`)));
  
  const Token = await ethers.getContractFactory("PrivateOffering");
  const contract = Token.attach(contractData.proxy);  

  while (true) {
    console.log("Enter JS command:");

    const command = await prompt("> ");
    switch (command) {
      default: {
        await runMethod(contract, command);
        break;
      }
    }
  }
}

module.exports = async function main() {
  await interact();
}
