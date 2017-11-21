const HashtagSimpleDeal = artifacts.require("./HashtagSimpleDeal.sol");
const MiniMeTokenFactory = artifacts.require("./SCRepToken.sol");
const MiniMeToken = artifacts.require("./SCRepToken.sol");

const fs = require('fs');
const request = require('request');
const metaData = require('./hashtag_metadata.json');

var status = {};

const deployFile = './deploy.json';

if (fs.existsSync(deployFile)) {
	status = require(deployFile);
}

if (status.providerrepaddress){
  console.log('This step has already been done');
  process.exit();
}

const tokenFile = '../build/contracts/SCRepToken.json';

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

		console.log('Deploying REP tokens for ', metaData.title);

		var estimate = self.web3.eth.estimateGas({data: token.unlinked_binary})

		console.log('gasestimate: ', estimate);
	//});



		//debugger;

		MiniMeToken.new(
			deployFile.minimifactoryaddress,
			0,
			0,
			metaData.title + " Provider Rep",
			0,
			"SWR",
			false, {
				gas: estimate+100000,
				gasPrice: gasPrice
			}).then(function(_miniMeToken) {
			var providerrep = _miniMeToken;
			console.log('Provider Rep created at address', _miniMeToken.address);

		});
	});

};
