// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.25;

// Imports
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Contract
contract StealNft is ERC721, ERC721URIStorage {

    // Variables
    uint256 private _nextTokenId;

    // Constructor
    constructor() ERC721("StealNft", "STLNFT") { }

    // Function Overrides
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Functions

    /**
     * @dev Mints in this collection an NFT with the same metadata as the one given in the foreign ERC721 collection.
     *
     * Requirements:
     *
     * - `nftContractAddress` has to be a valid ERC721 implementation.
     * - `tokenId` has to be a valid token id for the given ERC721.
     */
    function steal(address nftContractAddress, uint256 tokenId, address receiverAddress) public {
        string memory metadataUri = IERC721Metadata(nftContractAddress).tokenURI(tokenId);

        _safeMint(receiverAddress, ++_nextTokenId);
        _setTokenURI(tokenId, metadataUri);
    }
}