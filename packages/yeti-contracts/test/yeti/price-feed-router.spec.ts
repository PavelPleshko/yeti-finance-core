import { expect} from 'chai';
import { etherFactor } from '../../utils/constants';

import { wrapInEnv } from '../setup/tests-setup.spec';

wrapInEnv('PriceFeedRouter', testEnv => {

    it('should return price that was set in price feed', async () => {
        const { contracts } = testEnv;
        const { USDC } = contracts;
        const priceFeed = contracts.feedRegistryMock;
        const priceFeedRouter = contracts.priceFeedRouter;
        const expectedPrice = etherFactor.multipliedBy('0.0033');

        await priceFeed.setPriceForAsset(USDC.address, expectedPrice.toFixed());

        const currentPrice = await priceFeedRouter.getAssetPriceETH(USDC.address);

        expect(currentPrice.toString()).to.be.equal(expectedPrice.toFixed());
    });
});
