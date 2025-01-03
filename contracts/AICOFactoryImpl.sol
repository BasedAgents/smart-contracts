// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC1967Utils} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";
import {IVotesUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/utils/IVotesUpgradeable.sol";
import {IAICOFactory} from "./interfaces/IAICOFactory.sol";
import {AICO} from "./AICO.sol";
import {AICOGovernor} from "./AICOGovernor.sol";

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
    address public immutable tokenImplementation;
    address public immutable bondingCurve;
    address public immutable governorImplementation;

    constructor(address _tokenImplementation, address _governorImplementation, address _bondingCurve) initializer {
        tokenImplementation = _tokenImplementation;
        governorImplementation = _governorImplementation;
        bondingCurve = _bondingCurve;
    }

    /// @notice Creates an AICO token with bonding curve mechanics that graduates to Uniswap V3
    /// @param _tokenCreator The address of the token creator
    /// @param _platformReferrer The address of the platform referrer
    /// @param _tokenURI The ERC20z token URI
    /// @param _name The ERC20 token name
    /// @param _symbol The ERC20 token symbol
    function deploy(
        address _tokenCreator,
        address _platformReferrer,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external payable nonReentrant returns (address token, address governor) {
        bytes32 tokenSalt = _generateSalt(_tokenCreator, _tokenURI);

        token = address(Clones.cloneDeterministic(tokenImplementation, tokenSalt));
        
        AICO(payable(token)).initialize{value: msg.value}(
            _tokenCreator,
            _platformReferrer,
            bondingCurve,
            _tokenURI,
            _name,
            _symbol
        );

        bytes32 governorSalt = keccak256(abi.encodePacked(tokenSalt, "governor"));
        governor = address(Clones.cloneDeterministic(governorImplementation, governorSalt));
        
        AICOGovernor(payable(governor)).initialize(
            IVotesUpgradeable(token),
            _tokenCreator,
            _votingDelay,
            _votingPeriod,
            _proposalThreshold
        );

        emit AICOTokenCreated(
            address(this),
            _tokenCreator,
            _platformReferrer,
            AICO(payable(token)).protocolFeeRecipient(),
            bondingCurve,
            _tokenURI,
            _name,
            _symbol,
            address(token),
            AICO(payable(token)).poolAddress()
        );

        emit GovernorCreated(
            token,
            governor,
            _tokenCreator,
            _votingDelay,
            _votingPeriod,
            _proposalThreshold
        );

        return (token, governor);
    }

    /// @dev Generates a unique salt for deterministic deployment
    function _generateSalt(address _tokenCreator, string memory _tokenURI) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                msg.sender,
                _tokenCreator,
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

    /// @notice Initializes the factory proxy contract
    /// @param _owner Address of the contract owner
    /// @dev Can only be called once due to initializer modifier
    function initialize(address _owner) external initializer {
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Ownable_init(_owner);
    }

    /// @notice The implementation address of the factory contract
    function implementation() external view returns (address) {
        return ERC1967Utils.getImplementation();
    }

    /// @dev Authorizes an upgrade to a new implementation
    /// @param _newImpl The new implementation address
    function _authorizeUpgrade(address _newImpl) internal override onlyOwner {}
} 