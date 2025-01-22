// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IProtocolRewards} from "./interfaces/IProtocolRewards.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ProtocolRewards
 */
contract ProtocolRewards is IProtocolRewards {
    using SafeERC20 for IERC20;

    error ADDRESS_ZERO();
    error ARRAY_LENGTH_MISMATCH();
    error INVALID_DEPOSIT();
    error INVALID_WITHDRAW();

    // token => user => balance
    mapping(address => mapping(address => uint256)) public tokenBalanceOf;

    event Deposit(
        address indexed from,
        address indexed to,
        bytes4 reason,
        uint256 amount,
        string comment
    );
    event Withdraw(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    constructor() {}

    function depositBatchERC20(
        address token,
        address[] memory recipients,
        uint256[] memory amounts,
        bytes4[] memory reasons,
        string calldata comment
    ) external {
        uint256 len = recipients.length;
        if (len != amounts.length || len != reasons.length) {
            revert ARRAY_LENGTH_MISMATCH();
        }
        uint256 totalRequired;
        for (uint256 i; i < len; ) {
            if (recipients[i] == address(0)) revert ADDRESS_ZERO();
            if (amounts[i] == 0) revert INVALID_DEPOSIT();
            totalRequired += amounts[i];
            tokenBalanceOf[token][recipients[i]] += amounts[i];
            emit Deposit(msg.sender, recipients[i], reasons[i], amounts[i], comment);
            unchecked {
                ++i;
            }
        }
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalRequired);
    }

    function withdraw(address token, address to, uint256 amount) external {
        if (to == address(0)) revert ADDRESS_ZERO();
        if (amount == 0) revert INVALID_WITHDRAW();
        if (amount > tokenBalanceOf[token][msg.sender]) revert INVALID_WITHDRAW();

        tokenBalanceOf[token][msg.sender] -= amount;
        IERC20(token).safeTransfer(to, amount);

        emit Withdraw(msg.sender, to, amount);
    }
}
