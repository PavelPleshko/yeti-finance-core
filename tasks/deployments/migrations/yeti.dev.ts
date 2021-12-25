import { task } from 'hardhat/config';
import { deployAddressesProvider, deployYetiProtocol } from '../../../utils/contract-deploy';

task('yeti:dev', 'Launch development environment for yeti exchange protocol')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
        await localBRE.run('env:setup');

        console.log('Migration has started...\n');

        console.log('Step 1. Deploy address provider...');
        await localBRE.run('yeti:dev:deploy-address-provider', { verify });


        console.log('Step 2. Deploy exchange pair configurator...');
    });


task('yeti:dev:deploy-address-provider', 'TODO')
    .setAction(async ({ verify }, localBRE) => {
        await deployYetiProtocol();
        await deployAddressesProvider();
    });
