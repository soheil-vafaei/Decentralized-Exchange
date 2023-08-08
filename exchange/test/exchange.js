const { expect } = require("chai")
const { ethers, userConfig } = require("hardhat")

const _token = (n) => {
    let _n
    _n = n * (10 ** 18)
    return _n.toString()
}

describe('Exchange', () => {
    let accounts, feeAccount, exchange, token_1, token_2, deployer, user_1
    const feePercent = 10

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('Exchange')
        const Token = await ethers.getContractFactory('Token')

        token_1 = await Token.deploy("SOLI", "SOL", 100000)
        token_2 = await Token.deploy("SOLI DAI", "sDAI", 100000)

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

    describe('depositing token', () => {
        let tranact, res
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
            it('track the deposit token', async () => {
                expect(await token_1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.balanceOf(token_1.address, user_1.address)).to.equal(amount)

            })
            it('emit a tranfer event', async () => {
                const event = res.events[0]
                expect(event.event).to.equal('Deposit')

                const args = event.args
                expect(args.token).to.equal(token_1.address)
                expect(args.user).to.equal(user_1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(amount)
            })
        })
        describe('Failure', () => {
            it('fails when no token are approveed ', async () => {
                await expect(exchange.connect(user_1).depositToken(token_1.address, amount)).to.be.reverted
            })
        })
    })

    describe('withdrawing token', () => {
        let tranact, res
        const amount = '1000000000000000000000'
        beforeEach(async () => {
            // deposit token before withdraw

            // tranfer token to user 1
            tranact = await token_1.connect(deployer).transfer(user_1.address, amount)
            await tranact.wait()
            // approve token
            tranact = await token_1.connect(user_1).approve(exchange.address, amount)
            res = await tranact.wait()
            // deposit token
            tranact = await exchange.connect(user_1).depositToken(token_1.address, amount)
            res = await tranact.wait()

            // now widthraw token
            tranact = await exchange.connect(user_1).withdrawToken(token_1.address, amount)
            res = await tranact.wait()
        })
        describe('Success', () => {
            it('withdraw token  funds', async () => {
                expect(await token_1.balanceOf(exchange.address)).to.equal(0)
                expect(await exchange.tokens(token_1.address, user_1.address)).to.equal(0)
                expect(await exchange.balanceOf(token_1.address, user_1.address)).to.equal(0)

            })
            it('emit a withdraw event', async () => {
                const event = res.events[1]
                expect(event.event).to.equal('Withdraw')

                const args = event.args
                expect(args.token).to.equal(token_1.address)
                expect(args.user).to.equal(user_1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(0)
            })
        })
        describe('Failure', () => {
            it('fails for less balance ', async () => {
                await expect(exchange.connect(user_1).withdrawToken(token_1.address, amount)).to.be.reverted
            })
        })
    })

    describe('making orders', () => {
        let tranact, res

        describe('Success', () => {
            beforeEach(async () => {
                // tranfer token to user 1
                tranact = await token_2.connect(deployer).transfer(user_1.address, _token(100))
                await tranact.wait()

                await tranact.wait()
                // approve token
                tranact = await token_2.connect(user_1).approve(exchange.address, _token(100))
                res = await tranact.wait()
                // deposit token
                tranact = await exchange.connect(user_1).depositToken(token_2.address, _token(100))
                res = await tranact.wait()

                // approve token
                tranact = await token_1.connect(user_1).approve(exchange.address, _token(10))
                res = await tranact.wait()
                // deposit token
                tranact = await exchange.connect(user_1).makeOrder(token_2.address, _token(10), token_1.address, _token(10))
                res = await tranact.wait()
            })
            it('traks the newly create order', async () => {
                expect(await exchange.orderCount()).to.equal(1)
            })
            it('emit a tranfer event', async () => {
                const event = res.events[0]
                expect(event.event).to.equal('Order')

                const args = event.args
                expect(args.orderCount).to.equal(1)
                expect(args.user).to.equal(user_1.address)
                expect(args.tokenGet).to.equal(token_2.address)
                expect(args.amountGet).to.equal(_token(10))
                expect(args.tokenGiv).to.equal(token_1.address)
                expect(args.amountGiv).to.equal(_token(10))
                expect(args.timestamp).to.at.least(0)
            })
        })
        describe('Failure', () => {
            it('rejected with no balance', async () => {
                await expect (exchange.connect(user_1).makeOrder(token_1.address, _token(10), token_2.address, _token(10))).to.be.reverted  
            })
        })
    })
})