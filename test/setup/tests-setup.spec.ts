import { getSigners } from '@nomiclabs/hardhat-ethers/internal/helpers';
import { Signer } from 'ethers';
import rawBRE from 'hardhat';
import { AddressesProvider, AssetPoolManager, ERC20Mock, Yeti, YToken } from '../../typechain';
import protocolConfig, { ProtocolConfig } from '../../utils/config';
import { TokenIds } from '../../utils/config/tokens';
import {
    deployAddressesProvider,
    deployAssetPoolManager,
    deployYetiProtocol,
    persistentDeploy,
    waitForTransaction
} from '../../utils/contract-deploy';
import { YetiContracts } from '../../utils/contract-factories';
import { DatabaseBase } from '../../utils/deploy/database/database.base';
import { deployYetiTokenImplementation } from '../../utils/deploy/tokens';
import { getDependencyByKey } from '../../utils/env/ioc';
import { configureAssets, initAssets } from '../../utils/initialization/init-assets';
import { deployTokenMocks } from './mock-tokens';

export interface TestEnv {
    deployer: string;
    config: ProtocolConfig;
    contracts: {
        yeti: Yeti;
        addressesProvider: AddressesProvider;
        assetsPoolManager: AssetPoolManager;
        yTokenImpl: YToken;
    } & Record<TokenIds, ERC20Mock>;
}


const testEnv = {
    config: protocolConfig,
    contracts: {},
} as TestEnv;

const createTestEnv = async (owner: Signer) => {

    const db = getDependencyByKey<DatabaseBase>('db');

    const deployer = await owner.getAddress();

    const tokenMocks = await deployTokenMocks();

    const addressesProvider = await persistentDeploy(await deployAddressesProvider(), YetiContracts.AddressesProvider);
    await waitForTransaction(await addressesProvider.setMarketAdmin(deployer));

    const assetsPoolManager = await deployAssetPoolManager();
    await waitForTransaction(await addressesProvider.setAssetPoolManager(assetsPoolManager.address));

    const yeti = await deployYetiProtocol();
    await waitForTransaction(await addressesProvider.setMarketProtocol(yeti.address));

    const yTokenImpl = await persistentDeploy(await deployYetiTokenImplementation(), YetiContracts.YToken);

    testEnv.deployer = deployer;
    testEnv.contracts = {
        ...testEnv.contracts,
        assetsPoolManager,
        yeti,
        addressesProvider,
        yTokenImpl,
        ...tokenMocks,
    };

    Object.seal(testEnv);

    console.info('===========================================');
    console.info('Initialized test environment with contracts: ');
    (Object.keys(testEnv.contracts) as (keyof TestEnv['contracts'])[]).forEach(contractKey => {
        const contract = testEnv.contracts[contractKey];
        console.log(contractKey, ' - ', contract.address);
    });
    console.info('===========================================');

    const tokenAddresses = Object.keys(tokenMocks).reduce((acc, token) => {
        acc[token] = tokenMocks[token].address;
        return acc;
    }, {} as Record<string, string>);
    const config = protocolConfig;

    console.log('Deploying asset pools...');
    await initAssets(config.assetsConfig, tokenAddresses);

    console.log('Configuring asset pools...');
    await configureAssets(config.assetsConfig, tokenAddresses);
};

before(async () => {
    await rawBRE.run('env:setup');
    const [ owner ] = await getSigners(rawBRE);
    await createTestEnv(owner);
});

export function wrapInEnv (name: string, tests: (testEnv: Readonly<TestEnv>) => void) {
    describe(name, () => {
        tests(testEnv);
    });
}
