const HashtagSimpleDeal = artifacts.require("./HashtagSimpleDeal.sol");

const fs = require('fs');
const request = require('request');
const metaData = require('./hashtag_metadata.json');

var status = {};

const deployFile = './deploy.json';

if (fs.existsSync(deployFile)) {
	status = require(deployFile);
}

if (status.hashtagsimpleedealaddress) {
	console.log('This step has already been done');
	process.exit();
}

const tokenFile = '../build/contracts/HashtagSimpleDeal.json';

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

		console.log('Deploying HashtagSimpleDeal for ', metaData.title);

		var estimate = self.web3.eth.estimateGas({data: token.unlinked_binary})

		console.log('gasestimate: ', estimate);


		HashtagSimpleDeal.new(
			self.web3.toHex(status.swttokenaddress),
			metaData.title,
			1e17 * 6,
			status.metadata,
			self.web3.toHex(status.providerrepaddress),
			self.web3.toHex(status.seekerrepaddress), {
				gas: estimate+1000000,
				gasPrice: gasPrice
			}

		).then(function(_miniMeToken) {

			console.log('HashtagSimpleDeal created at address', _miniMeToken.address);

		});
	});

};
