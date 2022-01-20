import { BytesLike } from '@ethersproject/bytes';
import { BigNumberish, utils, constants } from 'ethers';
import { deployERC20MockToken, getSignerAccounts } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, YetiContracts } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';
import { expect } from 'chai';

wrapInEnv('Protocol Configuration', testEnv => {

    let mockInitPositionData: {
        yTokenImpl: string;
        yTokenName: string;
        yTokenSymbol: string;
        debtTokenImpl: string;
        debtTokenName: string;
        debtTokenSymbol: string;
        underlyingDecimals: BigNumberish;
        underlying: string;
        piggyBank: string;
        interestRateLogic: string;
        underlyingName: string;
        params: BytesLike;
    };

    beforeEach(async () => {
        mockInitPositionData = {
            yTokenImpl: testEnv.contracts.yTokenImpl.address,
            yTokenName: 'YetiMockToken',
            yTokenSymbol: 'Y',
            debtTokenImpl: testEnv.contracts.debtTokenImpl.address,
            debtTokenName: 'DebtToken',
            debtTokenSymbol: 'D',
            underlyingDecimals: 18,
            underlying: (await deployERC20MockToken([ 'Random token', 'RDM', 18 ])).address,
            underlyingName: 'Random token',
            interestRateLogic: constants.AddressZero,
            piggyBank: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            params: utils.toUtf8Bytes('initialize(address)'),
        };
    });

    it('should not create new asset directly calling the pool', async () => {
        const { addressesProvider } = testEnv.contracts;
        const [ owner ] = await getSignerAccounts();

        const connectableYeti = (await getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)(owner));

        await expect(connectableYeti
            .createNewAsset(
                mockInitPositionData.yTokenImpl,
                mockInitPositionData.underlying,
                mockInitPositionData.debtTokenImpl,
                mockInitPositionData.interestRateLogic,
            ))
            .to.be.revertedWith('Yeti: Can be called only by AssetPoolManager');
    });

    it('should not allow creating asset with token address equal to asset address', async () => {
        const { addressesProvider } = testEnv.contracts;
        const [ owner ] = await getSignerAccounts();
        const assetPoolManagerAddress = await addressesProvider.getAssetPoolManager();

        const assetPoolManager = (await getInterfaceAtAddress(assetPoolManagerAddress, YetiContracts.AssetPoolManager)(owner));

        await expect(assetPoolManager
            .initAssetPool({
                ...mockInitPositionData,
                underlying: mockInitPositionData.yTokenImpl,
            })).to.be.revertedWith('AssetPoolManager: Asset and LP token addresses can not be equal');
    });

    it('should allow asset pool manager to create asset', async () => {
        const { addressesProvider } = testEnv.contracts;
        const [ owner ] = await getSignerAccounts();

        const assetPoolManager = (await getInterfaceAtAddress(await addressesProvider.getAssetPoolManager(), YetiContracts.AssetPoolManager)(owner));
        const marketProtocol = (await getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)(owner));

        await assetPoolManager.initAssetPool(mockInitPositionData);
        const createdAsset = await marketProtocol.getAsset(mockInitPositionData.underlying);

        expect(!!createdAsset).to.be.true;
    });

    it('should allow asset pool manager to configure asset\'s commission factor', async () => {
        const { addressesProvider, USDC } = testEnv.contracts;
        const [ owner ] = await getSignerAccounts();
        const commissionFactor = '10';

        const assetPoolManager = (await getInterfaceAtAddress(await addressesProvider.getAssetPoolManager(), YetiContracts.AssetPoolManager)(owner));
        const marketProtocol = (await getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)(owner));

        const assetToConfigure = await marketProtocol.getAsset(USDC.address);
        expect(assetToConfigure.config.commissionFactor).to.not.be.equal(0);

        await assetPoolManager.setAssetCommission(USDC.address, commissionFactor);

        const updatedAsset = await marketProtocol.getAsset(USDC.address);

        expect(updatedAsset.config.commissionFactor).to.be.equal(commissionFactor);
    });
});
