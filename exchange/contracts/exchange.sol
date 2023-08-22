// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Token.sol";
// import "hardhat/console.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercentage;

    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCanselled;

    // order mappings
    struct _Order {
        uint256 _id;
        address _user;
        address _tokenGet;
        uint256 _amountGet;
        address _tokenGiv;
        uint256 _amountGiv;
        uint256 _timestamp;
    }

    event Deposit(
        address indexed token,
        address indexed user,
        uint256 amount,
        uint256 balance
    );
    event Withdraw(
        address indexed token,
        address indexed user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 orderCount,
        address indexed user,
        address indexed tokenGet,
        uint256 amountGet,
        address indexed tokenGiv,
        uint256 amountGiv,
        uint256 timestamp
    );
    event Cansel(
        uint256 orderCount,
        address indexed user,
        address indexed tokenGet,
        uint256 amountGet,
        address indexed tokenGiv,
        uint256 amountGiv,
        uint256 timestamp
    );

    event Trade (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGiv,
        uint256 amountGiv,
        address creator,
        uint256 timestamp
    );

    constructor(address _feeAccount, uint256 _feePercentage) {
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }

    //------- deposit and withdraw tokens -------//

    // deplosit token
    function depositToken(address _token, uint256 _amount) public {
        // transfer token to dex
        require(
            Token(_token).tranferFrom(msg.sender, address(this), _amount),
            "cant transfer from to exchange"
        );
        // upd balance
        tokens[_token][msg.sender] += _amount;
        // emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(tokens[_token][msg.sender] >= _amount, "less balance");
        // tranfer token to user
        require(Token(_token).transfer(msg.sender, _amount));
        // upd user balance
        tokens[_token][msg.sender] -= _amount;
        // emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // check balance
    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    //------- make and cansel orders -------//

    // token give token spend -- witch token and how much
    // token get receive      -- witch token and how much
    function makeOrder(
        address _tokenGet,
        uint _amountGet,
        address _tokenGiv,
        uint _amountGiv
    ) public {
        // require token balance
        require(balanceOf(_tokenGet, msg.sender) >= _amountGet, "no balance");

        // make order
        orderCount++;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGiv,
            _amountGiv,
            block.timestamp
        );

        // emit event
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGiv,
            _amountGiv,
            block.timestamp
        );
    }

    function canselOrder(uint256 id_) public {
        // fetch order
        _Order storage _order = orders[id_];

        require(
            address(_order._user) == msg.sender,
            "you are can not cansel this order"
        );
        require(_order._id == id_, "thats order is not exist");

        // cansel
        orderCanselled[id_] = true;

        // emit event
        emit Cansel(
            _order._id,
            msg.sender,
            _order._tokenGet,
            _order._amountGet,
            _order._tokenGiv,
            _order._amountGiv,
            block.timestamp
        );
    }

    // Excuting order
    function fillOrder(uint id_) public {
        // swapping token <trade>//
        // fetch order
        _Order memory _order = orders[id_];
        // require(_order._id == id_, "thats order is not exist");
        _trade(
            _order._id,
            _order._user,
            _order._tokenGet,
            _order._amountGet,
            _order._tokenGiv,
            _order._amountGiv
        );
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGiv,
        uint256 _amountGiv
    ) internal {
        // do trade here/
        // get fee from msg.sender user 2
        uint256 feeAmount = (_amountGet * feePercentage) / 100;
        
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] - (_amountGet + feeAmount);
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] + _amountGet;


        tokens[_tokenGet][feeAccount] += feeAmount;

        tokens[_tokenGiv][msg.sender] -= _amountGiv;
        tokens[_tokenGiv][_user] += _amountGiv;

        emit Trade(_orderId, msg.sender, _tokenGet, _amountGet, _tokenGiv, _amountGiv, _user, block.timestamp);
    }
}
