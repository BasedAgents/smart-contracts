// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./interfaces/IAICOGovernorImpl.sol";
import "./interfaces/IAICO.sol";

/**
 * @title AICOFactoryImpl
 */
contract AICOFactoryImpl is 
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    address public aicoLogic;
    address public governorLogic;

    event AICOCreated(address indexed aico, address indexed governor);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _aicoLogic,
        address _governorLogic,
        address _owner
    ) external initializer {
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        aicoLogic = _aicoLogic;
        governorLogic = _governorLogic;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function createAICOWithGovernor(
        bytes memory aicoInitData,
        address tokenCreator,
        uint256 votingDelay,
        uint256 votingPeriod,
        uint256 proposalThreshold
    ) external onlyOwner returns (address aicoAddress, address governorAddress) {
        // Deploy Governor
        ERC1967Proxy governorProxy = new ERC1967Proxy(governorLogic, "");
        governorAddress = address(governorProxy);

        // decode partial
        bytes memory initNoSelector = new bytes(aicoInitData.length - 4);
        for (uint i = 4; i < aicoInitData.length; i++) {
            initNoSelector[i - 4] = aicoInitData[i];
        }
        (
            address tokenCreator_,
            address platformReferrer,
            address bondingCurve,
            address agentWallet,
            address bagToken,
            string memory tokenURI,
            string memory name,
            string memory symbol,
            address poolSubsidy,
            address uniswapFactory,
            address protocolFeeRecipient,
            address protocolRewards,
            address owner_,
            address governanceContract_
        ) = abi.decode(
            initNoSelector,
            (address,address,address,address,address,string,string,string,address,address,address,address,address,address)
        );

        // We'll replace agentWallet => governorAddress
        // We'll also replace the final "owner_" => this factory's owner
        // We'll also replace governanceContract_ => governorAddress
        bytes memory newAicoInit = abi.encodeWithSelector(
            IAICO.initialize.selector,
            tokenCreator_,
            platformReferrer,
            bondingCurve,
            governorAddress,
            bagToken,
            tokenURI,
            name,
            symbol,
            poolSubsidy,
            uniswapFactory,
            protocolFeeRecipient,
            protocolRewards,
            owner(), 
            governorAddress
        );

        ERC1967Proxy aicoProxy = new ERC1967Proxy(aicoLogic, newAicoInit);
        aicoAddress = address(aicoProxy);

        // Init Governor
        IAICOGovernorImpl gov = IAICOGovernorImpl(governorAddress);
        gov.initialize(
            IAICO(aicoAddress),
            address(this),
            uint48(votingDelay),
            uint32(votingPeriod),
            proposalThreshold
        );

        // Grant initial proposal rights
        gov.setProposerRights(tokenCreator, true);

        // Governor self-ownership
        gov.transferOwnership(governorAddress);

        emit AICOCreated(aicoAddress, governorAddress);
    }

    // admin updates
    function setAICOLogic(address _newLogic) external onlyOwner {
        aicoLogic = _newLogic;
    }

    function setGovernorLogic(address _newLogic) external onlyOwner {
        governorLogic = _newLogic;
    }
}
