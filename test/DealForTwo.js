var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var Hashtag = artifacts.require("./Hashtag.sol");
var DealForTwo = artifacts.require("./DealForTwo.sol");
var DealForTwoFactory = artifacts.require("./DealForTwoFactory.sol");

contract('DealForTwo', function(accounts) {

  var swtToken;
  var hashtagRepToken;
  var miniMeTokenFactory;
  var hashtagContract;
  var dealContract;
  var hashtagcommission = 2;
  var gasStats = [];

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

    it("should mint tokens for accounts[2] ( provider ) ", function(done) {
      swtToken.generateTokens(accounts[2], 300).then(function() {
        done();
      });
    });

  });

  describe('Hashtag and DealFactory creation flow', function() {

    it("should deploy 'pioneer' Hashtag", function(done) {
      // commission for this hastag is hashtagcommission SWT
      Hashtag.new(swtToken.address, miniMeTokenFactory.address, "pioneer", hashtagcommission, "QmNogiets", {
        gas: 4700000,
        from: accounts[3]
      }).then(function(instance) {
        hashtagContract = instance;
        assert.isNotNull(hashtagContract);

        hashtagContract.getRepTokenAddress.call().then(function(reptokenaddress) {
          console.log('hashtag REP token created at address', reptokenaddress);
          hashtagRepToken = MiniMeToken.at(reptokenaddress);
          done();
        });
      });
    });

    it("should verify the commission of the  'pioneer' Hashtag", function(done) {
      hashtagContract.commission().then(function(value) {
        assert.equal(value.toNumber(), hashtagcommission, "commission not set...");
        done();
      });
    });

    it("should see no REP on accounts[1]", function(done) {
      hashtagRepToken.balanceOf(accounts[1]).then(function(balance) {
        assert.equal(balance, 0, "accounts[1] REP balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see no REP on accounts[2]", function(done) {
      hashtagRepToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance, 0, "accounts[1] REP balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should deploy a dealForTwoFactory", function(done) {
      DealForTwoFactory.new(hashtagContract.address, {
        gas: 4700000
      }).then(function(instance) {
        //         console.log('makeDealForTwo -> gas used:', res.receipt.gasUsed);
        dealForTwoFactory = instance;
        assert.isNotNull(dealForTwoFactory);
        done();
      });
    });

    it("should add the dealForTwoFactory to the whitelisted factories for this hashtag", function(done) {
      hashtagContract.addFactory(dealForTwoFactory.address, {
        gas: 4700000,
        from: accounts[3]
      }).then(function(instance) {
        done();
      });
    });

    it("should see that our dealForTwoFactory is whitelisted for this hashtag", function(done) {
      hashtagContract.validFactories.call(dealForTwoFactory.address).then(function(result) {
        console.log(result);
        assert.equal(result, true, "dealForTwoFactory not whitelisted...");
        done();
      });
    });


  });

  describe('SimpleDeal happy flow', function() {

    it("should give seeker allowance to dealfortwo", function(done) {
      swtToken.approve(dealForTwoFactory.address, 10, {
        from: accounts[1]
      }).then(function(res) {
        console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'approve (seeker)',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should create a new deal", function(done) {
      dealForTwoFactory.makeDealForTwo("TheDeal", 10,"", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'makeDealForTwo',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should see token balance decreased on seeker's account", function(done) {
      swtToken.balanceOf(accounts[1]).then(function(balance) {
        assert.equal(balance.toNumber(), 90, "deal balance not correct after funding");
        console.log('Balance of accounts[1] =', balance.toNumber());
        done();
      });
    });

    it("should see token balance on dealfortwofactory", function(done) {
      swtToken.balanceOf(dealForTwoFactory.address).then(function(balance) {
        assert.equal(balance.toNumber(), 10, "deal balance not correct after funding");
        console.log('Balance of dealForTwoFactory =', balance.toNumber());
        done();
      });
    });


    it("should give provider allowance to dealfortwo", function(done) {
      swtToken.approve(dealForTwoFactory.address, 10, {
        from: accounts[2]
      }).then(function(res) {
        console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'approve (provider)',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });


    it("should execute fundDeal", function(done) {
      dealForTwoFactory.fundDeal("TheDeal", accounts[1], 10,"", {
        from: accounts[2],
        gas: 4700000
      }).then(function(res) {
        console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'fundDeal',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });


    it("should see token balance decreased on provider's account", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance.toNumber(), 290, "deal balance not correct after funding");
        console.log('Balance of accounts[2] =', balance.toNumber());
        done();
      });
    });

    it("should see token balance on dealfortwofactory", function(done) {
      swtToken.balanceOf(dealForTwoFactory.address).then(function(balance) {
        assert.equal(balance.toNumber(), 20, "deal balance not correct after funding");
        console.log('Balance of dealForTwoFactory =', balance.toNumber());
        done();
      });
    });


    it("should approve the deal", function(done) {
      dealForTwoFactory.payout("TheDeal","", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'payout',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });


    it("should see the balance of the DealForTwoFactory is correct", function(done) {
      swtToken.balanceOf(dealForTwoFactory.address).then(function(balance) {
        assert.equal(balance.toNumber(), 0, " balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see the payout on the provider's account", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance.toNumber(), 300 + 10 - 2, " balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see the payout of the commision on the hashtag owner's account", function(done) {
      swtToken.balanceOf(accounts[3]).then(function(balance) {
        assert.equal(balance.toNumber(), 2, " balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see REP on accounts[1]", function(done) {
      hashtagRepToken.balanceOf(accounts[1]).then(function(balance) {
        assert.equal(balance, 5, "accounts[1] REP balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see REP on accounts[2]", function(done) {
      hashtagRepToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance, 5, "accounts[2] REP balance not correct");
        console.log('Balance of account=', balance.toNumber());
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


  describe('DealForTwo that doesn\'t exist error-logic', function() {

    it("create a new deal without an allowance should throw", function(done) {
      dealForTwoFactory.makeDealForTwo("TheDeal2", 10, {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });

    it("approve a non-existing deal should throw", function(done) {
      dealForTwoFactory.fundDeal("TheDeal3", accounts[1], 10, {
        from: accounts[2],
        gas: 4700000
      }).then(function(res) {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });

    it("payout a non-existing deal should throw", function(done) {
      dealForTwoFactory.payout("TheDeal3", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });
  });


  describe('DealForTwo in wrong order', function() {

    it("should give seeker allowance to dealfortwo", function(done) {
      swtToken.approve(dealForTwoFactory.address, 10, {
        from: accounts[1]
      }).then(function(res) {
        console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'approve (seeker)',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("create a new deal should work", function(done) {
      dealForTwoFactory.makeDealForTwo("TheDeal4", 10,"", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        done();
      }).catch(function(e) {
        assert.fail(null, null, 'this function should not throw', e);
        done();
      });
    });

    it("fund an existing deal but wit no allowance should throw", function(done) {
      dealForTwoFactory.fundDeal("TheDeal4", accounts[1], 10, "",{
        from: accounts[2],
        gas: 4700000
      }).then(function(res) {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });

    it("payout a non-funded deal should throw", function(done) {
      dealForTwoFactory.payout("TheDeal4","", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });
  });


  describe('DealForTwo in wrong order', function() {

    it("should give seeker allowance to dealfortwo", function(done) {
      swtToken.approve(dealForTwoFactory.address, 10, {
        from: accounts[1]
      }).then(function(res) {
        console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'approve (seeker)',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("create a new deal that could never cover the commission should throw", function(done) {
      dealForTwoFactory.makeDealForTwo("TheDeal5", 10, "",{
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        done();
      }).catch(function(e) {
        assert.fail(null, null, 'this function should not throw', e);
        done();
      });
    });

    it("fund an existing deal but with no allowance should throw", function(done) {
      dealForTwoFactory.fundDeal("TheDeal4", accounts[1], 10, "",{
        from: accounts[2],
        gas: 4700000
      }).then(function(res) {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });

    it("payout a non-funded deal should throw", function(done) {
      dealForTwoFactory.payout("TheDeal4","", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });
  });


});