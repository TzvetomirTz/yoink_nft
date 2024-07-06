// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.25;

// Imports
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Contract
contract YoinkNft is ERC721URIStorage, Ownable {

    // Variables
    uint256 private _yoinkNftPrice = 1000000000000000; // 256/256 mem slot
    uint256 private _nextTokenId; // 256/256 mem slot | Equal to 0

    // Constructor
    constructor() ERC721("YoinkNft", "YOINK") Ownable(msg.sender) { }

    // Functions

    /**
     * @dev Mints in this collection an NFT with the same metadata as the one given in the foreign ERC721 collection.
     *
     * Requirements:
     *
     * - `nftContractAddress` has to be a valid ERC721 implementation.
     * - `tokenId` has to be a valid token id for the given ERC721.
     * - Be cool
     */
    function yoink(address nftContractAddress, uint256 tokenId, address receiverAddress) public payable {
        require(msg.value >= _yoinkNftPrice, "You can't yoink for free... Transaction amount insufficient.");

        string memory metadataUri = IERC721Metadata(nftContractAddress).tokenURI(tokenId);

        _safeMint(receiverAddress, ++_nextTokenId);
        _setTokenURI(_nextTokenId, metadataUri);
    }

    /**
     * @dev A getter function for the _yoinkNftPrice.
     */
    function getYoinkNftPrice() public view returns(uint256 yoinkNftPrice) {
        return _yoinkNftPrice;
    }

    /**
     * @dev Adjusts the price of yoinking an NFT.
     *
     * Requirements:
     *
     * - `newYoinkNftPrice` the price to be set for an NFT yoink.
     * - Only callable by the contract owner.
     */
    function adjustNftYoinkPrice(uint256 newYoinkNftPrice) onlyOwner public {
        _yoinkNftPrice = newYoinkNftPrice;
    }

    /**
     * @dev Delivers the harvested value in the contract to the owner of the contract.
     */
    function harvestLegallyObtainedMoney() public {
        payable(owner()).transfer(address(this).balance);
    }
}
