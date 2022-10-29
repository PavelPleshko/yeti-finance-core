import { YetiAppVariables, NODE_ENV_YETI_PREFIX } from '../constants/environment';


export const createEnvVariableFull = (varName: YetiAppVariables): string => {
    return `${ NODE_ENV_YETI_PREFIX }${ varName }`;
};

export const getEnvVariableValue = <T> (varName: YetiAppVariables): T => {
    return process.env[createEnvVariableFull(varName)] as T;
};
