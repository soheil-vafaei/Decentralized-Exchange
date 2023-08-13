const { expect } = require("chai")
const { ethers , waffle} = require("hardhat")
const _token = (n) => {
    let _n
    _n = n * (10 ** 18)
    return _n.toString()
}

describe('boldape', () => {
    let accounts, feeAccount, exchange, deployer, user_1, user_2
    const provider = waffle.provider;

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('BoldApe')

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        user_1 = accounts[2]
        user_2 = accounts[3]

        exchange = await Exchange.deploy(deployer.address, [feeAccount.address], [3])

    })

    describe('depositing token', () => {
        let tranact, res
        beforeEach(async () => {
            // tranfer token to user 1
            tranact = await exchange.connect(user_1).Public_Mint(1,{value:_token(0.02)})//,{value : _token(0.1)}
            await tranact.wait()
            // tranact = await exchange.connect(user_1).Public_Mint(4,{value : _token(0.08)})
            // await tranact.wait()

        })
        describe('Success', () => {
            it('track the mint', async () => {
                expect(await exchange.totalSupply()).to.equal(1)
            })
            it ('get amount', async () => {
                expect(await provider.getBalance(exchange.address)).to.equal(_token(0.02))
            })
            it ('withdraw owner', async () => {
                tranact = await exchange.connect(feeAccount).withdWL(true)//,{value : _token(0.1)}
                await tranact.wait()

                tranact = await exchange.connect(feeAccount).withdrawAll()//,{value : _token(0.1)}
                await tranact.wait()

                expect(await provider.getBalance(feeAccount.address)).to.equal(_token(0.02))
            })
        })
        // describe('Failure', () => {
        //     it('fails when no token are approveed ', async () => {
        //         await expect(exchange.connect(user_1).depositToken(token_1.address, amount)).to.be.reverted
        //     })
        // })
    })

})