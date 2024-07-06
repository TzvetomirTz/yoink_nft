const { ethers } = require('hardhat');

async function main() {
    const YoinkNft = await ethers.getContractFactory("YoinkNft");
    const yoinkNft = await YoinkNft.deploy();
    console.log("Contract Deployed to Address:", yoinkNft.address);
  }
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
