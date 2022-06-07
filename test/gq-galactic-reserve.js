const { expect } = require("chai");
const { deployments, ethers } = require("hardhat");
const { expectRevert, time, snapshot } = require("@openzeppelin/test-helpers");
const ether = require("@openzeppelin/test-helpers/src/ether");
const balance = require("@openzeppelin/test-helpers/src/balance");

const TOKEN = 1;
const startBlock = 200;
const endBlock = 500;
const lockUpDuration = 100;
const withdrawFee = 500;

const mintingAmount = 10000;
const stakeTokenAmount = 100;
const rewardTokenAmount = 10000;

function fromWei(n) {
  return ethers.utils.formatUnits(n, 18);
}

function toWei(n) {
  return ethers.utils.parseEther(n);
}

describe("DEX", function () {

  let gqGalacticReserve;
  let stakeToken;
  let rewardToken;
  let snapshotTest;

  before(async function () {
    [owner, feer, alice, bob, carol] = await ethers.getSigners();
    gqGalacticReserveDeployment = await deployments.get("GQGalacticReserve");
    gqGalacticReserve = await ethers.getContractAt("GQGalacticReserve", gqGalacticReserveDeployment.address);
    stakeTokenDeployment = await deployments.get("StakeToken");
    stakeToken = await ethers.getContractAt("StakeToken", stakeTokenDeployment.address);
    rewardTokenDeplyment = await deployments.get("RewardToken");
    rewardToken = await ethers.getContractAt("RewardToken", rewardTokenDeplyment.address);

    await stakeToken.connect(alice).mint(alice.address, toWei(mintingAmount.toString()));
    await stakeToken.connect(alice).approve(gqGalacticReserve.address, toWei(mintingAmount.toString()));
    await stakeToken.connect(bob).mint(bob.address, toWei(mintingAmount.toString()));
    await stakeToken.connect(bob).approve(gqGalacticReserve.address, toWei(mintingAmount.toString()));
    await stakeToken.connect(carol).mint(carol.address, toWei(mintingAmount.toString()));
    await stakeToken.connect(carol).approve(gqGalacticReserve.address, toWei(mintingAmount.toString()));

    await rewardToken.connect(owner).mint(owner.address, toWei(rewardTokenAmount.toString()));
    await rewardToken.connect(owner).approve(gqGalacticReserve.address, toWei(rewardTokenAmount.toString()));
  });

  describe("Functionalities (Ibai refactorizado)", () => {

    it("should deposit tokens correctly", async () => {
      snapshotTest = await snapshot();
      await gqGalacticReserve.connect(alice).deposit(toWei(stakeTokenAmount.toString()));
      const contractBalance = await stakeToken.balanceOf(gqGalacticReserve.address);
      expect(contractBalance).to.equal(toWei(stakeTokenAmount.toString()));
      await snapshotTest.restore();
    }); 

    it("should extract a fee on withdraw", async () => {
      snapshotTest = await snapshot();
      await gqGalacticReserve.connect(alice).deposit(toWei(stakeTokenAmount.toString()));
      await gqGalacticReserve.connect(alice).withdraw(toWei(stakeTokenAmount.toString()));
      const balanceOf = await stakeToken.balanceOf(alice.address);
      const balanceExpected = mintingAmount - (stakeTokenAmount * (withdrawFee / 10000));
      expect(balanceOf).to.equal(toWei(balanceExpected.toString()));
      await snapshotTest.restore();
    });
  });

  describe("Unit tests withdraw() (Mikel)", () => {

    it("Not able to withdraw 0 tokens", async () => {
      expect(gqGalacticReserve.connect(alice).withdraw(toWei("0"))).to.revertedWith("Error: Invalid amount");
    });

    it("Not able to withdraw more token than deposited", async () => {
      snapshotTest = await snapshot();
      await gqGalacticReserve.connect(alice).deposit(toWei(stakeTokenAmount.toString()));
      withdrawTokenAmount = stakeTokenAmount + 10;
      await expect(gqGalacticReserve.connect(alice).withdraw(toWei(withdrawTokenAmount.toString()))).to.revertedWith("Amount to withdraw too high");
      await snapshotTest.restore();
    });

    it("Should withdraw tokens correctly", async () => {
      snapshotTest = await snapshot();
      await gqGalacticReserve.connect(alice).deposit(toWei(stakeTokenAmount.toString()));
      expect(await gqGalacticReserve.connect(alice).withdraw(toWei(stakeTokenAmount.toString())));
      
      await snapshotTest.restore();
    });
  });

  describe("Unit tests emergencyWithdraw() (Mikel)", () => {//toDo
  });

  describe("Unit tests recoverWrongTokens() (Mikel)", () => {

    it("Not able to recover if not owner", async () => {
      await expect(gqGalacticReserve.connect(alice).recoverWrongTokens(stakeToken.address, toWei("100"))).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Not able to recover staked token", async () => {
      expect(gqGalacticReserve.connect(owner).recoverWrongTokens(stakeToken.address, toWei("100"))).to.revertedWith("Cannot be staked token"); 
    });

    it("Not able to recover reward token", async () => {
      expect(gqGalacticReserve.connect(owner).recoverWrongTokens(rewardToken.address, toWei("100"))).to.revertedWith("Cannot be reward token");
    });

    //Para el happy path necesitaría un tercer token
  });

  describe("Unit tests stopReward() (Mikel)", () => {//toDo
  });

  describe("Unit test for updateRewardPerBlock() (Mikel)", () => {

    it("Not able to update if not owner", async () => {
      await expect(gqGalacticReserve.connect(alice).updateRewardPerBlock(2)).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Not able to update if pool started", async () => {
      snapshotTest = await snapshot();
      poolRunningBlock = Number(await gqGalacticReserve.startBlock()) + 50;
      await time.advanceBlockTo(poolRunningBlock.toString());
      await expect(gqGalacticReserve.connect(owner).updateRewardPerBlock(2)).to.revertedWith("Pool has started");
      await snapshotTest.restore();
    });

    it("Should update reward per block", async () => {
      snapshotTest = await snapshot();
      poolNotRunningBlock = Number(await gqGalacticReserve.startBlock()) - 50;
      await time.advanceBlockTo(poolNotRunningBlock.toString());
      await gqGalacticReserve.connect(owner).updateRewardPerBlock(2);
      expect(await gqGalacticReserve.connect(owner).rewardPerBlock()).to.equal(2);
      await snapshotTest.restore();
    });
  });

  describe("Unit tests updateStartAndEndBlocks() (Mikel)", () => {

    it("Not able to update blocks if not owner", async () => {
      await expect(gqGalacticReserve.connect(alice).updateStartAndEndBlocks(10, 100)).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Not able to update blocks if pool started", async () => {
      snapshotTest = await snapshot();
      poolRunningBlock = Number(await gqGalacticReserve.startBlock()) + 50;
      await time.advanceBlockTo(poolRunningBlock.toString());
      await expect(gqGalacticReserve.connect(owner).updateStartAndEndBlocks(10, 100)).to.revertedWith("Pool has started");
      await snapshotTest.restore();
    });

    it("Not able to update blocks if starter block is bigger than end block", async () => {
      snapshotTest = await snapshot();
      await time.advanceBlockTo(100);
      await (expect (gqGalacticReserve.connect(owner).updateStartAndEndBlocks(100, 10))).to.revertedWith("New startBlock must be lower than new endBlock");
      await snapshotTest.restore();
    });

    it("Not able to update blocks if starter block is smaller than current block", async () => {
      snapshotTest = await snapshot();
      await time.advanceBlockTo(100);
      await (expect (gqGalacticReserve.connect(owner).updateStartAndEndBlocks(100, 300))).to.revertedWith("New startBlock must be higher than current block");
      await snapshotTest.restore();
    });

    it("Should update start and end blocks", async () => {
      snapshotTest = await snapshot();
      poolNotRunningBlock = Number(await gqGalacticReserve.startBlock()) - 50;
      await time.advanceBlockTo(poolNotRunningBlock.toString());
      let newStartBlock =  Number(await gqGalacticReserve.startBlock()) + 50;
      let newEndBlock = Number(await gqGalacticReserve.endBlock()) + 50;
      await gqGalacticReserve.connect(owner).updateStartAndEndBlocks(newStartBlock, newEndBlock);

      expect(await gqGalacticReserve.startBlock()).to.equal(newStartBlock);
      expect(await gqGalacticReserve.endBlock()).to.equal(newEndBlock);
      expect(await gqGalacticReserve.lastUpdateBlock()).to.equal(await gqGalacticReserve.startBlock());

      await snapshotTest.restore();
    });
  });

  describe("Unit tests setLockUpDuration() (Mikel)", () => {//toDo
  });
  describe("Unit tests pullStartIn() (Mikel)", () => {//toDo
  });
  describe("Unit tests poolSetStartAndDuration() (Mikel)", () => {//toDo
  });

  describe("Unit tests withdrawRemains() (Mikel)", () => {

    it("Not able to withdraw remains if not owner", async () => {
      await expect(gqGalacticReserve.connect(alice).withdrawRemains(alice.address)).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Not able to withdraw remains if pool not finished", async () => {
      snapshotTest = await snapshot();
      poolNotRunningBlock = Number(await gqGalacticReserve.startBlock()) - 50;
      await time.advanceBlockTo(poolNotRunningBlock.toString());
      let newStartBlock = await gqGalacticReserve.startBlock() + 50;
      let newEndBlock = await gqGalacticReserve.endBlock() + 50;
      await gqGalacticReserve.connect(owner).updateStartAndEndBlocks(newStartBlock, newEndBlock);

      await expect(gqGalacticReserve.connect(owner).withdrawRemains(owner.address)).to.revertedWith("Error: Pool not finished yet");
      await snapshotTest.restore();
    });

    it("Not able to withdraw remains if no tokens are deposited", async () => {
      snapshotTest = await snapshot();
      poolFinishedBlock = Number(await gqGalacticReserve.endBlock()) + 10;
      await time.advanceBlockTo(poolFinishedBlock.toString());      
      await expect(gqGalacticReserve.connect(owner).withdrawRemains(owner.address)).to.revertedWith("Error: No remaining funds");
      await snapshotTest.restore();
    });
    /*
    it("Should withdraw remains", async () => {
      snapshotTest = await snapshot();
      poolFinishedBlock = Number(await gqGalacticReserve.endBlock()) + 10;
      console.log("BALANCE OWNER: "+await rewardToken.balanceOf(owner.address));
      await rewardToken.connect(owner).transfer(gqGalacticReserve.address, await rewardToken.balanceOf(owner.address))
      console.log(await gqGalacticReserve.rewardToken());
      await time.advanceBlockTo(poolFinishedBlock.toString());
      expect(await gqGalacticReserve.connect(owner).withdrawRemains(owner.address));

      await snapshotTest.restore();
    });
    */
  });

  describe("Unit tests depositRewardFunds() (Mikel)", () => {

    it("Not able to deposit reward funds if not owner", async () => {
      await expect(gqGalacticReserve.connect(alice).depositRewardFunds(100)).to.revertedWith("Ownable: caller is not the owner");
    });
    /*
    it("Should deposit reward funds", async () => {
      snapshotTest = await snapshot();
      expect(await gqGalacticReserve.connect(owner).depositRewardFunds(toWei("10")));
      await snapshotTest.restore();
    });
    */
  });

  describe("Unit tests poolSetStart() (Mikel)", () => {

    it("Not able to set pool start if not owner", async () => {
      snapshotTest = await snapshot();
      await expect(gqGalacticReserve.connect(alice).poolSetStart(100)).to.revertedWith("Ownable: caller is not the owner");
      await snapshotTest.restore(); //No funciona esta snapshot
    });

    it("Not able to set pool start if pool already started", async () => {
      snapshotTest = await snapshot();
      poolRunningBlock = Number(await gqGalacticReserve.startBlock()) + 50;
      await time.advanceBlockTo(poolRunningBlock.toString());

      await expect(gqGalacticReserve.connect(owner).poolSetStart(10)).to.revertedWith("Pool has started");
      await snapshotTest.restore(); //No funciona esta snapshot
    });

    it("Should set pool start", async () => {
      snapshotTest = await snapshot();
      poolNotRunningBlock = Number(await gqGalacticReserve.startBlock()) - 50;
      await time.advanceBlockTo('100');
      let newStartBlock = Number(await gqGalacticReserve.startBlock()) + 10;
      await time.advanceBlockTo('150');
      await gqGalacticReserve.connect(owner).poolSetStart(newStartBlock);


      expect(await gqGalacticReserve.startBlock()).to.equal(newStartBlock);
      expect(await gqGalacticReserve.lastUpdateBlock()).to.equal(await gqGalacticReserve.startBlock());

      await snapshotTest.restore();
    });
  });

  describe("Unit tests poolSetDuration() (Mikel)", () => {

    it("Not able to set pool duration if not owner", async () => {
      await expect(gqGalacticReserve.connect(alice).poolSetDuration(100)).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Not able to set pool duration if pool already started", async () => {
      snapshotTest = await snapshot();
      poolRunningBlock = Number(await gqGalacticReserve.startBlock()) + 50;
      await time.advanceBlockTo(poolRunningBlock.toString());
      await expect(gqGalacticReserve.connect(owner).poolSetDuration(10)).to.revertedWith("Pool has started");
      await snapshotTest.restore();
    });

    it("Should set pool duration", async () => {
      snapshotTest = await snapshot();
      poolNotRunningBlock = Number(await gqGalacticReserve.startBlock()) - 50;
      let newDurationBlocks = 250;
      let poolFinishesInBlock = Number(await gqGalacticReserve.startBlock()) + newDurationBlocks;
      await time.advanceBlockTo(poolNotRunningBlock);
      await gqGalacticReserve.connect(owner).poolSetDuration(newDurationBlocks);

      expect(await gqGalacticReserve.endBlock()).to.equal(poolFinishesInBlock);

      await snapshotTest.restore();
    });
  });

});
