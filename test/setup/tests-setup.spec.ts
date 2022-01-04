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
import { DEV_RE } from '../../utils/misc';
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

let buidlerevmSnapshotId: string = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
    buidlerevmSnapshotId = id;
};

export const evmSnapshot = async () => await DEV_RE.ethers.provider.send('evm_snapshot', []);

export const evmRevert = async (id: string) => DEV_RE.ethers.provider.send('evm_revert', [id]);

const setSnapshot = async () => {
    setBuidlerevmSnapshotId(await evmSnapshot());
};

const revertHead = async () => {
    await evmRevert(buidlerevmSnapshotId);
};

export function wrapInEnv (name: string, tests: (testEnv: Readonly<TestEnv>) => void) {
    describe(name, () => {
        // this is required for tests not to step on each other's toes
        // we record the id where snapshot is done in each suite and clean up afterwards
        // so next set of tests is free from side-effects from the current suite
        before(async () => {
            await setSnapshot();
        });

        tests(testEnv);

        after(async () => {
            await revertHead();
        });
    });
}
