import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'mandebem.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                async_hooks: false,
                fs: false,
                path: false,
                crypto: false,
                stream: false,
                util: false,
                buffer: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
    turbopack: {},
};

export default withPWA(nextConfig);
