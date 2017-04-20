var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var Hashtag = artifacts.require("./Hashtag.sol");
var SimpleDeal = artifacts.require("./SimpleDeal.sol");

contract('Hashtag', function(accounts) {

  var swtToken; // this is the MiniMeToken version
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
        console.log('Hashtag token created at address', _miniMeToken.address);
        swtToken = _miniMeToken;
        done();
      });
    });

    it("should mint tokens for accounts[1] ( owner ) ", function(done) {
      swtToken.generateTokens(accounts[1], 100).then(function() {
        done();
      });
    });

    it("should mint tokens for accounts[2] ( counterparty ) ", function(done) {
      swtToken.generateTokens(accounts[2], 500).then(function() {
        done();
      });
    });

    it("should deploy Hashtag", function(done) {
      // commission for this hastag is 10 SWT
      Hashtag.new(swtToken.address, "pioneer", 10, {
        gas: 4700000
      }).then(function(instance) {
        hashtagContract = instance;
        assert.isNotNull(hashtagContract);
        done();
      });
    });

  });

  describe('Deal happy flow', function() {
    it("should create new SimpleDeal", function(done) {
      SimpleDeal.new(hashtagContract.address, accounts[2], 10, 0x123, {
        from: accounts[1]
      }).then(function(instance) {
        dealContract = instance;
        assert.isNotNull(dealContract);
        done();
      });
    });
    it("should allow the Deal to get tokens from accounts[1]", function(done) {
      swtToken.approve(dealContract.address, 100, {
        from: accounts[1]
      }).then(function(instance) {
        done();
      });
    });

    it("should fund the Deal", function(done) {
      dealContract.fund(100, {
        from: accounts[1]
      }).then(function(instance) {
        done();
      });
    });

    it("should allow the Deal to get tokens from accounts[2]", function(done) {
      swtToken.approve(dealContract.address, 10, {
        from: accounts[2]
      }).then(function(instance) {
        done();
      });
    });

   it("should claim the Deal by accounts[2]", function(done) {
      dealContract.claim(10, {
        from: accounts[2]
      }).then(function(instance) {
        done();
      });
    });


   it("should approve the Deal by accounts[1]", function(done) {
      dealContract.approve( {
        from: accounts[1]
      }).then(function(instance) {
        done();
      });
    });

  });

  // describe('Convert ARC to SWT fails without having an allowance', function() {

  //   it("should not be able to convert without allowance", function(done) {
  //     hashtagContract.convert(1).then(function() {
  //       assert.fail(null, null, 'This function should throw');
  //       done();
  //     }).catch(function() {
  //       done();
  //     });
  //   });
  // });

  // describe('Convert ARC to SWT with allowance', function() {

  //   it("should have correct balance on random token contract", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should have zero balance on SWT token contract", function(done) {
  //     var balance = swtToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 0, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should give allowance to convert", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       arcToken.approve(hashtagContract.address, balance).then(function() {
  //         done();
  //       });
  //     });
  //   });

  //   it("allowance should be visible in ARC token contract", function(done) {
  //     var balance = arcToken.allowance.call(accounts[0], hashtagContract.address).then(function(allowanceamount) {
  //       assert.equal(allowanceamount.valueOf(), 1000 * 1e18, "allowanceamount not correct");
  //       done();
  //     });
  //   });

  //   it("should convert half of the ARC of this owner", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       hashtagContract.convert(balance.valueOf() / 2, {
  //         gas: 400000
  //       }).then(function() {
  //         done();
  //       }).catch(function(e) {
  //         assert.fail(null, null, 'This function should not throw', e);
  //         done();
  //       });
  //     });
  //   });

  //   it("should have the correct balance on SWT token contract", function(done) {
  //     var balance = swtToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 / 2 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("there should be an ARC balance on the deposit wallet", function(done) {
  //     var balance = arcToken.balanceOf.call(deposit_address).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 / 2 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should convert remaining balance of this owner", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       hashtagContract.convert(balance.valueOf(), {
  //         gas: 400000
  //       }).then(function() {
  //         done();
  //       }).catch(function(e) {
  //         assert.fail(null, null, 'This function should not throw', e);
  //         done();
  //       });
  //     });
  //   });

  //   it("should not be able to convert more tokens", function(done) {
  //     hashtagContract.convert(1, {
  //       gas: 400000
  //     }).then(function() {
  //       assert.fail(null, null, 'This function should throw', e);
  //       done();
  //     }).catch(function(e) {
  //       done();
  //     });
  //   });

  //   it("should have new balance on SWT token contract", function(done) {
  //     var balance = swtToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should have zero balance on ARC token contract", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 0, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("there should be an ARC balance on the deposit wallet", function(done) {
  //     var balance = arcToken.balanceOf.call(deposit_address).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });
  // });

  // describe('Cloning of contract at current block', function() {

  //   it("should be able to clone this contract at block " + self.web3.eth.blockNumber, function(done) {

  //     var watcher = swtToken.NewCloneToken();
  //     watcher.watch(function(error, result) {
  //       console.log('new clone contract at ', result.args._cloneToken);
  //       clone0 = MiniMeToken.at(self.web3.toHex(result.args._cloneToken));
  //       watcher.stopWatching();
  //       done();
  //     });

  //     swtToken.createCloneToken(
  //       "Swarm Voting Token",
  //       18,
  //       "SVT",
  //       Number.MAX_SAFE_INTEGER, // if the blocknumber > current block, minime defaults to the current block.
  //       true, {
  //         gas: 2000000
  //       }).then(function(txhash) {
  //       // the event watcher will call done()
  //     }).catch(function(e) {
  //       console.log('Error', e);
  //       assert.fail(null, null, 'This function should not throw', e);
  //       done();
  //     });
  //   });

  //   it("should be have the same balance as the original ", function(done) {
  //     var balance = clone0.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });
  // });


  // describe('Cloning of contract at block 0', function() {

  //   it("should be able to clone this contract at block 0", function(done) {
  //     var watcher = swtToken.NewCloneToken();
  //     watcher.watch(function(error, result) {
  //       console.log('new clone contract at ', result.args._cloneToken);
  //       clone1 = MiniMeToken.at(self.web3.toHex(result.args._cloneToken));
  //       watcher.stopWatching();
  //       done();
  //     });

  //     swtToken.createCloneToken(
  //       "Swarm Voting Token",
  //       18,
  //       "SVT",
  //       0,
  //       true, {
  //         gas: 2000000
  //       }).then(function(txhash) {
  //       // the event watcher will call done()
  //     }).catch(function(e) {
  //       console.log('Error', e);
  //       assert.fail(null, null, 'This function should not throw', e);
  //       done();
  //     });
  //   });

  //   it("should be have a zero SWT balance ", function(done) {
  //     var balance = clone1.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 0, "account not correct amount");
  //       done();
  //     });
  //   });
  // });


});