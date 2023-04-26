require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const fs = require("fs");
const mnemonic =  fs.readFileSync(".secret").toString().trim();
const infuraProjectID =  fs.readFileSync(".infura").toString().trim();


/** @type import('hardhat/config').HardhatUserConfig */ 
module.exports = { 
  networks: {
    goerli : {
      url: "https://goerli.infura.io/v3/"+ infuraProjectID,
      accounts: {
        mnemonic,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10
      }
    }
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "AI135I83HZU5QKNAMYU7UYG2NXNJN47RWF"
  },
  solidity: "0.8.18",
};
