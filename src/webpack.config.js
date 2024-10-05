const path = require('path');

module.exports = {
  // other configurations...
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      // add other fallbacks if necessary
    },
  },
};
