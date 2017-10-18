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

if (status.supplierrepaddress){
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

		console.log('Deploying REP tokens for ', metaData.title);

		MiniMeToken.new(
			deployFile.minimifactoryaddress,
			0,
			0,
			metaData.title + " Supplier Rep",
			18,
			"SWR",
			false, {
				gas: 3000000,
				gasPrice: gasPrice
			}).then(function(_miniMeToken) {

			console.log('Supplier Rep created at address', _miniMeTokenFactory.address);

		});
	});

};