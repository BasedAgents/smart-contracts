// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProtocolRewards {
    function depositBatchERC20(
        address token,
        address[] memory recipients,
        uint256[] memory amounts,
        bytes4[] memory reasons,
        string calldata comment
    ) external;

    function tokenBalanceOf(address token, address user) external view returns (uint256);

    function withdraw(
        address token,
        address to,
        uint256 amount
    ) external;
} 