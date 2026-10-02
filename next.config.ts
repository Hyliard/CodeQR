import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // GitHub Pages solo sirve archivos estáticos, bajo hyliard.github.io/CodeQR/
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/CodeQR' : '',
  agentRules: false
};

export default config;
