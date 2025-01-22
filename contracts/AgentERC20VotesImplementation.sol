// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

/**
 * @title AgentERC20VotesImplementation
 * @notice Minimal "master" contract for Agent tokens. Cloned via EIP-1167.
 *         Each new agent can set or update its agentWallet, which might be an EOA or a Gnosis Safe.
 */
contract AgentERC20VotesImplementation is ERC20Votes {
    // Address that controls minting or special actions
    address public agentWallet;

    // optional metadata
    string public tokenURI;

    // track if initialized
    bool private _initialized;

    event AgentWalletTransferred(address indexed oldWallet, address indexed newWallet);

    constructor() ERC20("MASTER-AGENT", "MAGENT") ERC20Permit("MASTER-AGENT") {
        // This constructor won't be used by clones.
    }

    /**
     * @notice Initialize the token clone.
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _agentWallet The controlling wallet address (EOA, Safe, etc.)
     * @param _tokenURI Optional metadata string
     */
    function initialize(
        string calldata _name,
        string calldata _symbol,
        address _agentWallet,
        string calldata _tokenURI
    ) external {
        require(!_initialized, "Already initialized");
        _initialized = true;

        _nameArg = _name;
        _symbolArg = _symbol;
        agentWallet = _agentWallet;
        tokenURI = _tokenURI;
    }

    // Overriding name() and symbol() because ERC20Votes expects constructor-based.
    string private _nameArg;
    string private _symbolArg;

    function name() public view override returns (string memory) {
        return _nameArg;
    }

    function symbol() public view override returns (string memory) {
        return _symbolArg;
    }

    // -------------------------------------------------------------------------
    // Minting
    // -------------------------------------------------------------------------
    function mint(address to, uint256 amount) external {
        require(msg.sender == agentWallet, "Not agentWallet");
        _mint(to, amount);
    }

    /**
     * @notice Allows the current `agentWallet` to update the wallet address.
     */
    function setAgentWallet(address newWallet) external {
        require(msg.sender == agentWallet, "Not agentWallet");
        require(newWallet != address(0), "Zero address");
        address old = agentWallet;
        agentWallet = newWallet;
        emit AgentWalletTransferred(old, newWallet);
    }

    // -------------------------------------------------------------------------
    // Required ERC20Votes overrides
    // -------------------------------------------------------------------------
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
