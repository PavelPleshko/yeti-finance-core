import { expect } from 'chai';
import { utils } from 'ethers';
import { findEventLog, getSignerAccounts } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, getMarketProtocol, YetiContracts } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';
import { depositAsset } from '../test-helpers/deposit';

wrapInEnv('Deposit', testEnv => {

    it('should not allow deposit operations with 0 amount', async () => {
        const { USDC } = testEnv.contracts;
        const [ signer ] = await getSignerAccounts();
        const depositTx = depositAsset({ assetAddress: USDC.address, amount: '0', signer, lock: false });
        await expect(depositTx).to.be.revertedWith('Yeti: Amount cannot be 0');
    });

    it('should transfer LP tokens to liquidity provider and deposit tokens to YToken', async () => {
        const { USDC } = testEnv.contracts;
        const [ signer ] = await getSignerAccounts();

        const amountParsed = utils.parseUnits('100', testEnv.config.assetsConfig['USDC'].decimals);
        const lendingProtocol = await getMarketProtocol();
        const depositTx = await depositAsset({ assetAddress: USDC.address, amount: amountParsed.toString(), signer, lock: false });
        const assetsStorage = (await getInterfaceAtAddress((await lendingProtocol.getAsset(USDC.address)).yetiToken, YetiContracts.YToken)());

        expect(await USDC.balanceOf(assetsStorage.address)).to.be.equal(amountParsed);
        expect(await assetsStorage.balanceOf(signer.address)).to.be.equal(amountParsed);

        const depositEvent = findEventLog(depositTx.events!, 'Deposit');

        expect(depositEvent?.args?.asset).to.be.equal(USDC.address);
        expect(depositEvent?.args?.assetProvider).to.be.equal(signer.address);
        expect(depositEvent?.args?.amount).to.be.equal(amountParsed);
    });
});
