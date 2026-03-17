module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Resolver problema de allowedHosts no Node.js 22.x
      if (webpackConfig.devServer) {
        webpackConfig.devServer.allowedHosts = 'all';
      }
      return webpackConfig;
    },
  },
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    port: 3000,
    hot: true,
    open: false,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
};
