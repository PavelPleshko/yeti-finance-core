export enum EnvironmentTypes {
    test = 'test',
    dev = 'dev',
    staging = 'staging',
    production = 'production',
}

export enum YetiAppVariables {
    env = 'environment',
}

/**
 * Used to differentiate the app env vars from other.
 * Full variable name example: YETI_environment.
 */
export const NODE_ENV_YETI_PREFIX = 'YETI_';
