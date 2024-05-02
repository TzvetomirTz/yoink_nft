const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('StealNft', () => {

    // Variables
	let erc721Mock
    let stealNft

	let pleb
	let chad1
	let chad2

    beforeEach(async () => {
        const ERC721Mock = await ethers.getContractFactory('ERC721Mock');
		erc721Mock = await ERC721Mock.deploy();

        const StealNft = await ethers.getContractFactory('StealNft');
        stealNft = await StealNft.deploy();

        [pleb, chad1, chad2] = await ethers.getSigners();
        erc721Mock.mint(pleb.address, 0);
    })

    it('Should claim NFT', async () => {
		// await erc721Mock._safeMint(owner.address, 0, "");
    })
})
