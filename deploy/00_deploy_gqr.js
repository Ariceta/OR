module.exports = async ({ getNamedAccounts, deployments }) => {

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    let stakedTokenAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
    let rewardTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    let startBlock = 200;
    let endBlock = 500;
    let lockUpDuration = 100;
    let withdrawFee = 500;
    let feeAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

    const gqGalacticReserve = await deploy('GQGalacticReserve', {
        from: deployer,
        args: [
            stakedTokenAddress,
            rewardTokenAddress,
            startBlock,
            endBlock,
            lockUpDuration,
            withdrawFee,
            feeAddress
        ],
        log: true,
        waitConfirmations: 5
    });

    console.log('GQGalacticReserve deployed at: ', gqGalacticReserve.address);
    await delay(5000);
    /*
    // Verification block
    await run("verify:verify", {
        address: gqGalacticReserve.address,
        contract: "contracts/GQGalacticReserve.sol:GQGalacticReserve",
        constructorArguments: [
            stakedTokenAddress,
            rewardTokenAddress,
            startBlock,
            endBlock,
            lockUpDuration,
            withdrawFee,
            feeAddress
        ]
    });
    */

};

module.exports.tags = ['GQGalacticReserve'];