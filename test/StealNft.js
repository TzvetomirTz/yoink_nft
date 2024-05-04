const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('StealNft', () => {

    const originTokenId = 1;

	let erc721Mock;
    let stealNft;

	let pleb;
	let chad1;
	let chad2;

    beforeEach(async () => {
        const ERC721Mock = await ethers.getContractFactory('ERC721Mock');
		erc721Mock = await ERC721Mock.deploy();

        const StealNft = await ethers.getContractFactory('StealNft');
        stealNft = await StealNft.deploy();

        [pleb, chad1, chad2] = await ethers.getSigners();
        await erc721Mock.mint(pleb.address, originTokenId, "ipfs://something-legally-owned-by-pleb");
    });

    it('Should mint NFT in StealNFT contract with the same metadata as the original one', async () => {
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        await stealNft.connect(chad1).steal(await erc721Mock.getAddress(), originTokenId, chad1.address);
        const stolenTokenMetadata = await stealNft.tokenURI(1);

        expect(stolenTokenMetadata).to.equal(originTokenMetadata);
    });
});
