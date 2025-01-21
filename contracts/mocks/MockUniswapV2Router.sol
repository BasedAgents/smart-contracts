// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IUniswapV2Factory} from "../interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Router02} from "../interfaces/IUniswapV2Router02.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MockERC20} from "../MockERC20.sol";

contract MockUniswapV2Router is IUniswapV2Router02 {
    using SafeERC20 for IERC20;

    IUniswapV2Factory public immutable factory;
    address public immutable WETH;

    // Track pool reserves
    mapping(address => mapping(address => uint256)) public reserves;

    constructor(address _factory) {
        factory = IUniswapV2Factory(_factory);
        WETH = address(0);
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(block.timestamp <= deadline, "UniswapV2Router: EXPIRED");
        require(path.length == 2, "UniswapV2Router: INVALID_PATH");

        address tokenIn = path[0];
        address tokenOut = path[1];

        // Check reserves
        uint256 reserveIn = reserves[tokenIn][tokenOut];
        uint256 reserveOut = reserves[tokenOut][tokenIn];
        require(reserveIn > 0 && reserveOut > 0, "No liquidity");

        // Calculate output amount (simplified)
        uint256 amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
        require(amountOut >= amountOutMin, "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");

        // For mock purposes, mint tokens if sender doesn't have enough
        if (IERC20(tokenIn).balanceOf(msg.sender) < amountIn) {
            MockERC20(tokenIn).mint(msg.sender, amountIn);
        }

        // Transfer tokens in
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // For mock purposes, mint tokens if needed
        if (IERC20(tokenOut).balanceOf(address(this)) < amountOut) {
            MockERC20(tokenOut).mint(address(this), amountOut);
        }

        // Transfer tokens out
        IERC20(tokenOut).safeTransfer(to, amountOut);

        // Update reserves
        reserves[tokenIn][tokenOut] = reserveIn + amountIn;
        reserves[tokenOut][tokenIn] = reserveOut - amountOut;

        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
        return amounts;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        require(block.timestamp <= deadline, "UniswapV2Router: EXPIRED");
        
        // Transfer tokens to this contract
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountBDesired);

        // Update reserves
        reserves[tokenA][tokenB] = amountADesired;
        reserves[tokenB][tokenA] = amountBDesired;

        // Return the amounts added
        return (amountADesired, amountBDesired, 100);
    }

    // Omitted other unneeded for brevity...
    function addLiquidityETH(
        address,
        uint,
        uint,
        uint,
        address,
        uint
    ) external payable returns (uint, uint, uint) {
        revert("Not implemented");
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB) {
        return (0, 0);
    }

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        amounts = new uint[](2);
        amounts[0] = 0;
        amounts[1] = 0;
        return amounts;
    }

    // etc. => all no-ops for test
    // ...
}
