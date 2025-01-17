// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FixedPointMathLib} from "solady/src/utils/FixedPointMathLib.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/* 
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    

    AICO        AICO        AICO    
*/
contract BondingCurve is OwnableUpgradeable, UUPSUpgradeable {
    using FixedPointMathLib for uint256;
    using FixedPointMathLib for int256;

    error InsufficientLiquidity();

    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    IERC20 public immutable BAG;
    
    // y = A*e^(Bx)
    // A = ~1.06 BAG initial price
    // B = 0.023 adjusted for 500k BAG total cost
    // Price progression:
    // At 0 tokens: 1.06 BAG
    // At 100M tokens: ~10.2 BAG
    // At 250M tokens: ~98.5 BAG
    // At 500M tokens: ~4,634.21 BAG
    uint256 public A;
    uint256 public B;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _bagToken) {
        if (_bagToken == address(0)) revert("Zero address");
        BAG = IERC20(_bagToken);
        _disableInitializers();
    }

    function initialize(address _tokenCreator) external initializer {
        __Ownable_init(_tokenCreator);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function getBAGSellQuote(uint256 currentSupply, uint256 bagOrderSize) external view returns (uint256) {
        uint256 deltaY = bagOrderSize;
        uint256 x0 = currentSupply;
        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());

        uint256 exp_b_x1 = exp_b_x0 - deltaY.fullMulDiv(B, A);
        uint256 x1 = uint256(int256(exp_b_x1).lnWad()).divWad(B);
        uint256 tokensToSell = x0 - x1;

        return tokensToSell;
    }

    function getTokenSellQuote(uint256 currentSupply, uint256 tokensToSell) external view returns (uint256) {
        if (currentSupply < tokensToSell) revert InsufficientLiquidity();
        uint256 x0 = currentSupply;
        uint256 x1 = x0 - tokensToSell;

        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());
        uint256 exp_b_x1 = uint256((int256(B.mulWad(x1))).expWad());

        // calculate deltaY = (a/b)*(exp(b*x0) - exp(b*x1))
        uint256 deltaY = (exp_b_x0 - exp_b_x1).fullMulDiv(A, B);

        return deltaY;
    }

    function getBAGBuyQuote(uint256 currentSupply, uint256 bagOrderSize) external view returns (uint256) {
        uint256 x0 = currentSupply;
        uint256 deltaY = bagOrderSize;

        // calculate exp(b*x0)
        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());

        // calculate exp(b*x0) + (dy*b/a)
        uint256 exp_b_x1 = exp_b_x0 + deltaY.fullMulDiv(B, A);

        uint256 deltaX = uint256(int256(exp_b_x1).lnWad()).divWad(B) - x0;

        return deltaX;
    }

    function getTokenBuyQuote(uint256 currentSupply, uint256 tokenOrderSize) external view returns (uint256) {
        uint256 x0 = currentSupply;
        uint256 x1 = tokenOrderSize + currentSupply;

        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());
        uint256 exp_b_x1 = uint256((int256(B.mulWad(x1))).expWad());

        uint256 deltaY = (exp_b_x1 - exp_b_x0).fullMulDiv(A, B);

        return deltaY;
    }

    function updateCurveParameters(uint256 _A, uint256 _B) external onlyOwner {
        A = _A;
        B = _B;
        emit CurveParametersUpdated(A, B);
    }
    event CurveParametersUpdated(uint256 _A, uint256 _B);
}