const moment = require('moment');
const { expect, use } = require('chai');
const { solidity } = require('ethereum-waffle');

const env = require('../env.json')['dev'];

use(solidity);

const UNIT_PRICE = 11;

describe('Pre-Ordering contract', function () {
  const openingDuration = moment.duration(1, 'd');

  let Token;
  let hardhatToken;

  let stableToken;
  let stableToken2;

  let Contract;
  let hardhatContract;

  let owner;
  let buyer;
  let addr2;
  let addrs;

  let openingTime;
  let closingTime;
  let releasedAmountAtHalf;

  before(async function () {    
    // Get the ContractFactory and Signers here.    
    [owner, buyer, addr2, ...addrs] = await ethers.getSigners();
 
    console.info('Deploying BUSD Mock');
    const StableTokenContract = await ethers.getContractFactory('USDMToken', buyer);
    stableToken = await StableTokenContract.deploy('BUSD', 'Mock BUSD');
    await stableToken.deployed();

    console.info('Deploying USDT Mock');
    stableToken2 = await StableTokenContract.deploy('USDT', 'Mock USDT');
    await stableToken2.deployed();

    console.info('Deploying Pre-Ordering Contract');
    
    Contract = await ethers.getContractFactory('PreOrdering');    
    hardhatContract = await upgrades.deployProxy(Contract, [ethers.utils.parseEther(UNIT_PRICE.toString())]);
    await hardhatContract.deployed();

    await hardhatContract.allowPayableToken('BUSD', stableToken.address);
    await hardhatContract.allowPayableToken('USDT', stableToken2.address);
  });  

  describe('Purchasing with stable coin', function () {    
    it('Cannot buy without stable coin', async function () {
      await expect(
        hardhatContract.connect(addr2).order('BUSD', 1)
      ).to.be.revertedWith(
        'insufficient allowance'
      );
    });

    it('Deposit', async function () {
      await stableToken.approve(hardhatContract.address, ethers.utils.parseEther('5000'));
      await hardhatContract.connect(buyer).order('BUSD', 18);
    });

    it('Pause', async function () {
      await hardhatContract.pause();
    });

    it('Cannot deposit after pausing', async function () {
      await expect(hardhatContract.connect(buyer).order('BUSD', 18)).to.be.revertedWith("PAUSED");
    });
  });

  describe('Owner stable coins withdrawal', function () {
    it('Owner check deposit and payment', async function () {
      const depositTotal = await hardhatContract.getUserDepositTotal(buyer.address);
      expect(depositTotal).to.equal(ethers.BigNumber.from(ethers.utils.parseEther((18 * UNIT_PRICE).toString())));
    })

    it('Only owner can withdraw stable coin', async function () {
      await expect(
        hardhatContract.connect(addr2).withdrawPayableToken('BUSD', addr2.address)
      ).to.be.revertedWith(
        'GOVERNOR_ONLY'
      );
    });

    it('Owner can withdraw stable coin', async function () {
      const initialBalance = await stableToken.balanceOf(owner.address);
      const initialBalance2 = await stableToken2.balanceOf(owner.address);

      await hardhatContract.withdrawPayableToken('USDT', owner.address);
      await hardhatContract.withdrawPayableToken('BUSD', owner.address);

      const withdrawnBalance = await stableToken.balanceOf(owner.address);
      const withdrawnBalance2 = await stableToken2.balanceOf(owner.address);

      expect(withdrawnBalance.add(withdrawnBalance2)).to.equal(initialBalance.add(initialBalance2).add(ethers.BigNumber.from(ethers.utils.parseEther((18 * UNIT_PRICE).toString()))));
    });
  });
});
