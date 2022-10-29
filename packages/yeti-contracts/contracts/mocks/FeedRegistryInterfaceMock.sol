// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

contract FeedRegistryInterfaceMock {
    struct AssetPriceFeedData {
        uint80 roundId;
        int256 answer;
        uint256 startedAt;
        uint256 updatedAt;
        uint80 answeredInRound;
    }

    mapping(address => AssetPriceFeedData) _assetPriceFeedData;

    function setPriceForAsset(
        address base,
        int256 price
    ) external {
        AssetPriceFeedData storage asset = _assetPriceFeedData[base];
        asset.answer = price;
    }

    function latestRoundData(address base, address quote) external view
    returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {

        AssetPriceFeedData memory assetData = _assetPriceFeedData[base];

        return (
        assetData.roundId,
        assetData.answer,
        assetData.startedAt,
        assetData.updatedAt,
        assetData.answeredInRound
        );
    }
}


