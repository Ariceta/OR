module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    let stakedTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    let rewardToken1Address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    let rewardToken2Address = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
    let startBlock = 200;
    let endBlock = 500;
    let lockUpDuration = 100;
    let withdrawFee = 500;
    let feeAddress = '0xaaf6b6f4c3a20cae39a25fbcd9617822cd8bf1c7 ';

    const gqGalacticAlliance = await deploy('GQGalacticAlliance', {
        from: deployer,
        args: [],
        log: true,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy'
        }
    });
    console.log('GQGalacticAlliance deployed at: ', gqGalacticAlliance.address);
    const GQGalacticAllianceImplementation = await hre.deployments.get('GQGalacticAlliance_Implementation');
    const GQGalacticAllianceDeployed = await ethers.getContractAt('GQGalacticAlliance', GQGalacticAllianceImplementation.address);
    /*// Verification block
    await run("verify:verify", {
        address: GQGalacticAllianceDeployed.address,
        contract: "contracts/GQGalacticAlliance.sol:GQGalacticAlliance"
    });
    */

};

module.exports.tags = ['GQGalacticAlliance'];