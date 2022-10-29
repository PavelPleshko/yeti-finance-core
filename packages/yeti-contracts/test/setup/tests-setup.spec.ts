import { Contract, Signer } from 'ethers';
import rawBRE from 'hardhat';
import {
    AddressesProvider,
    AssetPoolManager,
    DebtTrackerToken,
    ERC20Mock,
    FeedRegistryInterfaceMock, IAssetInterestStrategy,
    PriceFeedRouter,
    Yeti,
    YToken
} from '../../typechain';
import protocolConfig, { ProtocolConfig } from '../../utils/config';
import { TokenIds } from '../../utils/config/tokens';
// import { getConfigurationByNetwork } from '../../utils/config/utils';
import {
    deployAddressesProvider,
    deployAssetPoolManager,
    deployContract,
    deployPriceFeed,
    deployYetiProtocol,
    getSignerAccounts,
    persistentDeploy,
    waitForTransaction
} from '../../utils/contract-deploy';
import { YetiContracts } from '../../utils/contract-factories';
import { deployDebtTokenImplementation, deployYetiTokenImplementation } from '../../utils/deploy/tokens';
import { configureAssets, initAssets } from '../../utils/initialization/init-assets';
import { DEV_RE } from '../../utils/misc';
import { setInitialMockPriceFeedForTokens } from './asset-prices';
import { deployERC20Mocks } from '../../utils/mocking/mock-tokens';

export interface TestEnv {
    deployer: string;
    config: ProtocolConfig;
    contracts: {
        yeti: Yeti;
        addressesProvider: AddressesProvider;
        assetsPoolManager: AssetPoolManager;
        yTokenImpl: YToken;
        debtTokenImpl: DebtTrackerToken;
        feedRegistryMock: FeedRegistryInterfaceMock,
        priceFeedRouter: PriceFeedRouter;
        interestRateStrategies: {id: string, contract: IAssetInterestStrategy}[];
    } & Record<TokenIds, ERC20Mock>;
}


const testEnv = {
    config: protocolConfig,
    contracts: {},
} as TestEnv;

const createTestEnv = async (owner: Signer) => {

    const config = protocolConfig;
    // const currentNetworkEnvConfig = getConfigurationByNetwork(config.envConfig);

    const deployer = await owner.getAddress();

    const tokenMocks = await deployERC20Mocks();

    const addressesProvider = await persistentDeploy(await deployAddressesProvider(), YetiContracts.AddressesProvider);
    await waitForTransaction(await addressesProvider.setMarketAdmin(deployer));

    const assetsPoolManager = await deployAssetPoolManager();
    await waitForTransaction(await addressesProvider.setAssetPoolManager(assetsPoolManager.address));

    const yeti = await deployYetiProtocol();
    await waitForTransaction(await addressesProvider.setMarketProtocol(yeti.address));

    const yTokenImpl = await persistentDeploy(await deployYetiTokenImplementation(), YetiContracts.YToken);
    const debtTokenImpl = await persistentDeploy(await deployDebtTokenImplementation(), YetiContracts.DebtToken);

    const feedRegistryMock = await persistentDeploy(await deployContract<FeedRegistryInterfaceMock>(YetiContracts.FeedRegistryMock), YetiContracts.FeedRegistryMock);
    const priceFeedRouter = await persistentDeploy(await deployPriceFeed(undefined, [ feedRegistryMock.address ]), YetiContracts.PriceFeedRouter);
    await addressesProvider.setPriceFeed(priceFeedRouter.address);

    testEnv.deployer = deployer;
    testEnv.contracts = {
        ...testEnv.contracts,
        assetsPoolManager,
        yeti,
        addressesProvider,
        yTokenImpl,
        debtTokenImpl,
        priceFeedRouter,
        feedRegistryMock,
        ...tokenMocks,
    };

    Object.seal(testEnv);

    const tokenAddresses = Object.keys(tokenMocks).reduce((acc, token) => {
        acc[token] = tokenMocks[token].address;
        return acc;
    }, {} as Record<string, string>);

    console.log('Deploying asset pools...');
    const { deployedStrategies } = await initAssets(config.assetsConfig, tokenAddresses);
    testEnv.contracts.interestRateStrategies = Object.keys(deployedStrategies).map(id => ({id, contract: deployedStrategies[id]}));

    console.log('Configuring asset pools...');
    await configureAssets(config.assetsConfig, tokenAddresses);

    console.log('Setting mock prices for oracle...');
    await setInitialMockPriceFeedForTokens(tokenAddresses);

    console.info('===========================================');
    console.info('Initialized test environment');
    console.log(JSON.stringify(testEnv.contracts, (key, value) => {
        if (value instanceof Contract) {
            return value.address;
        }
        return value;
    }, 2));
    console.info('===========================================');
};

before(async () => {
    await rawBRE.run('env:setup');
    const [ owner ] = await getSignerAccounts();
    await createTestEnv(owner);
});

let buidlerevmSnapshotId = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
    buidlerevmSnapshotId = id;
};

export const evmSnapshot = async () => await DEV_RE.ethers.provider.send('evm_snapshot', []);

export const evmRevert = async (snapshotId: string) => DEV_RE.ethers.provider.send('evm_revert', [ snapshotId ]);

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
