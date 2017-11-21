const RepTokenFactory = artifacts.require("./SCRepToken.sol");
const SCRepToken = artifacts.require("./SCRepToken.sol");
const HashtagSimpleDeal = artifacts.require("./HashtagSimpleDeal.sol");

const fs = require('fs');
const request = require('request');

var status = {};

const deployFile = './deploy.json';

if (fs.existsSync(deployFile)) {
	status = require(deployFile);
}


module.exports = function(callback) {
	var self = this;

  this.web3.eth.getGasPrice(function(err, gasPrice) {

    console.log('gasprice = ', gasPrice.toNumber());

    // HASHTAG GOES HERE
    var providerRepContract = SCRepToken.at(status.providerrepaddress);

    // FACTORY GOES HERE
    providerRepContract.changeController(status.hashtagsimpleedealaddress, {
      gas: 200000,
      gasPrice: gasPrice
    }).then(function(res) {
			console.log(res);
			providerRepContract.controller.call().then(function(result) {
				console.log('*** ',result,' ****');
			});
    });



		// HASHTAG GOES HERE
		var seekerRepContract = SCRepToken.at(status.seekerrepaddress);

		// FACTORY GOES HERE
		seekerRepContract.changeController(status.hashtagsimpleedealaddress, {
			gas: 200000,
			gasPrice: gasPrice
		}).then(function(res) {
			console.log(res);
			seekerRepContract.controller.call().then(function(result) {
				console.log('*** ',result,' ****');
			});
		});

		// HASHTAG GOES HERE
		var hashtag = HashtagSimpleDeal.at(status.hashtagsimpleedealaddress);

		// FACTORY GOES HERE
		hashtag.setPayoutAddress(status.payoutaddress, {
			gas: 200000,
			gasPrice: gasPrice
		}).then(function(res) {
			hashtag.payoutaddress.call().then(function(result) {
				console.log('*** ',result,' ****');
			});
			console.log(res);
		});

  });

};
