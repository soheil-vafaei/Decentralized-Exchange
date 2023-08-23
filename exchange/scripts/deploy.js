const { ethers } = require("hardhat")
const hre = require("hardhat");
const _token = (n) => {
  let _n
  _n = n * (10 ** 18)
  return _n.toString()
}

async function main() {

  const Token = await hre.ethers.getContractFactory("Token");
  const Exchange = await hre.ethers.getContractFactory("Exchange");

  const accounts = await ethers.getSigners()
  console.log(`accounts fetch \n ${accounts[0].address}\n ${accounts[1].address}\n }`)

  const sETH = await Token.deploy("Soheil ETH", "sETH", _token(10000));
  const sDAI = await Token.deploy("Soheil DAI", "sDAI", _token(10000));
  const SOL = await Token.deploy("Soheil Token", "SOL", _token(10000));

  await sETH.deployed();
  console.log(
    `Soheil ETH deployed successfully ${sETH.address}`
  );

  await sDAI.deployed();
  console.log(
    `Soheil DAI deployed successfully ${sDAI.address}`
  );

  await SOL.deployed();
  console.log(
    `Soheil Token deployed successfully ${SOL.address}`
  );

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed();
  console.log(
    `Exchange Contract deployed successfully ${exchange.address}`
  );
  

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
