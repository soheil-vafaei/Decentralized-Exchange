const { ethers } = require("hardhat")
const hre = require("hardhat");
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

    const SOL = await ethers.getContractAt('Token', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0')
    const sETH = await ethers.getContractAt('Token', '0x5FbDB2315678afecb367f032d93F642f64180aa3')
    const sDAI = await ethers.getContractAt('Token', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
    const Exchange = await ethers.getContractAt('Exchange', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9')

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
