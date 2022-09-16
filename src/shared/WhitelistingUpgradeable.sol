// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

/**
 * @title WhitelistingUpgradeable
 */
contract WhitelistingUpgradeable is ContextUpgradeable {
    // white-list mapping
    mapping(address => bool) private whitelisteds;

    address private _whiteListAdmin;
    bool _whitelistFree;    

    function __Whitelisting_init() internal onlyInitializing {
        __Whitelisting_init_unchained();
    }

    function __Whitelisting_init_unchained() internal onlyInitializing {
        _setWhitelistAdmin(_msgSender());
    }

    modifier onlyWhiteListAdmin() {
        require(_whiteListAdmin == msg.sender, "ADMIN_ONLY");
        _;
    }

    /**
     * @dev Throws if called by any account that's not whitelisted.
     */
    modifier onlyWhitelisted() {
        require(whitelisteds[msg.sender] || _whitelistFree, "NOT_WHITELIST");
        _;
    }

    function _setWhitelistAdmin(address account) internal {
        _whiteListAdmin = account;
    }

    function freeWhiteList () external onlyWhiteListAdmin {
        require(!_whitelistFree, "WHITELIST_RESUME");
        _whitelistFree = true;
    }

    function resumeWhiteList () external onlyWhiteListAdmin {
        require(_whitelistFree, "WHITELIST_PAUSE");
        _whitelistFree = false;
    }

    /**
     * @dev give an account access to whitelisted
     * @param account Account to grant access
     */
    function addToWhitelisted(address account) external onlyWhiteListAdmin {
        whitelisteds[account] = true;
    }

    /**
     * @dev remove an account's access from whitelisted
     * @param account Account to remove
     */
    function removeWhitelisted(address account) external onlyWhiteListAdmin {
        whitelisteds[account] = false;
    }

    /**
     * @dev give many accounts access to whitelisted
     * @param accounts Accounts to grant access
     */
    function addManyToWhitelisted(address[] calldata accounts)
        external
        onlyWhiteListAdmin
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelisteds[accounts[i]] = true;
        }
    }

    /**
     * @dev remove many accounts' access from whitelisted
     * @param accounts Accounts to remove access
     */
    function removeManyWhitelisted(address[] calldata accounts)
        external
        onlyWhiteListAdmin
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelisteds[accounts[i]] = false;
        }
    }

    /**
     * @dev check if an account is whitelisted
     * @return bool
     */
    function isWhitelisted(address account) public view returns (bool) {
        require(account != address(0));
        return whitelisteds[account];
    }
}
