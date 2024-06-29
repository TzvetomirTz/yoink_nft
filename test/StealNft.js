const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('StealNft', () => {

    const originTokenId = 1;

	let erc721Mock;
    let stealNft;

	let pleb;
	let chad1;
	let chad2;

    let stealNftPrice;

    beforeEach(async () => {
        const ERC721Mock = await ethers.getContractFactory('ERC721Mock');
		erc721Mock = await ERC721Mock.deploy();

        const StealNft = await ethers.getContractFactory('StealNft');
        stealNft = await StealNft.deploy();

        [pleb, chad1, chad2] = await ethers.getSigners();
        await erc721Mock.mint(pleb.address, originTokenId, "ipfs://something-legally-owned-by-pleb");

        stealNftPrice = await stealNft.getStealNftPrice();
    });

    it('Should mint NFT in StealNFT contract with the same metadata as the original one', async () => {
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: stealNftPrice }
        );

        expect(await stealNft.tokenURI(1)).to.equal(await erc721Mock.tokenURI(originTokenId));
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
    });

    it('Should fail nft steal due to not sending any eth in the transaction', async () => {
        try {
            await stealNft.connect(chad1).steal(await erc721Mock.getAddress(), originTokenId, chad1.address)
        } catch (err) {
            const errStr = "VM Exception while processing transaction: reverted with reason string 'You can't steal for free... Transaction amount insufficient.'";
            expect(err.message.includes(errStr)).to.equal(true);
            return;
        }

        assert.fail(0, 1, 'Exception not thrown');
    });

    it('Should fail nft steal due to not sending enough eth in the transaction', async () => {
        try {
            await stealNft.connect(chad1).steal(
                await erc721Mock.getAddress(),
                originTokenId,
                chad1.address,
                { value: BigInt(Number(stealNftPrice) / 2) }
            )
        } catch (err) {
            const errStr = "VM Exception while processing transaction: reverted with reason string 'You can't steal for free... Transaction amount insufficient.'";
            expect(err.message.includes(errStr)).to.equal(true);
            return;
        }

        assert.fail(0, 1, 'Exception not thrown');
    });

    it('Should mint multiple NFTs in StealNFT contract with the same metadata as the original one to the same owner', async () => {
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: stealNftPrice }
        );
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: stealNftPrice }
        );

        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        const stolenTokenMetadata1 = await stealNft.tokenURI(1);
        const stolenTokenMetadata2 = await stealNft.tokenURI(2);

        expect(stolenTokenMetadata1).to.equal(originTokenMetadata);
        expect(stolenTokenMetadata2).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
        expect(await stealNft.ownerOf(2)).to.equal(chad1.address);
    });

    it('Should mint multiple NFTs in StealNFT contract with the same metadata as the original one to different owners', async () => {
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: stealNftPrice }
        );
        await stealNft.connect(chad2).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: stealNftPrice }
        );
    
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        const stolenTokenMetadata1 = await stealNft.tokenURI(1);
        const stolenTokenMetadata2 = await stealNft.tokenURI(2);

        expect(stolenTokenMetadata1).to.equal(originTokenMetadata);
        expect(stolenTokenMetadata2).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
        expect(await stealNft.ownerOf(2)).to.equal(chad2.address);
    });

    it('Should mint NFT in StealNFT contract by chad1 for chad2 with the same metadata as the original one', async () => {
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: stealNftPrice }
        );

        expect(await stealNft.tokenURI(1)).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad2.address);
    });

    it('Should mint NFT in StealNFT contract with the same metadata as the original one when more eth is sent than required in the transaction', async () => {
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: BigInt(Number(stealNftPrice) * 2) }
        );

        expect(await stealNft.tokenURI(1)).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
    });

    it('Should adjust stealNftPrice when adjustment is called by the contract creator', async () => {
        await stealNft.adjustNftStealPrice(BigInt(Number(stealNftPrice) * 2));

        expect(stealNftPrice).not.equal(await stealNft.getStealNftPrice());
    });

    it('Should NOT adjust stealNftPrice when adjustment is called by random caller who is not the contract creator', async () => {
        try {
            await stealNft.connect(chad1).adjustNftStealPrice(BigInt(Number(stealNftPrice) * 2))
        } catch (err) {
            const errStr = `VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("${chad1.address}")'`;
            expect(err.message.includes(errStr)).to.equal(true);
            return;
        }

        assert.fail(0, 1, 'Exception not thrown');
    });

    it('Should transfer profits to the contract owner when harvest is called by the owner', async () => {
        const initialOwnerBalance = await ethers.provider.getBalance(pleb.address);

        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: stealNftPrice }
        );

        await stealNft.harvestLegallyObtainedMoney();
        expect(Number(await ethers.provider.getBalance(pleb.address))).to.be.greaterThan(Number(initialOwnerBalance));
    });

    it('Should transfer profits to the contract owner when harvest is called by a random user', async () => {
        const initialOwnerBalance = await ethers.provider.getBalance(pleb.address);

        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: stealNftPrice }
        );

        await stealNft.connect(chad1).harvestLegallyObtainedMoney();
        expect(Number(await ethers.provider.getBalance(pleb.address))).to.be.greaterThan(Number(initialOwnerBalance));
    });

    it('Should mint NFT in StealNFT contract as a copy of another StealNft token', async () => {
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: stealNftPrice }
        );
        await stealNft.connect(chad2).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad2.address,
            { value: stealNftPrice }
        );

        const originTokenMetadata = await stealNft.tokenURI(1);
        const stolenTokenMetadata = await stealNft.tokenURI(2);

        expect(stolenTokenMetadata).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
        expect(await stealNft.ownerOf(2)).to.equal(chad2.address);
    });
});
