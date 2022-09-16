// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * USDM - Mock USD Token for testing
 */
contract USDMToken is ERC20 {
    /**
     * @dev constructor
     * @param name Name of the ERC20 token
     * @param symbol Symbol of the ERC20 token
     */
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {        
        _mint(msg.sender, 1000000000000 * 10 ** uint(decimals()));
    }

    /**
     * Mint an `amount` of tokens for more tests
     */
    function mint(uint256 amount) external {        
        _mint(msg.sender, amount);
    }
}
