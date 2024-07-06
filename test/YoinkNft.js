const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('YoinkNft', () => {

    const originTokenId = 1;

	let erc721Mock;
    let yoinkNft;

	let pleb;
	let chad1;
	let chad2;

    let yoinkNftPrice;

    beforeEach(async () => {
        const ERC721Mock = await ethers.getContractFactory('ERC721Mock');
		erc721Mock = await ERC721Mock.deploy();

        const YoinkNft = await ethers.getContractFactory('YoinkNft');
        yoinkNft = await YoinkNft.deploy();

        [pleb, chad1, chad2] = await ethers.getSigners();
        await erc721Mock.mint(pleb.address, originTokenId, "ipfs://something-legally-owned-by-pleb");

        yoinkNftPrice = await yoinkNft.getYoinkNftPrice();
    });

    it('Should mint NFT in YoinkNFT contract with the same metadata as the original one', async () => {
        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: yoinkNftPrice }
        );

        expect(await yoinkNft.tokenURI(1)).to.equal(await erc721Mock.tokenURI(originTokenId));
        expect(await yoinkNft.ownerOf(1)).to.equal(chad1.address);
    });

    it('Should fail nft yoink due to not sending any eth in the transaction', async () => {
        try {
            await yoinkNft.connect(chad1).yoink(await erc721Mock.getAddress(), originTokenId, chad1.address)
        } catch (err) {
            const errStr = "VM Exception while processing transaction: reverted with reason string 'You can't yoink for free... Transaction amount insufficient.'";
            expect(err.message.includes(errStr)).to.equal(true);
            return;
        }

        assert.fail(0, 1, 'Exception not thrown');
    });

    it('Should fail nft yoink due to not sending enough eth in the transaction', async () => {
        try {
            await yoinkNft.connect(chad1).yoink(
                await erc721Mock.getAddress(),
                originTokenId,
                chad1.address,
                { value: BigInt(Number(yoinkNftPrice) / 2) }
            )
        } catch (err) {
            const errStr = "VM Exception while processing transaction: reverted with reason string 'You can't yoink for free... Transaction amount insufficient.'";
            expect(err.message.includes(errStr)).to.equal(true);
            return;
        }

        assert.fail(0, 1, 'Exception not thrown');
    });

    it('Should mint multiple NFTs in YoinkNFT contract with the same metadata as the original one to the same owner', async () => {
        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: yoinkNftPrice }
        );
        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: yoinkNftPrice }
        );

        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        const stolenTokenMetadata1 = await yoinkNft.tokenURI(1);
        const stolenTokenMetadata2 = await yoinkNft.tokenURI(2);

        expect(stolenTokenMetadata1).to.equal(originTokenMetadata);
        expect(stolenTokenMetadata2).to.equal(originTokenMetadata);
        expect(await yoinkNft.ownerOf(1)).to.equal(chad1.address);
        expect(await yoinkNft.ownerOf(2)).to.equal(chad1.address);
    });

    it('Should mint multiple NFTs in YoinkNFT contract with the same metadata as the original one to different owners', async () => {
        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: yoinkNftPrice }
        );
        await yoinkNft.connect(chad2).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: yoinkNftPrice }
        );
    
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        const stolenTokenMetadata1 = await yoinkNft.tokenURI(1);
        const stolenTokenMetadata2 = await yoinkNft.tokenURI(2);

        expect(stolenTokenMetadata1).to.equal(originTokenMetadata);
        expect(stolenTokenMetadata2).to.equal(originTokenMetadata);
        expect(await yoinkNft.ownerOf(1)).to.equal(chad1.address);
        expect(await yoinkNft.ownerOf(2)).to.equal(chad2.address);
    });

    it('Should mint NFT in YoinkNFT contract by chad1 for chad2 with the same metadata as the original one', async () => {
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: yoinkNftPrice }
        );

        expect(await yoinkNft.tokenURI(1)).to.equal(originTokenMetadata);
        expect(await yoinkNft.ownerOf(1)).to.equal(chad2.address);
    });

    it('Should mint NFT in YoinkNFT contract with the same metadata as the original one when more eth is sent than required in the transaction', async () => {
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: BigInt(Number(yoinkNftPrice) * 2) }
        );

        expect(await yoinkNft.tokenURI(1)).to.equal(originTokenMetadata);
        expect(await yoinkNft.ownerOf(1)).to.equal(chad1.address);
    });

    it('Should adjust yoinkNftPrice when adjustment is called by the contract creator', async () => {
        await yoinkNft.adjustNftYoinkPrice(BigInt(Number(yoinkNftPrice) * 2));

        expect(yoinkNftPrice).not.equal(await yoinkNft.getYoinkNftPrice());
    });

    it('Should NOT adjust yoinkNftPrice when adjustment is called by random caller who is not the contract creator', async () => {
        try {
            await yoinkNft.connect(chad1).adjustNftYoinkPrice(BigInt(Number(yoinkNftPrice) * 2))
        } catch (err) {
            const errStr = `VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("${chad1.address}")'`;
            expect(err.message.includes(errStr)).to.equal(true);
            return;
        }

        assert.fail(0, 1, 'Exception not thrown');
    });

    it('Should transfer profits to the contract owner when harvest is called by the owner', async () => {
        const initialOwnerBalance = await ethers.provider.getBalance(pleb.address);

        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: yoinkNftPrice }
        );

        await yoinkNft.harvestLegallyObtainedMoney();
        expect(Number(await ethers.provider.getBalance(pleb.address))).to.be.greaterThan(Number(initialOwnerBalance));
    });

    it('Should transfer profits to the contract owner when harvest is called by a random user', async () => {
        const initialOwnerBalance = await ethers.provider.getBalance(pleb.address);

        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: yoinkNftPrice }
        );

        await yoinkNft.connect(chad1).harvestLegallyObtainedMoney();
        expect(Number(await ethers.provider.getBalance(pleb.address))).to.be.greaterThan(Number(initialOwnerBalance));
    });

    it('Should mint NFT in YoinkNFT contract as a copy of another YoinkNft token', async () => {
        await yoinkNft.connect(chad1).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: yoinkNftPrice }
        );
        await yoinkNft.connect(chad2).yoink(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: yoinkNftPrice }
        );

        const originTokenMetadata = await yoinkNft.tokenURI(1);
        const stolenTokenMetadata = await yoinkNft.tokenURI(2);

        expect(stolenTokenMetadata).to.equal(originTokenMetadata);
        expect(await yoinkNft.ownerOf(1)).to.equal(chad1.address);
        expect(await yoinkNft.ownerOf(2)).to.equal(chad2.address);
    });
});
