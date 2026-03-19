/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/*': [
      './prisma/**/*',
      './node_modules/.prisma/client/**/*',
    ],
  },
};

export default nextConfig;