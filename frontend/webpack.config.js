const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../app/static/frontend"),
    filename: "[name].js",
  },
  resolve: { 
	extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] 
  },
  module: {
    rules: [
      {
        test: /\.(js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
	   {
			test: /\.(ts|tsx)$/,
			exclude: /node_modules/,
			use: ["ts-loader"],
		},
	  {
        test: /\.css$/i,
		exclude: /node_modules/,		
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};