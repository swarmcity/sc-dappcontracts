var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var Hashtag = artifacts.require("./Hashtag.sol");
var SimpleDeal = artifacts.require("./SimpleDeal.sol");
var SimpleDealFactory = artifacts.require("SimpleDealFactory");

contract('HashtagDeal', function(accounts) {

  var swtToken; // this is the MiniMeToken version
  var hashtagRepToken;
  var miniMeTokenFactory;
  var hashtagContract;
  var dealContract;

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
      // commission for this hastag is 33 SWT
      Hashtag.new(swtToken.address, miniMeTokenFactory.address, "pioneer", 33, "QmNogiets", {
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
        assert.equal(value.toNumber(), 33, "commission not set...");
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

    it("should deploy a SimpleDealFactory", function(done) {
      SimpleDealFactory.new({
        gas: 4700000
      }).then(function(instance) {
        simpleDealFactory = instance;
        assert.isNotNull(simpleDealFactory);
        done();
      });
    });

    it("should add the SimpleDealFactory to the whitelisted factories for this hashtag", function(done) {
      hashtagContract.addFactory(simpleDealFactory.address, {
        gas: 4700000
      }).then(function(instance) {
        done();
      });
    });

    it("should see that our SimpleDealFactory is whitelisted for this hashtag", function(done) {
      hashtagContract.validFactories.call(simpleDealFactory.address).then(function(result) {
        console.log(result);
        assert.equal(result, true, "SimpleDealFactory not whitelisted...");
        done();
      });
    });


  });

  describe('SimpleDeal flow', function() {
    it("should be created", function(done) {

      var events = simpleDealFactory.NewSimpleDeal({
        fromBlock: "latest"
      });
      var listener = events.watch(function(error, result) {
        // This will catch all events, regardless of how they originated.
        if (error == null && result.args && result.args.simpleDealAddress) {
          dealContract = SimpleDeal.at(result.args.simpleDealAddress);
          listener.stopWatching();
          done();
        }
      });

      // simpleDealFactory.makeSimpleDeal.estimateGas(hashtagContract.address, accounts[2], 10, 0x123, {
      //   from: accounts[1],
      //   gas: 4700000
      // }).then(function(rez){
      //   console.log('GAS EST=',rez);
      //   done();
      // });

      simpleDealFactory.makeSimpleDeal(hashtagContract.address, accounts[2], 10, 0x123, {
        from: accounts[1],
        gas: 4700000
      });

    });


    it("should allow the SimpleDeal to get tokens from accounts[1]", function(done) {
      swtToken.approve(dealContract.address, 100, {
        from: accounts[1]
      }).then(function(instance) {
        done();
      });
    });

    it("should see the correct balance on the accounts[1]", function(done) {
      swtToken.balanceOf(accounts[1]).then(function(balance) {
        assert.equal(balance, 101, "accounts[1] balance not correct after funding");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should fund the SimpleDeal", function(done) {
      dealContract.fund(100, {
        from: accounts[1]
      }).then(function(instance) {
        done();
      });
    });

    it("should see a decreased balance on the accounts[1]", function(done) {
      swtToken.balanceOf(accounts[1]).then(function(balance) {
        assert.equal(balance, 1, "accounts[1] balance not correct after funding");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should allow the SimpleDeal to get tokens from accounts[2]", function(done) {
      swtToken.approve(dealContract.address, 10, {
        from: accounts[2]
      }).then(function(instance) {
        done();
      });
    });

    it("should see the correct balance on the accounts[2]", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance.toNumber(), 102, "accounts[2] balance not correct after funding");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should have the SimpleDeal claimed by accounts[2]", function(done) {
      dealContract.claim(10, {
        from: accounts[2]
      }).then(function(instance) {
        done();
      });
    });

    it("should see a decreased balance on the accounts[2]", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance.toNumber(), 102 - 10, "accounts[2] balance not correct after funding");
        done();
      });
    });

    it("should have the SimpleDeal approved by accounts[1]", function(done) {
      dealContract.approve({
        from: accounts[1]
      }).then(function(instance) {
        done();
      });
    });

    it("should see a payout balance on accounts[2]", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance.toNumber(), 102 + 100 - 33, "accounts[2] balance not correct after approve");
        console.log('Balance of account=', balance.toNumber());
        done();
      });
    });

    it("should see a payout of the commission on accounts[0] ( hastag owner ) ", function(done) {
      swtToken.balanceOf(accounts[0]).then(function(balance) {
        assert.equal(balance.toNumber(), 33, "accounts[0] balance not correct after approve");
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

});