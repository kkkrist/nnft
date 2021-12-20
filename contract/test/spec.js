/* global describe it */
const { expect } = require('chai')
const { ethers } = require('hardhat')
const data = require('../../frontend/src/data/log-stats.json')

describe('NNFT', () => {
  it('Deploys', async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()
  })

  it('Can be paused/unpaused as owner', async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [owner, addr2] = await ethers.getSigners()

    await nnft.connect(owner).pause()
    expect(await nnft.paused()).to.equal(true)

    await expect(
      nnft
        .connect(addr2)
        .safeMint(addr2.address, 99, { value: ethers.utils.parseEther('0.1') })
    ).to.be.revertedWith('Pausable: paused')

    await nnft.connect(owner).unpause()
    expect(await nnft.paused()).to.equal(false)
  })

  it("Can't be paused as non-owner", async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2] = await ethers.getSigners()
    await expect(nnft.connect(addr2).pause()).to.be.revertedWith(
      'Ownable: caller is not the owner'
    )
    expect(await nnft.paused()).to.equal(false)
  })

  it("Can't be unpaused as non-owner", async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [owner, addr2] = await ethers.getSigners()

    await nnft.connect(owner).pause()
    expect(await nnft.paused()).to.equal(true)

    await expect(nnft.connect(addr2).unpause()).to.be.revertedWith(
      'Ownable: caller is not the owner'
    )
    expect(await nnft.paused()).to.equal(true)
  })

  it("Can't mint below value", async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2] = await ethers.getSigners()

    await expect(
      nnft.safeMint(addr2.address, 99, {
        value: ethers.utils.parseEther('0.01')
      })
    ).to.be.revertedWith('Insufficient payment')

    expect(await nnft.exists(99)).to.equal(false)
  })

  it('Can mint token only once', async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2, addr3] = await ethers.getSigners()

    await nnft.safeMint(addr2.address, 99, {
      value: ethers.utils.parseEther('0.1')
    })

    expect(await nnft.exists(99)).to.equal(true)

    await expect(
      nnft.safeMint(addr3.address, 99, {
        value: ethers.utils.parseEther('0.1')
      })
    ).to.be.revertedWith('ERC721: token already minted')

    expect(await nnft.ownerOf(99)).to.equal(addr2.address)
  })

  it('Token URI retrieval works', async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2] = await ethers.getSigners()

    await expect(nnft.tokenURI(99)).to.be.revertedWith(
      'ERC721URIStorage: URI query for nonexistent token'
    )

    await nnft.safeMint(addr2.address, 99, {
      value: ethers.utils.parseEther('0.1')
    })

    expect(await nnft.tokenURI(99)).to.equal('https://nnft.club/token/99')
  })

  it('Adding/removing ads works', async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2, addr3] = await ethers.getSigners()

    await nnft.safeMint(addr2.address, 99, {
      value: ethers.utils.parseEther('0.1')
    })

    expect(await nnft.ownerOf(99)).to.equal(addr2.address)

    expect(
      await nnft
        .connect(addr3)
        .getAd(99)
        .then(bigint => ethers.utils.formatEther(bigint))
    ).to.equal('0.0')

    await expect(
      nnft.connect(addr3).placeAd(99, ethers.utils.parseEther('1'))
    ).to.be.revertedWith("You don't own this token")

    await nnft.connect(addr2).placeAd(99, ethers.utils.parseEther('1'))

    expect(
      await nnft
        .connect(addr3)
        .getAd(99)
        .then(bigint => ethers.utils.formatEther(bigint))
    ).to.equal('1.0')

    await expect(nnft.connect(addr3).removeAd(99)).to.be.revertedWith(
      "You don't own this token"
    )

    await nnft.connect(addr2).removeAd(99)

    expect(
      await nnft
        .connect(addr3)
        .getAd(99)
        .then(bigint => ethers.utils.formatEther(bigint))
    ).to.equal('0.0')
  })

  it('Buying advertised tokens works', async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2, addr3] = await ethers.getSigners()

    await nnft.safeMint(addr2.address, 99, {
      value: ethers.utils.parseEther('0.1')
    })

    expect(await nnft.ownerOf(99)).to.equal(addr2.address)

    await nnft.connect(addr2).placeAd(99, ethers.utils.parseEther('1'))

    expect(
      await nnft
        .connect(addr3)
        .getAd(99)
        .then(bigint => ethers.utils.formatEther(bigint))
    ).to.equal('1.0')

    await expect(
      nnft
        .connect(addr3)
        .buyToken(99, { value: ethers.utils.parseEther('0.1') })
    ).to.be.revertedWith('Insufficient payment')

    await nnft
      .connect(addr3)
      .buyToken(99, { value: ethers.utils.parseEther('1.0') })

    expect(await nnft.ownerOf(99)).to.equal(addr3.address)

    expect(
      await nnft
        .connect(addr3)
        .getAd(99)
        .then(bigint => ethers.utils.formatEther(bigint))
    ).to.equal('0.0')
  })

  it("Can't buy tokens existing but not advertised", async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2, addr3] = await ethers.getSigners()

    await nnft.safeMint(addr2.address, 99, {
      value: ethers.utils.parseEther('0.1')
    })

    expect(await nnft.ownerOf(99)).to.equal(addr2.address)

    expect(
      await nnft
        .connect(addr3)
        .getAd(99)
        .then(bigint => ethers.utils.formatEther(bigint))
    ).to.equal('0.0')

    await expect(
      nnft
        .connect(addr3)
        .buyToken(99, { value: ethers.utils.parseEther('1.0') })
    ).to.be.revertedWith('Token is not for sale')
  })

  it("Can't mint token w/ non-existing id", async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [, addr2] = await ethers.getSigners()

    await expect(
      nnft
        .connect(addr2)
        .safeMint(addr2.address, Object.keys(data).length + 1, {
          value: ethers.utils.parseEther('0.1')
        })
    ).to.be.revertedWith('Token does not exist')
  })

  it('Only owner can withdraw', async () => {
    const NNFT = await ethers.getContractFactory('NNFT')
    const nnft = await NNFT.deploy()
    await nnft.deployed()

    const [owner, addr2] = await ethers.getSigners()

    await nnft.safeMint(addr2.address, 98, {
      value: ethers.utils.parseEther('0.1')
    })
    await nnft.safeMint(addr2.address, 99, {
      value: ethers.utils.parseEther('0.1')
    })

    expect(await nnft.ownerOf(98)).to.equal(addr2.address)
    expect(await nnft.ownerOf(99)).to.equal(addr2.address)

    const contractBalance = await nnft
      .getBalance()
      .then(bigint => ethers.utils.formatEther(bigint))

    expect(contractBalance).to.equal('0.2')

    const ownerBalance = await owner
      .getBalance()
      .then(bigint => ethers.utils.formatEther(bigint))

    await expect(nnft.connect(addr2).withdraw()).to.be.revertedWith(
      'Ownable: caller is not the owner'
    )

    await nnft.connect(owner).withdraw()

    expect(
      await owner
        .getBalance()
        .then(bigint => Number(ethers.utils.formatEther(bigint)))
    ).to.be.above(Number(ownerBalance))
  })
})
