// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IUniswapV2Factory} from "../interfaces/IUniswapV2Factory.sol";
import {MockUniswapV2Pair} from "./MockUniswapV2Pair.sol";
import {IUniswapV2Pair} from "../interfaces/IUniswapV2Pair.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUniswapV2Factory is IUniswapV2Factory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    address public feeTo;
    address public feeToSetter;

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "UniswapV2: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS");

        MockUniswapV2Pair mockPair = new MockUniswapV2Pair();
        mockPair.initialize(token0, token1);
        pair = address(mockPair);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "UniswapV2: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "UniswapV2: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
