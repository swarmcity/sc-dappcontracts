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

module.exports = function(callback) {
	var self = this;

	request('http://ethgasstation.info/json/ethgasAPI.json', (error, response, body) => {

		if (error && (response || response.statusCode !== 200)) {
			console.error(error);
			process.exit();
		}

		var ethgasstationInfo = JSON.parse(response.body);

		gasPrice = self.web3.toWei(ethgasstationInfo.safeLow, 'gwei');

		console.log('gasPrice safeLow =', gasPrice);

		console.log('Deploying hastagsimpledeal ', metaData.title);


		HashtagSimpleDeal.new(
			self.web3.toHex(status.swttokenaddress),
			metaData.title,
			1e18 * 6,
			status.metadata,
			self.web3.toHex(status.providerrepaddress),
			self.web3.toHex(status.supplierrepaddress), {
				gas: 3000000,
				gasPrice: gasPrice
			}

		).then(function(_miniMeToken) {

			console.log('HashtagSimpleDeal created at address', _miniMeTokenFactory.address);

		});
	});

};