/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // Exclude pdf.worker from being processed by webpack
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?mjs$/,
      type: "asset/resource",
    });

    return config;
  },
  // Ensure static files in public are served as-is
  async headers() {
    return [
      {
        source: "/pdf.worker.min.mjs",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
