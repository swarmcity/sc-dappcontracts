var Parameters = artifacts.require("./Parameters.sol");

contract('Parameters', function(accounts) {

  var ParametersInstance;
  var self = this;

  describe('Deploy Parameters', function() {
    it("should deploy Parameters contract", function(done) {
      Parameters.new({
        from: accounts[0]
      }).then(function(_contract) {
        assert.ok(_contract.address);
        ParametersInstance = _contract;
        console.log('Parameters created at address', _contract.address);
        done();
      });
    });
  });

  describe('Parameters access rights', function() {
    it("should be able to set a parameter", function(done) {
      ParametersInstance.setParameter('a', 'b', {
        from: accounts[0]
      }).then(function() {
        done();
      }).catch(function(e) {
        assert.fail(null, null, 'this function should not throw', e);
        done();
      });
    });

    it("should be able to get a parameter", function(done) {
      ParametersInstance.getParameter.call('a', {
        from: accounts[0]
      }).then(function(result) {
        assert.equal(result, 'b', 'I expected to receive \'b\' as a result');
        done();
      }).catch(function(e) {
        assert.fail(null, null, 'this function should not throw', e);
        done();
      });
    });

    it("someone else than the owner should not be able to set a parameter", function(done) {
      ParametersInstance.setParameter('a', 'b', {
        from: accounts[1]
      }).then(function() {
        assert.fail(null, null, 'this function should throw', e);
        done();
      }).catch(function(e) {
        done();
      });
    });
  });
});