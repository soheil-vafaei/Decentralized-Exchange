const { ethers } = require("hardhat")
const hre = require("hardhat");
const config = require ("../src/config.json")
const _token = (n) => {

    let _n
    _n = n * (10 ** 18)
    return _n.toString()
}

const wait = (n) => {
    const milliSec = n * 1000
    return new Promise(resolve=> setTimeout(resolve, milliSec))
}

async function main() {

    const accounts = await ethers.getSigners()

    const {chainId} = await ethers.provider.getNetwork()
    console.log("using chain id: ", chainId)

    const SOL = await ethers.getContractAt('Token', config[chainId].SOL.address)
    // console.log("sol deployed", SOL.address)
    const sETH = await ethers.getContractAt('Token', config[chainId].sETH.address)
    const sDAI = await ethers.getContractAt('Token', config[chainId].sDAI.address)
    const Exchange = await ethers.getContractAt('Exchange', config[chainId].Exchange.address)

    const sender = accounts[0]
    const reciver = accounts[1]
    let amount = _token(100)

    let tranact, res, user_1, user_2
    tranact = await sETH.connect(sender).transfer(reciver.address, amount)
    console.log('transfered')

    user_1 = accounts[0]
    user_2 = accounts[1]

    // approve token
    tranact = await SOL.connect(user_1).approve(Exchange.address, amount)
    res = await tranact.wait()

    console.log('approved user 1 to SOL')
    // deposit token
    tranact = await Exchange.connect(user_1).depositToken(SOL.address, amount)
    res = await tranact.wait()

    console.log('deposited user 1 to SOL')

    // approve token/
    tranact = await sETH.connect(user_2).approve(Exchange.address, _token(10))
    res = await tranact.wait()
    console.log('approved user 2 sETH')

    tranact = await Exchange.connect(user_2).depositToken(sETH.address, _token(10))
    res = await tranact.wait()
    console.log('deposited user 2 sETH ')

    let orderId
    tranact = await Exchange.connect(user_1).makeOrder(sETH.address, _token(10), SOL.address, _token(2))
    res = await tranact.wait()
    console.log("makeOrder from ", user_1.address)

    orderId = 1

    tranact = await Exchange.connect(user_1).canselOrder(orderId)
    res = await tranact.wait()
    console.log("canselOrder from ", user_1.address)

    await wait (1)

    tranact = await Exchange.connect(user_1).makeOrder(sETH.address, _token(10), sDAI.address, _token(4))
    res = await tranact.wait()
    console.log("makeOrder from ", user_1.address)

    // let event = res.events[0]
    // const args = event.args
    // orderId = args.orderCount
    let orderId_ = 10

    tranact = await Exchange.connect(user_2).fillOrder(orderId_)
    res = await tranact.wait()
    console.log("filling order from", user_2.address)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
