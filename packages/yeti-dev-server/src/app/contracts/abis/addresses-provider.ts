export const ADDRESSES_PROVIDER_ABI = [
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'bytes32',
                'name': 'forId',
                'type': 'bytes32'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newAddress',
                'type': 'address'
            }
        ],
        'name': 'AddressChanged',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'newAddress',
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
                'indexed': false,
                'internalType': 'address',
                'name': 'implementation',
                'type': 'address'
            }
        ],
        'name': 'AssetPoolManagerUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'implementation',
                'type': 'address'
            }
        ],
        'name': 'MarketProtocolUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'previousOwner',
                'type': 'address'
            },
            {
                'indexed': true,
                'internalType': 'address',
                'name': 'newOwner',
                'type': 'address'
            }
        ],
        'name': 'OwnershipTransferred',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'implementation',
                'type': 'address'
            }
        ],
        'name': 'PriceFeedUpdated',
        'type': 'event'
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': false,
                'internalType': 'bytes32',
                'name': 'forId',
                'type': 'bytes32'
            },
            {
                'indexed': false,
                'internalType': 'address',
                'name': 'proxyAddress',
                'type': 'address'
            }
        ],
        'name': 'ProxyCreated',
        'type': 'event'
    },
    {
        'inputs': [],
        'name': 'getAssetPoolManager',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getMarketAdmin',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getMarketProtocol',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'getPriceFeed',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'owner',
        'outputs': [
            {
                'internalType': 'address',
                'name': '',
                'type': 'address'
            }
        ],
        'stateMutability': 'view',
        'type': 'function'
    },
    {
        'inputs': [],
        'name': 'renounceOwnership',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'bytes32',
                'name': 'forId',
                'type': 'bytes32'
            },
            {
                'internalType': 'address',
                'name': 'newAddress',
                'type': 'address'
            }
        ],
        'name': 'setAddress',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '_impl',
                'type': 'address'
            }
        ],
        'name': 'setAssetPoolManager',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'admin',
                'type': 'address'
            }
        ],
        'name': 'setMarketAdmin',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '_impl',
                'type': 'address'
            }
        ],
        'name': 'setMarketProtocol',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': '_impl',
                'type': 'address'
            }
        ],
        'name': 'setPriceFeed',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    },
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'newOwner',
                'type': 'address'
            }
        ],
        'name': 'transferOwnership',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    }
];
