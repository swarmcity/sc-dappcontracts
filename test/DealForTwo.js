var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var Hashtag = artifacts.require("./Hashtag.sol");
var DealForTwo = artifacts.require("./DealForTwo.sol");
var DealForTwoFactory = artifacts.require("./DealForTwoFactory.sol");
//var DealForTwoFactory = artifacts.require("./DealForTwoFactory.sol");

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

    it("should mint tokens for accounts[1] ( owner ) ", function(done) {
      swtToken.generateTokens(accounts[1], 101).then(function() {
        done();
      });
    });

    it("should mint tokens for accounts[2] ( counterparty ) ", function(done) {
      swtToken.generateTokens(accounts[2], 102).then(function() {
        done();
      });
    });

  });

  describe('Hashtag and DealFactory creation flow', function() {

    it("should deploy 'pioneer' Hashtag", function(done) {
      // commission for this hastag is hashtagcommission SWT
      Hashtag.new(swtToken.address, miniMeTokenFactory.address, "pioneer", hashtagcommission, "QmNogiets", {
        gas: 4700000
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
      DealForTwoFactory.new({
        gas: 4700000
      }).then(function(instance) {
        dealForTwoFactory = instance;
        assert.isNotNull(dealForTwoFactory);
        done();
      });
    });

    it("should add the dealForTwoFactory to the whitelisted factories for this hashtag", function(done) {
      hashtagContract.addFactory(dealForTwoFactory.address, {
        gas: 4700000
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

  describe('SimpleDeal flow', function() {
    it("should be created", function(done) {

      var events = dealForTwoFactory.NewDealForTwo({
        fromBlock: "latest"
      });
      var listener = events.watch(function(error, result) {
        // This will catch all events, regardless of how they originated.
        if (error == null && result.args && result.args.dealForTwoAddress) {
          dealContract = DealForTwo.at(result.args.dealForTwoAddress);
          listener.stopWatching();
          done();
        }
      });

      // dealForTwoFactory.makeSimpleDeal.estimateGas(hashtagContract.address, accounts[2], 10, 0x123, {
      //   from: accounts[1],
      //   gas: 4700000
      // }).then(function(rez){
      //   console.log('GAS EST=',rez);
      //   done();
      // });

      dealForTwoFactory.makeDealForTwo(hashtagContract.address, 10, {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        console.log('makeDealForTwo -> gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'makeDealForTwo',
          gasUsed: res.receipt.gasUsed
        });
      });;

    });


    it("should send seeker's funds to the deal", function(done) {
      swtToken.transfer(dealContract.address, 10, {
        from: accounts[1]
      }).then(function(res) {
        gasStats.push({
          name: 'send Seeker Funds',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should see the correct balance on the deal", function(done) {
      swtToken.balanceOf(dealContract.address).then(function(balance) {
        assert.equal(balance.toNumber(), 10, "deal balance not correct after funding");
        console.log('Balance of deal =', balance.toNumber());
        done();
      });
    });


    it("should allocate the deal to provider accounts[2]", function(done) {
      dealForTwoFactory.assignProvider(dealContract.address, accounts[2], 10, 10, {
        from: accounts[1]
      }).then(function(res) {
        gasStats.push({
          name: 'assignProvider',
          gasUsed: res.receipt.gasUsed
        });
        //assert.equal(balance, 1, "accounts[1] balance not correct after funding");
        //console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should send provider's funds to the deal", function(done) {
      swtToken.transfer(dealContract.address, 10, {
        from: accounts[2]
      }).then(function(res) {
        gasStats.push({
          name: 'send provider funds',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should see the total funded balance on the deal", function(done) {
      swtToken.balanceOf(dealContract.address).then(function(balance) {
        assert.equal(balance.toNumber(), 20, "deal balance not correct after funding");
        console.log('Balance of deal=', balance.toNumber());
        done();
      });
    });

    it("should payout the deal by seeker", function(done) {
      dealForTwoFactory.payout(dealContract.address, {
        from: accounts[1]
      }).then(function(res) {
        gasStats.push({
          name: 'payout',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });


    it("should see that balance on the deal is 0", function(done) {
      swtToken.balanceOf(dealContract.address).then(function(balance) {
        assert.equal(balance.toNumber(), 0, "deal balance not correct after funding");
        console.log('Balance of deal=', balance.toNumber());
        done();
      });
    });

    it("should see the payout on the provider's account", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance.toNumber(), 102 + 10, "deal balance not correct after funding");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see REP on accounts[1]", function(done) {
      hashtagRepToken.balanceOf(accounts[1]).then(function(balance) {
        assert.equal(balance, 1, "accounts[1] REP balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see REP on accounts[2]", function(done) {
      hashtagRepToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance, 1, "accounts[2] REP balance not correct");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });
  });
  describe('Stats', function() {
    it("should show stats", function(done) {
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