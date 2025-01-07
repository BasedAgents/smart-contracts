# Agent Wallet Security Implementation Guide

## Overview
This document outlines how to implement security controls for Agent wallet transactions using Eliza and AgentKit. The default implementation ensures that only the Agent Creator (Director) can initiate transactions from the Agent's wallet.

## Default Security Model
By default, the Agent Creator has direct control over the Agent's wallet for efficient operation. This allows for:
- Immediate transaction execution
- No mandatory delay periods
- Direct operational control
- Quick response to opportunities

## Implementation

### Required Dependencies
```typescript
import { ethers } from "ethers";
import { AgentKit } from "agentkit";
```

### Basic Implementation
Here's the core implementation for securing Agent wallet transactions:

```typescript
// Core security implementation
import { ethers } from "ethers";
import { AgentKit } from "agentkit";

class AgentWalletSecurity {
  private agentWalletAddress: string;
  private creatorAddress: string;
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer;

  constructor(
    agentWalletAddress: string,
    creatorAddress: string,
    rpcUrl: string
  ) {
    this.agentWalletAddress = agentWalletAddress;
    this.creatorAddress = creatorAddress;
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.signer = this.provider.getSigner(creatorAddress);
  }

  async authorizeAndExecuteTransaction(
    to: string,
    amount: ethers.BigNumber,
    purpose: string
  ): Promise<void> {
    // Input validation
    if (!ethers.utils.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    if (amount.isZero() || amount.lte(0)) {
      throw new Error("Amount must be greater than 0");
    }

    // Verify creator
    const signerAddress = await this.signer.getAddress();
    if (signerAddress.toLowerCase() !== this.creatorAddress.toLowerCase()) {
      throw new Error("Unauthorized: Only the creator can execute transactions");
    }

    // Execute transaction
    const transactionData = {
      to,
      value: amount,
      data: ethers.utils.toUtf8Bytes(purpose)
    };

    try {
      const txResponse = await this.signer.sendTransaction(transactionData);
      console.log("Transaction sent:", txResponse.hash);

      const txReceipt = await txResponse.wait();
      console.log("Transaction confirmed:", txReceipt.transactionHash);
    } catch (error) {
      console.error("Transaction failed:", error);
      throw new Error("Transaction execution failed");
    }
  }
}
```

### Integration with Eliza

To integrate this security implementation with your Eliza agent, create a handler for wallet-related commands:

```typescript
// In your Eliza agent implementation
import { Message } from 'eliza';
import { AgentWalletSecurity } from './AgentWalletSecurity';

class ElizaWalletHandler {
  private security: AgentWalletSecurity;

  constructor(
    agentWalletAddress: string,
    creatorAddress: string,
    rpcUrl: string
  ) {
    this.security = new AgentWalletSecurity(
      agentWalletAddress,
      creatorAddress,
      rpcUrl
    );
  }

  async handleTransferRequest(message: Message): Promise<string> {
    // Extract transfer details from message
    const { sender, amount, recipient, purpose } = this.parseTransferRequest(message);

    try {
      await this.security.authorizeAndExecuteTransaction(
        recipient,
        ethers.utils.parseEther(amount),
        purpose
      );
      return "Transaction executed successfully";
    } catch (error) {
      if (error.message.includes("Unauthorized")) {
        return "Only the Agent Creator can execute transfers";
      }
      return `Transaction failed: ${error.message}`;
    }
  }

  private parseTransferRequest(message: Message): {
    sender: string;
    amount: string;
    recipient: string;
    purpose: string;
  } {
    // Implement message parsing logic here
    // This would depend on your specific message format
  }
}
```

## Usage Example

```typescript
// Example setup and usage
const handler = new ElizaWalletHandler(
  "0xYourAgentWalletAddress",
  "0xCreatorWalletAddress",
  "https://your-rpc-url"
);

// In your message handling logic
async function handleMessage(message: Message) {
  if (isTransferRequest(message)) {
    const response = await handler.handleTransferRequest(message);
    return response;
  }
  // Handle other message types...
}
```

## Security Considerations

1. **Creator Authentication**
   - Always verify the transaction initiator is the Agent Creator
   - Use proper signature verification
   - Maintain secure key management

2. **Input Validation**
   - Validate all addresses
   - Check amount ranges
   - Sanitize purpose strings

3. **Error Handling**
   - Provide clear error messages
   - Log all transaction attempts
   - Handle network issues gracefully

4. **Transaction Monitoring**
   - Log all successful transactions
   - Monitor for unusual patterns
   - Maintain transaction history

## Future Enhancements

While the default implementation provides direct creator control, the system can evolve through governance to include:

1. **Optional Delay Periods**
   - Add configurable timelock
   - Enable veto periods
   - Implement multi-signature requirements

2. **Enhanced Controls**
   - Transaction limits
   - Whitelisted addresses
   - Purpose restrictions

3. **Advanced Features**
   - Multi-signature support
   - Token holder voting
   - Automated approvals

## Implementation Notes

1. **Environment Setup**
   - Store sensitive values in environment variables
   - Use secure RPC endpoints
   - Implement proper error handling

2. **Testing**
   - Test with small amounts first
   - Verify creator authentication
   - Check error scenarios
   - Validate transaction results

3. **Monitoring**
   - Implement logging
   - Track transaction history
   - Monitor for security events

## Example Environment Configuration

```env
AGENT_WALLET_ADDRESS=0xYourAgentWalletAddress
CREATOR_ADDRESS=0xCreatorWalletAddress
RPC_URL=https://your-rpc-url
```

## Support and Resources
- Eliza Documentation: [Link]
- AgentKit Documentation: [Link]
- Ethers.js Documentation: https://docs.ethers.org/v5/ 