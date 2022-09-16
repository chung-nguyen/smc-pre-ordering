// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an governor) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the governor account will be the one that deploys the contract. This
 * can later be changed with {transferGovernorship}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyGovernor`, which can be applied to your functions to restrict their use to
 * the governor.
 */
abstract contract GovernableUpgradeable is Initializable, ContextUpgradeable {
    address private _governor;

    event GovernorshipTransferred(address indexed previousGovernor, address indexed newGovernor);

    /**
     * @dev Initializes the contract setting the deployer as the initial governor.
     */
    function __Governable_init() internal onlyInitializing {
        __Governable_init_unchained();
    }

    function __Governable_init_unchained() internal onlyInitializing {
        _transferGovernorship(_msgSender());
    }

    /**
     * @dev Returns the address of the current governor.
     */
    function governor() public view virtual returns (address) {
        return _governor;
    }

    /**
     * @dev Throws if called by any account other than the governor.
     */
    modifier onlyGovernor() {
        require(governor() == _msgSender(), "GOVERNOR_ONLY");
        _;
    }

    /**
     * @dev Leaves the contract without governor. It will not be possible to call
     * `onlyGovernor` functions anymore. Can only be called by the current governor.
     *
     * NOTE: Renouncing governorship will leave the contract without an governor,
     * thereby removing any functionality that is only available to the governor.
     */
    function renounceGovernorship() public virtual onlyGovernor {
        _transferGovernorship(address(0));
    }

    /**
     * @dev Transfers governorship of the contract to a new account (`newGovernor`).
     * Can only be called by the current governor.
     */
    function transferGovernorship(address newGovernor) public virtual onlyGovernor {
        require(newGovernor != address(0), "ZERO_ADDRESS");
        _transferGovernorship(newGovernor);
    }

    /**
     * @dev Transfers governorship of the contract to a new account (`newGovernor`).
     * Internal function without access restriction.
     */
    function _transferGovernorship(address newGovernor) internal virtual {
        address oldGovernor = _governor;
        _governor = newGovernor;
        emit GovernorshipTransferred(oldGovernor, newGovernor);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
