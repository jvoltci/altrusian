/** @type {import('next').NextConfig} */

const isGH = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
     trailingSlash: true,
     basePath: isGH ? '/altrusian' : '',
     output: 'export',
     images: { unoptimized: true }
};

export default nextConfig;
