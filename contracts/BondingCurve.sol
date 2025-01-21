// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {FixedPointMathLib} from "solady/src/utils/FixedPointMathLib.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title BondingCurve
 * @notice Exponential curve with integral-based pricing
 */
contract BondingCurve is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    using FixedPointMathLib for uint256;
    using FixedPointMathLib for int256;

    event CurveParametersUpdated(uint256 A, uint256 B);

    IERC20 public BAG;
    uint256 public A;
    uint256 public B;
    uint256 private constant WAD = 1e18;

    error InvalidParameters();
    error InsufficientLiquidity();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _bagToken, address _owner) external initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
        
        BAG = IERC20(_bagToken);
        A = 0;
        B = 0;
    }

    function _authorizeUpgrade(address newImpl) internal override onlyOwner {}

    function updateCurveParameters(uint256 _A, uint256 _B) external onlyOwner {
        if (_A == 0 || _B == 0) revert InvalidParameters();
        A = _A;
        B = _B;
        emit CurveParametersUpdated(_A, _B);
    }

    // cost to go from x1..x2
    function _integrate(uint256 x1, uint256 x2) internal view returns (uint256) {
        if (x2 <= x1) return 0;
        uint256 e1 = _expTerm(x1);
        uint256 e2 = _expTerm(x2);

        uint256 diff = (e2 > e1) ? (e2 - e1) : 0;
        // cost = (A * diff) / B in 1e18 scale
        uint256 cost = FixedPointMathLib.mulWad(diff, A);
        cost = FixedPointMathLib.divWad(cost, B);
        return cost;
    }

    function _expTerm(uint256 x) internal view returns (uint256) {
        int256 scaled = int256(FixedPointMathLib.mulDiv(x, B, WAD));
        return uint256(FixedPointMathLib.expWad(scaled));
    }

    function getBAGBuyQuote(uint256 currentSupply, uint256 bagOrderSize)
        external
        view
        returns (uint256)
    {
        if (bagOrderSize == 0) return 0;
        uint256 e1 = _expTerm(currentSupply);
        uint256 addTerm = FixedPointMathLib.mulDiv(bagOrderSize, B, A);
        uint256 e2 = e1 + addTerm;
        if (e2 <= e1) return 0;

        int256 lnE1 = FixedPointMathLib.lnWad(int256(e1));
        int256 lnE2 = FixedPointMathLib.lnWad(int256(e2));
        int256 lnDiff = (lnE2 > lnE1) ? (lnE2 - lnE1) : int256(0);
        uint256 minted = FixedPointMathLib.mulDiv(uint256(lnDiff), WAD, B);
        return minted;
    }

    function getTokenBuyQuote(uint256 currentSupply, uint256 tokenOrderSize)
        external
        view
        returns (uint256)
    {
        return _integrate(currentSupply, currentSupply + tokenOrderSize);
    }

    function getTokenSellQuote(uint256 currentSupply, uint256 tokensToSell)
        external
        view
        returns (uint256)
    {
        if (tokensToSell > currentSupply) revert InsufficientLiquidity();
        uint256 cost = _integrate(currentSupply - tokensToSell, currentSupply);
        // Must check if we have that much BAG
        if (BAG.balanceOf(address(this)) < cost) revert InsufficientLiquidity();
        return cost;
    }

    // For now, we skip a real "getBAGSellQuote" or partial code for partial
    // since the user mostly uses getTokenSellQuote

    // Called by AICO on graduation or user sells
    function withdrawBAGTo(address to, uint256 amount) external onlyOwner {
        uint256 bal = BAG.balanceOf(address(this));
        if (amount > bal) revert InsufficientLiquidity();
        BAG.transfer(to, amount);
    }
}
