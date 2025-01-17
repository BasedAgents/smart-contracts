// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {AICO} from "./AICO.sol";
import {AICOGovernor} from "./AICOGovernor.sol";
import {BondingCurve} from "./BondingCurve.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IAICOFactory} from "./interfaces/IAICOFactory.sol";
import {ERC1967Utils} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

/* 
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    

    AICO        AICO        AICO    
*/
contract AICOFactoryImpl is IAICOFactory, UUPSUpgradeable, ReentrancyGuardUpgradeable, OwnableUpgradeable {
    address public tokenImplementation;
    address public bondingCurve;
    address public governorImplementation;
    address public poolCreationSubsidy;
    address public uniswapV2Factory;
    address public protocolFeeRecipient;
    address public protocolRewards;
    address public WETH;
    uint256 public agentCreationFee;
    IERC20 public BAG;

    event AgentCreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event ContractAddressesUpdated(
        address tokenImplementation,
        address governorImplementation,
        address bondingCurve,
        address poolCreationSubsidy,
        address uniswapV2Factory,
        address bagToken,
        address protocolFeeRecipient,
        address protocolRewards,
        address weth
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _owner,
        address _tokenImplementation, 
        address _governorImplementation, 
        address _bondingCurve,
        address _poolCreationSubsidy,
        address _uniswapV2Factory,
        address _bagToken,
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth
    ) external initializer {
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Ownable_init(_owner);

        agentCreationFee = 100e18; // 100 BAG

        _updateContractAddresses(
            _tokenImplementation,
            _governorImplementation,
            _bondingCurve,
            _poolCreationSubsidy,
            _uniswapV2Factory,
            _bagToken,
            _protocolFeeRecipient,
            _protocolRewards,
            _weth
        );
    }

    function updateContractAddresses(
        address _tokenImplementation,
        address _governorImplementation,
        address _bondingCurve,
        address _poolCreationSubsidy,
        address _uniswapV2Factory,
        address _bagToken,
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth
    ) external onlyOwner {
        _updateContractAddresses(
            _tokenImplementation,
            _governorImplementation,
            _bondingCurve,
            _poolCreationSubsidy,
            _uniswapV2Factory,
            _bagToken,
            _protocolFeeRecipient,
            _protocolRewards,
            _weth
        );
    }

    function _updateContractAddresses(
        address _tokenImplementation,
        address _governorImplementation,
        address _bondingCurve,
        address _poolCreationSubsidy,
        address _uniswapV2Factory,
        address _bagToken,
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth
    ) internal {
        require(_tokenImplementation != address(0), "Zero address not allowed");
        require(_governorImplementation != address(0), "Zero address not allowed");
        require(_bondingCurve != address(0), "Zero address not allowed");
        require(_poolCreationSubsidy != address(0), "Zero address not allowed");
        require(_uniswapV2Factory != address(0), "Zero address not allowed");
        require(_bagToken != address(0), "Zero address not allowed");
        require(_protocolFeeRecipient != address(0), "Zero address not allowed");
        require(_protocolRewards != address(0), "Zero address not allowed");
        require(_weth != address(0), "Zero address not allowed");

        tokenImplementation = _tokenImplementation;
        governorImplementation = _governorImplementation;
        bondingCurve = _bondingCurve;
        poolCreationSubsidy = _poolCreationSubsidy;
        uniswapV2Factory = _uniswapV2Factory;
        BAG = IERC20(_bagToken);
        protocolFeeRecipient = _protocolFeeRecipient;
        protocolRewards = _protocolRewards;
        WETH = _weth;

        emit ContractAddressesUpdated(
            _tokenImplementation,
            _governorImplementation,
            _bondingCurve,
            _poolCreationSubsidy,
            _uniswapV2Factory,
            _bagToken,
            _protocolFeeRecipient,
            _protocolRewards,
            _weth
        );
    }

    function updateAgentCreationFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = agentCreationFee;
        agentCreationFee = _newFee;
        emit AgentCreationFeeUpdated(oldFee, _newFee);
    }

    /// @notice Creates an AICO token with bonding curve mechanics that graduates to Uniswap V2
    /// @param _agentCreator The address of the Agent creator
    /// @param _platformReferrer The address of the platform referrer
    /// @param _agentWallet The address of the agent wallet
    /// @param _tokenURI The ERC20z token URI
    /// @param _name The ERC20 token name
    /// @param _symbol The ERC20 token symbol
    function deploy(
        address _agentCreator,
        address _platformReferrer,
        address _agentWallet,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external payable nonReentrant returns (address token, address governor) {
        // Collect creation fee
        require(BAG.transferFrom(msg.sender, protocolFeeRecipient, agentCreationFee), "Creation fee transfer failed");

        bytes32 tokenSalt = _generateSalt(_agentCreator, _tokenURI);

        token = address(Clones.cloneDeterministic(tokenImplementation, tokenSalt));
        
        AICO(payable(token)).initialize(
            _agentCreator,
            _platformReferrer,
            bondingCurve,
            _agentWallet,
            _tokenURI,
            _name,
            _symbol,
            protocolFeeRecipient,
            protocolRewards,
            WETH,
            poolCreationSubsidy,
            uniswapV2Factory
        );

        bytes32 governorSalt = keccak256(abi.encodePacked(tokenSalt, "governor"));
        governor = address(Clones.cloneDeterministic(governorImplementation, governorSalt));
        
        AICOGovernor(payable(governor)).initialize(
            IVotes(token),
            _agentCreator,
            _votingDelay,
            _votingPeriod,
            _proposalThreshold
        );

        emit AICOTokenCreated(
            address(this),
            _agentCreator,
            _platformReferrer,
            protocolFeeRecipient,
            bondingCurve,
            _tokenURI,
            _name,
            _symbol,
            address(token),
            address(0) // Pool address is not created at deployment
        );

        emit GovernorCreated(
            token,
            governor,
            _agentCreator,
            _votingDelay,
            _votingPeriod,
            _proposalThreshold
        );

        return (token, governor);
    }

    /// @dev Generates a unique salt for deterministic deployment
    function _generateSalt(address _agentCreator, string memory _tokenURI) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                msg.sender,
                _agentCreator,
                keccak256(abi.encodePacked(_tokenURI)),
                block.coinbase,
                block.number,
                block.prevrandao,
                block.timestamp,
                tx.gasprice,
                tx.origin
            )
        );
    }

    /// @notice The implementation address of the factory contract
    function implementation() external view returns (address) {
        return ERC1967Utils.getImplementation();
    }

    /// @dev Authorizes an upgrade to a new implementation
    /// @param _newImpl The new implementation address
    function _authorizeUpgrade(address _newImpl) internal override onlyOwner {}
} 