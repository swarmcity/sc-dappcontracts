var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var Hashtag = artifacts.require("./HashtagSimpleDeal.sol");

contract('HashtagSimpleDeal', function(accounts) {

  var swtToken;
  var hashtagProviderRepToken;
  var hashtagSeekerRepToken;
  var miniMeTokenFactory;
  var hashtagContract;
  var dealContract;
  var hashtagcommission = 2;
  var gasStats = [];
  var payoutaddress = accounts[4];

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
        done();
      });
    });

    it("should mint SWT tokens for Seeker", function(done) {
      swtToken.generateTokens(accounts[1], 100).then(function() {
        done();
      });
    });

    it("should see token balance Seeker account", function(done) {
      swtToken.balanceOf(accounts[1]).then(function(balance) {
        assert.equal(balance.toNumber(), 100, "seeker balance not correct after swt minting");
        done();
      });
    });

    it("should mint SWT tokens for Provider", function(done) {
      swtToken.generateTokens(accounts[2], 100).then(function() {
        done();
      });
    });

    it("should see token balance Provider account", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        assert.equal(balance.toNumber(), 100, "provider balance not correct after swt minting");
        done();
      });
    });
  });

  describe('SimpleDeal Cancel flow', function() {

    it("should give Seeker allowance to HashtagSimpleDeal", function(done) {
      swtToken.approve(hashtagContract.address, 11, {
        from: accounts[1]
      }).then(function(res) {
        //console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'approve (seeker)',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should create a new deal", function(done) {
      hashtagContract.makeDealForTwo("TheCancelDeal", 10, "", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        //console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'makeDealForTwo',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should check if the deal exists", function(done) {
      hashtagContract.readDeal.call("TheCancelDeal", accounts[1]).then(function(res) {
        console.log(res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3]);
        done();
      });
    });

    it("should see token balance decreased on seeker's account", function(done) {
      swtToken.balanceOf(accounts[1]).then(function(balance) {
        //assert.equal(balance.toNumber(), 89, "deal balance not correct after funding");
        console.log('Balance of accounts[1] =', balance.toNumber());
        done();
      });
    });

    it("should see token balance on HashtagSimpleDeal", function(done) {
      swtToken.balanceOf(hashtagContract.address).then(function(balance) {
        //assert.equal(balance.toNumber(), 11, "deal balance not correct after funding");
        console.log('Balance of hashtag =', balance.toNumber());
        done();
      });
    });

    it("should execute cancelDeal", function(done) {
      hashtagContract.cancelDeal("TheCancelDeal", "", {
        from: accounts[1],
        gas: 4700000
      }).then(function(res) {
        //console.log('gas used:', res.receipt.gasUsed);
        gasStats.push({
          name: 'cancelDeal',
          gasUsed: res.receipt.gasUsed
        });
        done();
      });
    });

    it("should check if the deal exists", function(done) {
      hashtagContract.readDeal.call("TheCancelDeal", accounts[1]).then(function(res) {
        console.log(res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3]);
        done();
      });
    });
    it("should see token balance on HashtagSimpleDeal", function(done) {
      swtToken.balanceOf(accounts[0]).then(function(balance) {
        console.log('Balance of HashtagSimpleDeal =', balance.toNumber());
        done();
      });
    });

    it("should see token balance on Seeker", function(done) {
      swtToken.balanceOf(accounts[1]).then(function(balance) {
        console.log('Balance of Seeker =', balance.toNumber());
        done();
      });
    });

    it("should see token balance on Provider", function(done) {
      swtToken.balanceOf(accounts[2]).then(function(balance) {
        console.log('Balance of Provider =', balance.toNumber());
        done();
      });
    });

    it("should see token balance on payoutaddress", function(done) {
      swtToken.balanceOf(accounts[4]).then(function(balance) {
        console.log('Balance of Payout =', balance.toNumber());
        done();
      });
    });

    it("should check if the deal is cancelled", function(done) {
      hashtagContract.readDeal.call("TheCancelDeal", accounts[1]).then(function(res) {
        console.log(res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3]);
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
