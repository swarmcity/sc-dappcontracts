const RepTokenFactory = artifacts.require("./SCRepToken.sol");
const SCRepToken = artifacts.require("./SCRepToken.sol");
const hashtagContract = artifacts.require("./HashtagSimpleDeal.sol");
const swtToken = artifacts.require("./MiniMeToken.sol");
var cleardealid = 'abc';
const fs = require('fs');
const request = require('request');
const ethUtil = require('ethereumjs-util');
var utility = require('../utility.js')();

var status = {};

const deployFile = './deploy.json';

if (fs.existsSync(deployFile)) {
	status = require(deployFile);
}


module.exports = function(callback) {
	var self = this;
	//Approval(msg.sender, _spender, _amount);
	// Create the dealhash
	var cleardealid = 'abc';
	var dealhash = this.web3.sha3(cleardealid);
	//console.log('dealhash sha3: ', dealhash);
	var privkey1 = "fab598275b34eeb277c2170aaf20eb571860838ec1db42723537b6283d35731c";
	var sig = ethUtil.ecsign(new Buffer(dealhash.slice(2),'hex'), new Buffer(privkey1, 'hex'));
	//console.log(sig);
	const v = sig.v;
	const r = `0x${sig.r.toString('hex')}`;
	const s = `0x${sig.s.toString('hex')}`;

	var c = this.web3.eth.contract(hashtagContract.abi);
	var hashtagContractInstance = c.at(status.hashtagsimpleedealaddress);

	// hashtagContractInstance.commission.call().then((res)=>{
	// 	var hashtagcommission = res.toNumber();
	// });
	//
	var hashtagcommission = 600000000000000000;
	var dealvalue = 1200000000000000000;

	// prepare the extraData
	var requestValue = hashtagcommission / 2 + dealvalue;
	var txdata = hashtagContractInstance.makeDealForTwo.getData(dealhash, dealvalue, "QmR7XSHoTdxLu3A4uREgKh7rHLKUpR3Kzuc26ZgGS3oGpm", v, r, s, {
		from: this.web3.eth.accounts[1]
	});

	var hashtagcommission = hashtagContractInstance.commission.call({
		from: this.web3.eth.accounts[1]
	});

	var hashtagtitle = hashtagContractInstance.name.call({
		from: this.web3.eth.accounts[1]
	});

	console.log('commission: ', hashtagcommission.toNumber());
	console.log('title: ', hashtagtitle.toString());

	console.log(txdata);

	let extraData = txdata; //"0x55667788";

	const condensed = utility.pack(
		[
			128,
			(extraData.length - 2) / 2,
			extraData,
		], [256, 256, 4]);


	var jordiproofData = condensed;

	var csc = this.web3.eth.contract(swtToken.abi);
	var swtContractInstance = csc.at(status.minimifactoryaddress);

	var events3 = swtContractInstance.Approval({
		fromBlock: "latest"
	});

	var listener3 = events3.watch(function(error, result) {
		console.log('/////// EVENT SWT Approval received:', result.args);
		//listener3.stopWatching();
		//done();
	});

	var events = hashtagContractInstance.ReceivedApproval({
		fromBlock: "latest"
	});
	var listener = events.watch(function(error, result) {
		console.log('/////// EVENT Hashtag ApproveCall received:', result.args);
		//listener.stopWatching();
		//done();
	});

	var events2 = hashtagContractInstance.NewDealForTwo({
		fromBlock: "latest"
	});
	var listener2 = events2.watch(function(error, result) {
		console.log('/////// EVENT NewDealForTwo received:', result.args);
		//listener2.stopWatching();
		//done();
	});


	console.log(status.hashtagsimpleedealaddress);
	console.log(requestValue);
	console.log('0x'+jordiproofData);
	var test = '0x'+jordiproofData;

	swtContractInstance.approveAndCall(status.hashtagsimpleedealaddress, requestValue, '0x'+jordiproofData, {
		from: this.web3.eth.accounts[1],
		gas: 4700000
	}, function(res) {
		console.log('gas used:', res);
	});

	// var balance = swtContractInstance.balanceOf(this.web3.eth.accounts[1]);
	// console.log('balance 1: ',balance.toNumber(), this.web3.eth.accounts[1]);
	// var balance = swtContractInstance.balanceOf(this.web3.eth.accounts[0]);
	// console.log('balance 0: ',balance.toNumber());
	// var balance = swtContractInstance.balanceOf(this.web3.eth.accounts[2]);
	// console.log('balance 2: ',balance.toNumber());
	// var balance = swtContractInstance.balanceOf(this.web3.eth.accounts[4]);
	// console.log('balance 4: ',balance.toNumber());
	// var balance = swtContractInstance.balanceOf(this.web3.eth.accounts[2]);
	// console.log('balance 2: ',balance.toNumber());


};
