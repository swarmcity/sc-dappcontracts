const HashtagSimpleDeal = artifacts.require("./HashtagSimpleDeal.sol");
const MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
const MiniMeToken = artifacts.require("./MiniMeToken.sol");

const fs = require('fs');
const request = require('request');
const metaData = require('./hashtag_metadata.json');

var status = {};

const deployFile = './deploy.json';

if (fs.existsSync(deployFile)) {
	status = require(deployFile);
}

const tokenFile = '../build/contracts/MiniMeTokenFactory.json';

if (fs.existsSync(tokenFile)) {
	token = require(tokenFile);
}


module.exports = function(callback) {
	var self = this;

	request('http://ethgasstation.info/json/ethgasAPI.json', (error, response, body) => {

		if (error && (response || response.statusCode !== 200)) {
			console.error(error);
			process.exit();
		}

		var ethgasstationInfo = JSON.parse(response.body);

		var gasPrice = self.web3.eth.gasPrice;
		console.log(gasPrice.toString(10)); // "10000000000000"


		//console.log('gasPrice safeLow =', gasPrice);

		console.log('Deploying Tokencontroller ');

		var estimate = self.web3.eth.estimateGas({data: token.unlinked_binary})

		console.log('gasestimate: ', estimate);
	//});



		//debugger;

		MiniMeTokenFactory.new({
			// from: "0x5263261bAD400DEf63AF145270B2bD144ec64E14",
				gas: estimate,
				gasPrice: gasPrice
			}).then(function(_miniMeToken) {
			//var providerrep = _miniMeToken;
			console.log('Tokencontroller created at address', _miniMeToken.address);
		});
	});

};
