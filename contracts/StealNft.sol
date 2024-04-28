// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.25;

// Imports
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Contract
contract StealNft is ERC721 {

    // Constructor
    constructor() ERC721("StealNft", "STLNFT") { }

    /**
     * @dev Fetches the metadata of an NFT contained in a foreign ERC721 collection and returns it as a string.
     *
     * Requirements:
     *
     * - `nftContractAddress` has to be a valid ERC721 implementation.
     * - `tokenId` has to be a valid token id for the given ERC721.
     */
    function fetchNftMetadataToSteal(address nftContractAddress, uint256 tokenId) public view returns (string memory tokenMetadata) {
        IERC721Metadata foreignNftContract = IERC721Metadata(nftContractAddress);

        return foreignNftContract.tokenURI(tokenId);
    }

    /**
     * @dev Mints in this collection an NFT with the same metadata as the one given in the foreign ERC721 collection.
     *
     * Requirements:
     *
     * - `nftContractAddress` has to be a valid ERC721 implementation.
     * - `tokenId` has to be a valid token id for the given ERC721.
     */
    function steal(address nftContractAddress, uint256 tokenId) public {
        string memory metadata = fetchNftMetadataToSteal(nftContractAddress, tokenId);
    }
}