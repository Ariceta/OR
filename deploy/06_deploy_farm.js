module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    const resource = '0x892F23E32B82EF0d5394cF33dcD4dFf7f4b274B0';
    const resourcePerBlock = '2000000000000000000';
    const startBlock = 17538800;

    const galacticFarming = await deploy('GalacticFarming', {
        from: deployer,
        args: [],
        log: true,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                init: {
                    methodName: "initialize",
                    args: [
                        resource, resourcePerBlock, startBlock
                    ]
                }
            }
        }
    });

    console.log('GalacticFarming deployed at: ', galacticFarming.address);
    await sleep(10000);
    const galacticFarmingImplementation = await hre.deployments.get('GalacticFarming_Implementation');
    const galacticFarmingDeployed = await ethers.getContractAt('GalacticFarming', galacticFarmingImplementation.address);
    /*// Verification block
    await run("verify:verify", {
        address: galacticFarmingDeployed.address,
        contract: "contracts/GalacticFarming.sol:GalacticFarming"
    });
    */
};

module.exports.tags = ['GalacticFarming'];