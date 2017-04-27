module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8546,
      network_id: "*"		// Match any network id
    },
 	live: {
    	host: "localhost",
	    port: 8545,
	    network_id: 1,		// Ethereum public network
	}    
  }
};
