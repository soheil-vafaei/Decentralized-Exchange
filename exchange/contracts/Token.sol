// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";


contract Token
{
    string public name;
    string public symbol;
    uint256 public decimals= 18;
    uint256 public totalSupply;

    mapping (address => uint256)public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;

    event Tranfer (address indexed from, address indexed to, uint256 amount);
    event Approval (address indexed owner, address indexed spender, uint256 amount);

    constructor (string memory _name, string memory _symbol, uint256 _totalSupply)
    {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer (address to , uint256 amount) public returns(bool success) 
    {
        require (balanceOf[msg.sender] >= amount, "youre balance is less") ;
        _transfer (msg.sender, to,amount);
        emit Tranfer(msg.sender, to, amount);
        return true;
    }

    function _transfer (address from, address to ,uint256 amount) internal {
        require (to != address(0), "address to is zero");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }

    function approve (address spender, uint256 value)
    public returns (bool success)
    {
        require (spender != address (0), "address spender is zero");
        allowance[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);

        return true;
    }

    function tranferFrom (address from , address to , uint256 amount) public returns(bool success) 
    {
        require (amount <= balanceOf[from], "balance from is less");
        require (amount <= allowance[from][msg.sender] ,"allow amount is less");
        require (to != address(0), "address to is zero");

        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);

        return true;
    }
}