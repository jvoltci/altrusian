/** @type {import('next').NextConfig} */
const isGH = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  basePath: isGH ? '/altrusian' : '',
  assetPrefix: isGH ? '/altrusian/' : '',
};

module.exports = nextConfig;
