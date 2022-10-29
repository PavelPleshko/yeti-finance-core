import { expect } from 'chai';
import { getInterfaceAtAddress, YetiContracts } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';

wrapInEnv('DebtTrackerToken: Access', testEnv => {

    const prepareVarsForAccessTest = async () => {
        const { addressesProvider, USDC } = testEnv.contracts;
        const marketProtocol = await addressesProvider.getMarketProtocol();
        const callerAddress = testEnv.deployer;
        expect(callerAddress !== marketProtocol);
        const marketProtocolInterface = await (getInterfaceAtAddress(marketProtocol, YetiContracts.Yeti)());
        const targetAsset = await marketProtocolInterface.getAsset(USDC.address);

        return {
            callerAddress,
            yToken: await (getInterfaceAtAddress(targetAsset.debtTrackerToken, YetiContracts.DebtToken)()),
        };
    };

    it('should throw if mint() is called not by market protocol', async () => {
        const { yToken, callerAddress } = await prepareVarsForAccessTest();
        await expect(yToken.mint(callerAddress, 100, 1,{ from: callerAddress }))
            .to.be.revertedWith('DebtTrackerToken: Only asset pool can perform this operation.');
    });
});
