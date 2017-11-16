var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var RepTokenFactory = artifacts.require("./SCRepToken.sol");
var RepToken = artifacts.require("./SCRepToken.sol");
var Hashtag = artifacts.require("./HashtagSimpleDeal.sol");
var utility = require('../utility.js')();
const ethUtil = require('ethereumjs-util');

contract('HashtagSimpleDeal', function(accounts) {

  var swtToken;
  var hashtagProviderRepToken;
  var hashtagSeekerRepToken;
  var miniMeTokenFactory;
  var repTokenFactory;
  var hashtagContract;
  var dealContract;
  var hashtagcommission = 600000000000000000;
  var dealvalue = 1200000000000000000;
  var gasStats = [];
  var payoutaddress = accounts[4];
  var seeker = accounts[1];
  var provider = accounts[2];

  var cleardealid = 'abc';

  var self = this;

  describe('Deploy MiniMeToken TokenFactory', function() {
    it("should deploy MiniMeToken contract", function(done) {
      MiniMeTokenFactory.new().then(function(_miniMeTokenFactory) {
        assert.ok(_miniMeTokenFactory.address);
        miniMeTokenFactory = _miniMeTokenFactory;
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
        swtToken = _miniMeToken;
        //console.log('SWT Token: ', swtToken.address);
        done();
      });
    });

    it("should mint SWT tokens for Seeker", function(done) {
      swtToken.generateTokens(seeker, 100e18).then(function() {
        done();
      });
    });

    it("should see token balance Seeker account", function(done) {
      swtToken.balanceOf(seeker).then(function(balance) {
        assert.equal(balance.toNumber(), 100e18, "seeker balance not correct after swt minting");
        done();
      });
    });

    it("should mint SWT tokens for Provider", function(done) {
      swtToken.generateTokens(provider, 100e18).then(function() {
        done();
      });
    });

    it("should see token balance Provider account", function(done) {
      swtToken.balanceOf(provider).then(function(balance) {
        assert.equal(balance.toNumber(), 100e18, "provider balance not correct after swt minting");
        done();
      });
    });
  });

  describe('Hashtag Simple Deal creation flow', function() {

    it("should deploy RepTokenFactory contract", function(done) {
      RepTokenFactory.new().then(function(_repTokenFactory) {
        assert.ok(_repTokenFactory.address);
        repTokenFactory = _repTokenFactory;
        done();
      });
    });

    it("should deploy a ProviderRep minime contract", function(done) {
      RepToken.new(
        repTokenFactory.address,
        0,
        0,
        "Swarm City Provider Rep",
        0,
        "SWR",
        false
      ).then(function(_repToken) {
        assert.ok(_repToken.address);
        hashtagProviderRepToken = _repToken; //.address;
        done();
      });
    });

    it("should deploy a SeekerRep minime contract", function(done) {
      RepToken.new(
        repTokenFactory.address,
        0,
        0,
        "Swarm City Seeker Rep",
        0,
        "SWR",
        false
      ).then(function(_repToken) {
        assert.ok(_repToken.address);
        hashtagSeekerRepToken = _repToken; //.address;
        done();
      });
    });


    it("should deploy 'BoardWalkV2Test' Hashtag", function(done) {
      // commission for this hastag is hashtagcommission SWT
      //console.log('SWT Token: ', swtToken.address);
      //console.log('hashtagProviderRepToken Token: ', hashtagProviderRepToken.address);
      //console.log('hashtagSeekerRepToken Token: ', hashtagSeekerRepToken.address);
      //console.log('Seeker: ', seeker);
      //console.log('Provider: ', provider);

      Hashtag.new(swtToken.address, "BoardWalkV2Test", hashtagcommission, "QmNogIets", hashtagProviderRepToken.address, hashtagSeekerRepToken.address).then(function(instance) {
        //console.log(instance);
        hashtagContract = instance;
        //console.log('hashtagContract Token: ', hashtagContract.address);

        assert.isNotNull(hashtagContract);
        // console.log(hashtagContract);
        // hashtagContract.getProviderRepTokenAddress.call().then(function(tokenaddress) {
        //   hashtagProviderRepToken = MiniMeToken.at(tokenaddress);
        //   hashtagContract.getSeekerRepTokenAddress.call().then(function(tokenaddress) {
        //     hashtagSeekerRepToken = MiniMeToken.at(tokenaddress);
        //     done();
        //   });
        // });
        done();
      });
    });

    it("should change controller of ProviderRepToken to 'BoardWalkV2Test' Hashtag", function(done) {

      hashtagProviderRepToken.changeController(hashtagContract.address).then(function() {
        hashtagProviderRepToken.controller.call().then(function(controller){
          assert.equal(controller,hashtagContract.address, "controller should be PioneerTest");
          done();
        });
      });
    });

    it("should change controller of SeekerRepToken to 'BoardWalkV2Test' Hashtag", function(done) {
      hashtagSeekerRepToken.changeController(hashtagContract.address).then(function() {
        hashtagSeekerRepToken.controller.call().then(function(controller){
          assert.equal(controller,hashtagContract.address, "controller should be PioneerTest");
          done();
        });
      });
    });

    it("should set payout address to address[4]", function(done) {
      hashtagContract.setPayoutAddress(payoutaddress, {
        gas: 4700000,
        from: accounts[0]
      }).then(function(res) {
        gasStats.push({
          name: 'setPayoutAddress',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should verify the payout address of the  'BoardWalkV2Test' Hashtag", function(done) {
      hashtagContract.payoutaddress.call().then(function(result) {
        assert.equal(result, payoutaddress, "payout not set...");
        done();
      });
    });

    it("should verify the commission of the  'BoardWalkV2Test' Hashtag", function(done) {
      hashtagContract.commission.call().then(function(result) {
        assert.equal(result.toNumber(), hashtagcommission, "commission not set...");
        done();
      });
    });

    it("should see no REP on Seeker", function(done) {
      hashtagProviderRepToken.balanceOf(seeker).then(function(balance) {
        assert.equal(balance, 0, "seeker provider REP balance not correct");
        done();
      });
    });

    it("should see no REP on Provider", function(done) {
      hashtagSeekerRepToken.balanceOf(provider).then(function(balance) {
        assert.equal(balance, 0, "seeker seeker REP balance not correct");
        done();
      });
    });



    it("should create a new deal", function(done) {

      var events = hashtagContract.ReceivedApproval({
				fromBlock: "latest"
			});
			var listener = events.watch(function(error, result) {
				console.log('/////// EVENT ApproveCall received:', result.args);
				//listener.stopWatching();
				//done();
			});

      var events2 = hashtagContract.NewDealForTwo({
				fromBlock: "latest"
			});
			var listener2 = events2.watch(function(error, result) {
				console.log('/////// EVENT NewDealForTwo received:', result.args);
				//listener2.stopWatching();
				//done();
			});

      var events4 = swtToken.Transfer({
        fromBlock: "latest"
      });
      var listener4 = events4.watch(function(error, result) {
        console.log('/////// EVENT Transfer received:', result.args);
        //listener4.stopWatching();
        //done();
      });

      var events3 = swtToken.Approval({
				fromBlock: "latest"
			});
			var listener3 = events3.watch(function(error, result) {
				console.log('/////// EVENT SWT Approval received:', result.args);
				//listener3.stopWatching();
				//done();
			});

      var events5 = hashtagContract.DealStatusChange({
        fromBlock: "latest"
      });
      var listener5 = events5.watch(function(error, result) {
        console.log('/////// EVENT DealStatusChange  received:', result.args);
        //done();
      });

      //Approval(msg.sender, _spender, _amount);
      // Create the dealhash
      var dealhash = web3.sha3(cleardealid);
      //console.log('dealhash sha3: ', dealhash);
      var privkey1 = "b6f33660ea3ce39ffc2817c271d4e02562173f5406a5afb4aa0d0ab2ac91a4ce";
      var sig = ethUtil.ecsign(new Buffer(dealhash.slice(2),'hex'), new Buffer(privkey1, 'hex'));
      //console.log(sig);
      const v = sig.v;
      const r = `0x${sig.r.toString('hex')}`;
      const s = `0x${sig.s.toString('hex')}`;

      var c = web3.eth.contract(hashtagContract.abi);
			var hashtagContractInstance = c.at(hashtagContract.address);

      // prepare the extraData
      var requestValue = hashtagcommission / 2 + dealvalue;
      var txdata = hashtagContractInstance.makeDealForTwo.getData(dealhash, dealvalue, "ipfs", v, r, s, {
				from: seeker
			});


      let extraData = txdata; //"0x55667788";

      const condensed = utility.pack(
        [
          128,
          (extraData.length - 2) / 2,
          extraData,
        ], [256, 256, 4]);


      var jordiproofData = condensed;

      swtToken.approveAndCall(hashtagContract.address, requestValue, '0x'+jordiproofData, {
        from: seeker,
        gas: 4700000
      }).then(function(res) {
        //console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'approveAndCall',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });

    });

    it("should check if the deal exists [Open]", function(done) {
      var dealhash = web3.sha3(cleardealid);

      hashtagContract.readDeal.call(dealhash).then(function(res) {
        //console.log(res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3]);

        assert.equal(res[2].toNumber(), dealvalue, "deal balance not correct after funding");

        done();
      });
    });

    it("should see token balance decreased on seeker's account", function(done) {
      swtToken.balanceOf(seeker).then(function(balance) {
        assert.equal(balance.toNumber(), 98500000000000000000, "deal balance not correct after funding");
        done();
      });
    });

    it("should see token balance on HashtagSimpleDeal", function(done) {
      swtToken.balanceOf(hashtagContract.address).then(function(balance) {
        assert.equal(balance.toNumber(), 1500000000000000000, "deal balance not correct after funding");
        done();
      });
    });

    it("should execute fundDeal", function(done) {

            var events2 = hashtagContract.FundDeal({
      				fromBlock: "latest"
      			});
      			var listener2 = events2.watch(function(error, result) {
      				console.log('Provider FundDeal received:', result.args);
      				listener2.stopWatching();
      				//done();
      			});

            var c2 = web3.eth.contract(hashtagContract.abi);
        	  var hashtagContractInstance2 = c2.at(hashtagContract.address);

            var requestValue2 = hashtagcommission / 2 + dealvalue;
            //console.log('requestvalue', requestValue2);
            var txdata2 = hashtagContractInstance2.fundDeal.getData(cleardealid, seeker, "ipfs", provider, {
      				from: provider
      			});

            let extraData2 = txdata2; //"0x55667788";

            const condensed2 = utility.pack(
              [
                128,
                (extraData2.length - 2) / 2,
                extraData2,
              ], [256, 256, 4]);

            var jordiproofData2 = condensed2;

            swtToken.approveAndCall(hashtagContract.address, requestValue2, '0x'+jordiproofData2, {
              from: provider,
              gas: 4700000
            }).then(function(res) {
              //console.log('gas used:', res.receipt.gasUsed);
              gasStats.push({
                name: 'approveAndCallFund',
                gasUsed: res.receipt.gasUsed
              });
              done();
            });
    });

    it("should check if the deal exists with provider in it [Funded]", function(done) {
      var dealhash = web3.sha3(cleardealid);

      hashtagContract.readDeal.call(dealhash).then(function(res) {
        //console.log(res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3]);
        assert.equal(res[3], provider, "deal provider not correct after funding");
        done();
      });
    });

    it("should see token balance decreased on providers's account", function(done) {
      swtToken.balanceOf(provider).then(function(balance) {
        //console.log('Provider account: ', balance.toNumber());
        assert.equal(balance.toNumber(), 98500000000000000000, "deal balance not correct after funding");
        //console.log('Balance of seeker =', balance.toNumber());
        done();
      });
    });

    it("should see token balance on HashtagSimpleDeal", function(done) {
      swtToken.balanceOf(hashtagContract.address).then(function(balance) {
        assert.equal(balance.toNumber(), 3000000000000000000, "deal balance not correct after funding");
        //console.log('Hashtag account: ', balance.toNumber());        //console.log('Balance of dealForTwoFactory =', balance.toNumber());
        done();
      });
    });
  });

  //  And now we can go to payout, cancel, dispute, resolve.
  describe('Dispute by provider', function() {
    it("provider should dispute the deal", function(done) {
      var dealhash = web3.sha3(cleardealid);

      hashtagContract.dispute(dealhash, "ipfs", {
        from: provider,
        gas: 4700000
      }).then(function(res) {
        //console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'Dispute by provider',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });

    });

    it("should check if the deal is in status 2 [Conflicted]", function(done) {
      var dealhash = web3.sha3(cleardealid);

      hashtagContract.readDeal.call(dealhash).then(function(res) {
        console.log(res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3]);
        assert.equal(res[0].toNumber(), 2, "deal status not correct after dispute");
        done();
      });
    });

    it("payoutaddress should resolve the deal", function(done) {
      var dealhash = web3.sha3(cleardealid);

      hashtagContract.resolve(dealhash, dealvalue / 3, "ipfs", {
        from: payoutaddress,
        gas: 4700000
      }).then(function(res) {
        //console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'Resolve by payoutaddress',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });

      it("should check if the deal is in status 3 [resolved]", function(done) {
        var dealhash = web3.sha3(cleardealid);

        hashtagContract.readDeal.call(dealhash).then(function(res) {
          //console.log(res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3]);
          assert.equal(res[0].toNumber(), 3, "deal status not correct after resolve");
          done();
        });
      });

    });

    it("should see 0 token balance on HashtagSimpleDeal", function(done) {
      swtToken.balanceOf(hashtagContract.address).then(function(balance) {
        assert.equal(balance.toNumber(), 0, "hashtag balance not correct after funding");
        //console.log('Hashtag account: ', balance.toNumber());        //console.log('Balance of dealForTwoFactory =', balance.toNumber());
        done();
      });
    });

    it("should see commission balance increased on Payout address", function(done) {
      swtToken.balanceOf(payoutaddress).then(function(balance) {
        assert.equal(balance.toNumber(), 600000000000000000, "payoutaddress balance not correct after funding");
        //console.log('Payout account: ', balance.toNumber());        //console.log('Balance of dealForTwoFactory =', balance.toNumber());
        done();
      });
    });

    it("should see token balance increased on providers's account", function(done) {
      swtToken.balanceOf(provider).then(function(balance) {
        //console.log('Provider account: ', balance.toNumber());
        assert.equal(balance.toNumber(), 100500000000000000000, "deal balance not correct after funding");
        //console.log('Balance of provider =', balance.toNumber());
        done();
      });
    });

    it("should see token balance decreased on seeker's account", function(done) {
      swtToken.balanceOf(seeker).then(function(balance) {
        //console.log('Provider account: ', balance.toNumber());
        assert.equal(balance.toNumber(), 98900000000000000000, "deal balance not correct after funding");
        //console.log('Balance of seeker =', balance.toNumber());
        done();
      });
    });

    it("should see 0 reptoken balance on ProviderRepToken", function(done) {
      hashtagProviderRepToken.balanceOf(provider).then(function(balance) {
        //console.log('Proverderrep balance: ', balance.toNumber())
        assert.equal(balance.toNumber(), 0, "deal balance not correct after funding");
        done();
      });
    });

    it("should see 0 reptoken balance on SeekerRepToken", function(done) {
      hashtagSeekerRepToken.balanceOf(seeker).then(function(balance) {
        //console.log('Seekerrep balance: ', balance.toNumber())
        assert.equal(balance.toNumber(), 0, "deal balance not correct after funding");
        done();
      });
    });

  });

  describe('Stats', function() {
    it("should show stats of Happy Flow", function(done) {
      var cumulatedGas = 0;
      for (var i = 0; i < gasStats.length; i++) {
        console.log(gasStats[i]);
        cumulatedGas += gasStats[i].gasUsed;
      }
      console.log('Total gas used', cumulatedGas);
      done();
    });
  });

});
