// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title BAGToken
 * @notice Upgradable ERC20 token with ERC20Votes for on-chain governance,
 *         Mints a fixed supply of 1,000,000,000 tokens at initialization.
 */
contract BAGToken is 
    ERC20Upgradeable,
    ERC20VotesUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    UUPSUpgradeable 
{
    // 1,000,000,000 tokens (with 18 decimals) => 1e9 * 1e18
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000e18;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract. Mints the entire supply to `_owner`.
     * @param _name   The ERC20 name (e.g., "BAG Token")
     * @param _symbol The ERC20 symbol (e.g., "BAG")
     * @param _owner  The address that will own this contract (can be a multisig or EOA).
     */
    function initialize(
        string calldata _name,
        string calldata _symbol,
        address _owner
    ) external initializer {
        require(_owner != address(0), "Invalid owner");

        // Initialize all inherited contracts
        __ERC20_init(_name, _symbol);
        __ERC20Votes_init();
        __Ownable_init(_owner);  // Pass owner directly to initialization
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // Mint the entire supply to `_owner`
        _mint(_owner, INITIAL_SUPPLY);
    }

    /**
     * @dev Restricts upgrades to only the contract owner.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Required override for _update (replaces _beforeTokenTransfer and _afterTokenTransfer in OZ 5.x)
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Upgradeable, ERC20VotesUpgradeable) {
        super._update(from, to, amount);
    }
}