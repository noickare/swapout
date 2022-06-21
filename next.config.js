/** @type {import('next').NextConfig} */

const withAntdLess = require("next-plugin-antd-less");
const darkTheme = require("@ant-design/dark-theme");

const moduleExports = withAntdLess({
  images: {
    domains: ["dev-ipfs.clueconn.com", "ipfs.clueconn.com", "loremflickr.com", "apoqrsgtqq.cloudimg.io"],
  },
  reactStrictMode: true,
  // optional: you can modify antd less variables directly here
  modifyVars: {
    // ...darkTheme.default,
    "@primary-color": "#d818ff",
    "@link-color": "#d818ff", // link color
    "@success-color": "#52c41a", // success state color
    "@warning-color": "#faad14", // warning state color
    "@error-color": "#f5222d", // error state color
  },
  // Or better still you can specify a path to a file
  lessVarsFilePath: "./styles/variables.less",
  // optional
  lessVarsFilePathAppendToEndOfContent: false,
  // optional https://github.com/webpack-contrib/css-loader#object
  cssLoaderOptions: {},

  // Other Config Here...

  webpack(config) {
    return config;
  },

  // ONLY for Next.js 10, if you use Next.js 11, delete this block
  future: {
    webpack5: true,
  },
});

module.exports = moduleExports;
