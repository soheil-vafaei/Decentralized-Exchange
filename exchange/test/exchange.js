const { expect } = require("chai")
const { ethers } = require("hardhat")


// const token = (n) => {
//     return 
// }

describe('Exchange', () => {
    let accounts, feeAccount, exchange,token_1, deployer, user_1 
    const feePercent = 10

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('Exchange')
        const Token = await ethers.getContractFactory('Token')
        
        token_1 = await Token.deploy("Token", "Symbol", 100000)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        user_1 = accounts[2]


        exchange = await Exchange.deploy(feeAccount.address, feePercent)

    })
    describe('deployment', () => {
        it('trak the fee account', async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })
        it('trak the fee percent', async () => {
            expect(await exchange.feePercentage()).to.equal(feePercent)
        })

    })

    describe ('depositing token' ,() => {
        let tranact , res 
        const amount = '1000000000000000000000'
        beforeEach(async () => {
            // tranfer token to user 1
            tranact = await token_1.connect(deployer).transfer(user_1.address, amount)
            await tranact.wait()
            // approve token
            tranact = await token_1.connect(user_1).approve(exchange.address, amount)
            res = await tranact.wait()
            // deposit token
            tranact = await exchange.connect(user_1).depositToken(token_1.address, amount)
            res = await tranact.wait()
        })
        describe('Success', () => {
            it ('track the deposit token', async () => {
                expect(await token_1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.balanceOf(token_1.address, user_1.address)).to.equal(amount)

            })
            it ('emit a tranfer event', async () => {
                const event= res.events[0]
                expect(event.event).to.equal('Deposit')
                
                const args= event.args
                expect(args.token).to.equal(token_1.address)
                expect(args.user).to.equal(user_1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(amount)    
            })
        })
        describe('Failure', () => {
            it ('fails when no token are approveed ', async () => {
                await expect (exchange.connect(user_1).depositToken(token_1.address, amount)).to.be.reverted
            })
        })
    })
})