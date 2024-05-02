// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.25;

// Imports
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Mock is ERC721 {

    constructor() ERC721("ERC721Mock", "NFTMOCK") { }

    function mint(address _to, uint256 _tokenId) external {
        _safeMint(_to, _tokenId);
    }
}