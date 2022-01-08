import { utils } from 'ethers';
import {BigNumber} from 'bignumber.js';
import { TokenIds } from '../../utils/config/tokens';
import { getPersistedContract, YetiContracts } from '../../utils/contract-factories';

export const oneEther = new BigNumber(utils.parseEther('1').toString());

// TOKEN_ID -> ETH pricing
export const assetsMockPrices: Record<TokenIds, string> = {
    [TokenIds.USDC]: oneEther.multipliedBy('0.00367714136416').toFixed(),
    [TokenIds.DAI]: oneEther.multipliedBy('0.00369068412860').toFixed(),
};

export const setInitialMockPriceFeedForTokens = async (tokenAddresses: Record<string, string>): Promise<void> => {
    const prices = Object.entries(assetsMockPrices);
    const mockOracleFeed = await (await getPersistedContract(YetiContracts.FeedRegistryMock))();
    for (const [ assetSymbol, price ] of prices) {
        const assetAddress = tokenAddresses[assetSymbol];
        if (!assetAddress) {
            console.warn(`Mock token  is not deployed for ${ assetSymbol }. Price feed setting skipped.`);
            continue;
        }

        await mockOracleFeed.setPriceForAsset(assetAddress, price);
    }
};
