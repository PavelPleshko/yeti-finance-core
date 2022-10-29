import { ERC20Mock } from '../../typechain';
import { TokenIds } from '../config/tokens';
import { deployERC20MockToken } from '../contract-deploy';


export const deployERC20Mocks = async (): Promise<Record<string, ERC20Mock>> => {
    const tokens = {} as Record<string, ERC20Mock>;

    await Promise.all(Object.keys(TokenIds)
        .map((currToken) => deployERC20MockToken([ currToken, currToken, 18 ])
            .then(deployed => tokens[currToken] = deployed)
        ));

    return tokens;
};
