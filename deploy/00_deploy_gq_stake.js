module.exports = async ({ getNamedAccounts, deployments }) => {

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    let stakedTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    let rewardTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    let startBlock = 200;
    let endBlock = 500;
    let lockUpDuration = 100;
    let withdrawFee = 500;
    let feeAddress = '0xaaf6b6f4c3a20cae39a25fbcd9617822cd8bf1c7';

    const gqStake = await deploy('GQStake', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 5
    });

    console.log('GQStake deployed at: ', gqStake.address);
    await delay(5000);

    const reward = await deploy('RewardToken', {
        from: deployer,
        args: ["name","symbol"],
        log: true,
        waitConfirmations: 5
    });

    console.log('GQStake deployed at: ', gqStake.address);
    await delay(5000);
    /*
    // Verification block
    await run("verify:verify", {
        address: gqStake.address,
        contract: "contracts/GQStake.sol:GQStake"
    });
    */

};

module.exports.tags = ['GQStake'];