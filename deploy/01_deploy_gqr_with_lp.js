module.exports = async ({ getNamedAccounts, deployments }) => {
    
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    
    let stakedTokenAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
    let rewardTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    let startBlock = 200;
    let endBlock = 500;
    let lockUpDuration = 100;
    let withdrawFee = 500;
    let feeAddress = '0x6080903C0017d0A6cf7C861910Cbc805Ee62740A';

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
    });

    console.log('GQGalacticReserve deployed at: ', gqGalacticReserve.address);
    
    // Verification block
    /*
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

module.exports.tags = ['GQGalacticReserveWithLP'];