var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var ApproveAndCallTest = artifacts.require("./ApproveAndCallTest.sol");
var utility = require('../utility.js')();

contract('ApproveAndCallTest', function(accounts) {

	var swtToken;
	var hashtagRepToken;
	var miniMeTokenFactory;
	var hashtagContract;
	var dealContract;
	var hashtagcommission = 2;
	var gasStats = [];
	var approveAndCallTest;

	var self = this;

	describe('Deploy MiniMeToken TokenFactory', function() {
		it("should deploy MiniMeToken contract", function(done) {
			MiniMeTokenFactory.new().then(function(_miniMeTokenFactory) {
				assert.ok(_miniMeTokenFactory.address);
				miniMeTokenFactory = _miniMeTokenFactory;
				console.log('miniMeTokenFactory created at address', _miniMeTokenFactory.address);
				done();
			});
		});
	});

	describe('Deploy SWT (test) Token', function() {
		it("should deploy a MiniMeToken contract", function(done) {
			MiniMeToken.new(
				miniMeTokenFactory.address,
				0,
				0,
				"Swarm City Token",
				18,
				"SWT",
				true
			).then(function(_miniMeToken) {
				assert.ok(_miniMeToken.address);
				console.log('SWT token created at address', _miniMeToken.address);
				swtToken = _miniMeToken;
				done();
			});
		});

		it("should mint tokens for accounts[1] ( seeker ) ", function(done) {
			swtToken.generateTokens(accounts[1], 100).then(function() {
				done();
			});
		});

		// it("should mint tokens for accounts[2] ( provider ) ", function(done) {
		//   swtToken.generateTokens(accounts[2], 300).then(function() {
		//     done();
		//   });
		// });

	});

	describe('create approveandcall data.', function() {

		it("should deploy ApproveAndCallTest Hashtag", function(done) {
			ApproveAndCallTest.new({
				gas: 4700000,
				from: accounts[3]
			}).then(function(instance) {
				approveAndCallTest = instance;
				assert.isNotNull(approveAndCallTest);
				console.log('ApproveAndCallTest created at address', approveAndCallTest.address);
				done();
			});
		});


		it("should do approveandcall", function(done) {
			var events = approveAndCallTest.ApproveCall({
				fromBlock: "latest"
			});
			var listener = events.watch(function(error, result) {
				console.log('ApproveCall received:', result);
				listener.stopWatching();
				//done();
			});

			var events2 = approveAndCallTest.KustMnKloten({
				fromBlock: "latest"
			});
			var listener2 = events2.watch(function(error, result) {
				console.log('KustMnKloten received:', result);
				listener2.stopWatching();
				done();
			});

			var c = web3.eth.contract(approveAndCallTest.abi);
			var approveAndCallTestInstance = c.at(approveAndCallTest.address);
			var txdata = approveAndCallTestInstance.kustmnkloten.getData(accounts[1], {
				from: accounts[1]
			});


			// let txdata = approveAndCallTest.kustmnkloten.getData(accounts[1], {
			// 	from: accounts[1]
			// });

			console.log('txdata=', txdata);

			let extraData = txdata; //"0x55667788";


			const condensed = utility.pack(
				[
					128,
					(extraData.length - 2) / 2,
					extraData,
				], [256, 256, 4]);


			console.log('condensed 1 =', condensed);

			console.log('consensed 2 =', approveAndCallify(txdata));


			swtToken.approveAndCall(approveAndCallTest.address, 10, '0x' + condensed, {
				from: accounts[1]
			}).then(function(res) {
				console.log('gas used:', res.receipt.gasUsed);
				done();
			});
		});
	});

});


function approveAndCallify(input) {

	if (input.slice(0, 2) == '0x') {
		input = input.slice(2);
	}

	function decimalToHex(d, padding) {
		var hex = Number(d).toString(16);
		padding = typeof(padding) === "undefined" || padding === null ? padding = 2 : padding;

		while (hex.length < padding) {
			hex = "0" + hex;
		}

		return hex;
	}

	return (decimalToHex(128, 64) + decimalToHex(input.length / 2, 64) + input);

}
