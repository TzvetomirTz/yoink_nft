const { ethers } = require('hardhat');

async function main() {
    const StealNft = await ethers.getContractFactory("StealNft");
    const stealNft = await StealNft.deploy();
    console.log("Contract Deployed to Address:", stealNft.address);
  }
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });