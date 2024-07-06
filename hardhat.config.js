require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { SEPOLIA_API_URL, TEST_WLT_PRIVATE_KEY, MAINNET_API_URL, MAINNET_WLT_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.25",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_API_URL,
      accounts: [`0x${TEST_WLT_PRIVATE_KEY}`]
    },
    mainnet: {
      url: MAINNET_API_URL,
      accounts: [`0x${MAINNET_WLT_PRIVATE_KEY}`]
    }
  },
}
