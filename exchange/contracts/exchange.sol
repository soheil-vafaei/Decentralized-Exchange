// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";


contract Exchange{

    address public feeAccount ;
    uint256 public feePercentage;

    mapping (address => mapping (address => uint256)) public tokens;

    event Deposit (address indexed token, address indexed user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercentage){
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }

    // deplosit token
    function depositToken (address _token, uint256 _amount) public 
    {
        // transfer token to dex
        require(Token(_token).tranferFrom(msg.sender, address(this),_amount));
        // upd balance
        tokens[_token][msg.sender] += _amount;
        // emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // check balance
    function balanceOf (address _token, address _user) public view returns (uint256)
    {
        return tokens[_token][_user] ;
    }



}