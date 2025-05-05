


module.exports = {
    formatError: (message) => ({
      message,
      timestamp: new Date().toISOString(),
    }),
  };