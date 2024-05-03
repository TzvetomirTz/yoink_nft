// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.25;

// Imports
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ERC721Mock is ERC721, ERC721URIStorage {

    constructor() ERC721("ERC721Mock", "NFTMOCK") { }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function mint(address _to, uint256 _tokenId, string memory _tokenURI) external {
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
    }
}