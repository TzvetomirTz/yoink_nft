const { expect } = require('chai');
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
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
        await stealNft.connect(chad1).steal(
            await erc721Mock.getAddress(),
            originTokenId,
            chad1.address,
            { value: stealNftPrice }
        );
        const stolenTokenMetadata = await stealNft.tokenURI(1);

        expect(stolenTokenMetadata).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
    });

    it('Should fail nft steal due to not sending any eth in the transaction', async () => {
        await expect(
            stealNft.connect(chad1).steal(await erc721Mock.getAddress(), originTokenId, chad1.address)
        ).to.be.rejectedWith("VM Exception while processing transaction: reverted with reason string 'You can't steal for free... Transaction amount insufficient.'");
    });

    it('Should fail nft steal due to not sending enough eth in the transaction', async () => {
        await expect(
            stealNft.connect(chad1).steal(
                await erc721Mock.getAddress(),
                originTokenId,
                chad1.address,
                { value: BigInt(Number(stealNftPrice) / 2) }
            )
        ).to.be.rejectedWith("VM Exception while processing transaction: reverted with reason string 'You can't steal for free... Transaction amount insufficient.'");
    });

    it('Should mint multiple NFTs in StealNFT contract with the same metadata as the original one to the same owner', async () => {
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
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

        const stolenTokenMetadata1 = await stealNft.tokenURI(1);
        const stolenTokenMetadata2 = await stealNft.tokenURI(2);

        expect(stolenTokenMetadata1).to.equal(originTokenMetadata);
        expect(stolenTokenMetadata2).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
        expect(await stealNft.ownerOf(2)).to.equal(chad1.address);
    });

    it('Should mint multiple NFTs in StealNFT contract with the same metadata as the original one to different owners', async () => {
        const originTokenMetadata = await erc721Mock.tokenURI(originTokenId);
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
        const stolenTokenMetadata = await stealNft.tokenURI(1);

        expect(stolenTokenMetadata).to.equal(originTokenMetadata);
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
        const stolenTokenMetadata = await stealNft.tokenURI(1);

        expect(stolenTokenMetadata).to.equal(originTokenMetadata);
        expect(await stealNft.ownerOf(1)).to.equal(chad1.address);
    });

    it('Should adjust stealNftPrice when adjustment is called by the contract creator', async () => {
        await stealNft.adjustNftStealPrice(BigInt(Number(stealNftPrice) * 2));

        expect(stealNftPrice).not.equal(await stealNft.getStealNftPrice());
    });

    it('Should NOT adjust stealNftPrice when adjustment is called by random caller who is not the contract creator', async () => {
        await expect(
            stealNft.connect(chad1).adjustNftStealPrice(BigInt(Number(stealNftPrice) * 2))
        ).to.be.rejectedWith(`VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("${chad1.address}")'`);
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

        const finalOwnerBalance = await ethers.provider.getBalance(pleb.address);
        expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
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

        const finalOwnerBalance = await ethers.provider.getBalance(pleb.address);
        expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
    });
});
