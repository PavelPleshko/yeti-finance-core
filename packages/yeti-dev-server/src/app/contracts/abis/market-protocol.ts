export const MARKET_PROTOCOL_ABI = [
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'previousAdmin',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newAdmin',
                'type': 'address'
            }
        ],
        'name': 'AdminChanged',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'token',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'debtToken',
                'type': 'address'
            }
        ],
        'name': 'AssetCreated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'beacon',
                'type': 'address'
            }
        ],
        'name': 'BeaconUpgraded',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'borrower',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'borrowRateAtATime',
                'type': 'uint256'
            }
        ],
        'name': 'Borrow',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'bool',
                'name': 'isLocked',
                'type': 'bool'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'user',
                'type': 'address'
            }
        ],
        'name': 'CollateralStatusChanged',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'assetProvider',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'Deposit',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'payer',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'Payback',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'implementation',
                'type': 'address'
            }
        ],
        'name': 'Upgraded',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'withdrawer',
                'type': 'address'
            },
            {
                'indexed': false,
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'Withdraw',
        'type': 'event'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'borrow',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'lpTokenProxy',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'debtTokenProxy',
                'type': 'address'
            },
            {
                'internalType': 'address',
                'name': 'interestRateLogic',
                'type': 'address'
            }
        ],
        'name': 'createNewAsset',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            },
            {
                'internalType': 'address',
                'name': 'interestReceiver',
                'type': 'address'
            },
            {
                'internalType': 'bool',
                'name': 'lockAsCollateral',
                'type': 'bool'
            }
        ],
        'name': 'deposit',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            }
        ],
        'name': 'getAccountCollateralState',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'address',
                        'name': 'asset',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'amount',
                        'type': 'uint256'
                    }
                ],
                'internalType': 'struct IYeti.CollateralEntry[]',
                'name': '',
                'type': 'tuple[]'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'account',
                'type': 'address'
            }
        ],
        'name': 'getAccountSummary',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            },
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getAllAssets',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'uint256',
                        'name': 'id',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'address',
                        'name': 'yetiToken',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'debtTrackerToken',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentLiquidityIndex',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentBorrowIndex',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentBorrowRate',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentLiquidityRate',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'lastUpdated',
                        'type': 'uint256'
                    },
                    {
                        'components': [
                            {
                                'internalType': 'uint256',
                                'name': 'commissionFactor',
                                'type': 'uint256'
                            },
                            {
                                'internalType': 'uint8',
                                'name': 'currencyDecimals',
                                'type': 'uint8'
                            },
                            {
                                'internalType': 'address',
                                'name': 'interestStrategy',
                                'type': 'address'
                            }
                        ],
                        'internalType': 'struct DataTypesYeti.PoolAssetConfig',
                        'name': 'config',
                        'type': 'tuple'
                    }
                ],
                'internalType': 'struct DataTypesYeti.PoolAssetData[]',
                'name': '',
                'type': 'tuple[]'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'underlying',
                'type': 'address'
            }
        ],
        'name': 'getAsset',
        'outputs': [
            {
                'components': [
                    {
                        'internalType': 'uint256',
                        'name': 'id',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'address',
                        'name': 'yetiToken',
                        'type': 'address'
                    },
                    {
                        'internalType': 'address',
                        'name': 'debtTrackerToken',
                        'type': 'address'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentLiquidityIndex',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentBorrowIndex',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentBorrowRate',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'currentLiquidityRate',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint256',
                        'name': 'lastUpdated',
                        'type': 'uint256'
                    },
                    {
                        'components': [
                            {
                                'internalType': 'uint256',
                                'name': 'commissionFactor',
                                'type': 'uint256'
                            },
                            {
                                'internalType': 'uint8',
                                'name': 'currencyDecimals',
                                'type': 'uint8'
                            },
                            {
                                'internalType': 'address',
                                'name': 'interestStrategy',
                                'type': 'address'
                            }
                        ],
                        'internalType': 'struct DataTypesYeti.PoolAssetConfig',
                        'name': 'config',
                        'type': 'tuple'
                    }
                ],
                'internalType': 'struct DataTypesYeti.PoolAssetData',
                'name': '',
                'type': 'tuple'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getVersion',
        'outputs': [
            {
                'internalType': 'uint256',
                'name': '',
                'type': 'uint256'
            }
        ],
        'stateMutability': 'pure',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'contract IAddressesProvider',
                'name': 'provider',
                'type': 'address'
            }
        ],
        'name': 'initialize',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'lockCollateral',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'payback',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'components': [
                    {
                        'internalType': 'uint256',
                        'name': 'commissionFactor',
                        'type': 'uint256'
                    },
                    {
                        'internalType': 'uint8',
                        'name': 'currencyDecimals',
                        'type': 'uint8'
                    },
                    {
                        'internalType': 'address',
                        'name': 'interestStrategy',
                        'type': 'address'
                    }
                ],
                'internalType': 'struct DataTypesYeti.PoolAssetConfig',
                'name': 'newConfig',
                'type': 'tuple'
            }
        ],
        'name': 'setAssetConfig',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'unlockCollateral',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newImplementation',
                'type': 'address'
            }
        ],
        'name': 'upgradeTo',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newImplementation',
                'type': 'address'
            },
            {
                'internalType': 'bytes',
                'name': 'data',
                'type': 'bytes'
            }
        ],
        'name': 'upgradeToAndCall',
        'outputs': [],
        'stateMutability': 'payable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'asset',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'amount',
                'type': 'uint256'
            }
        ],
        'name': 'withdraw',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    }
];
