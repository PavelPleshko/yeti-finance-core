import { expect } from 'chai';
import { constants, utils } from 'ethers';
import { getSignerAccounts } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, YetiContracts } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';

wrapInEnv('AssetPoolManager', testEnv => {
    let mockInitPositionData: any;

    before(() => {
        mockInitPositionData = {
            yTokenImpl: testEnv.contracts.yTokenImpl.address,
            yTokenName: 'YetiMockToken',
            yTokenSymbol: 'Y',
            debtTokenImpl: testEnv.contracts.debtTokenImpl.address,
            debtTokenName: 'YetiMockToken',
            debtTokenSymbol: 'D',
            underlyingDecimals: 18,
            underlying: '0xFA6adcFf6A90c11f31Bc9bb59eC0a6efB38381C6',
            piggyBank: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            underlyingName: 'MOCKUSD',
            interestRateLogic: testEnv.contracts.interestRateStrategies[0].contract.address,
            params: utils.toUtf8Bytes('params'),
        };
    });

    it('should not initialize position if not called by gateway owner', async () => {
        const [ , nonOwner ] = await getSignerAccounts();
        const assetPoolAddress = await testEnv.contracts.addressesProvider.getAssetPoolManager();
        const assetPoolManager = (await getInterfaceAtAddress(assetPoolAddress, YetiContracts.AssetPoolManager)(nonOwner));

        await expect(assetPoolManager.initAssetPool({
            ...mockInitPositionData,
            underlying: mockInitPositionData.yTokenImpl,
        })).to.be.revertedWith('AssetPoolManager: call was not performed by gateway owner');
    });
});
