/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { hostname: 'hips.hearstapps.com' }, { hostname: 'static.pcbuilder.net' }
        ]
    },
    experimental: {
        serverActions: true,
    },
}

module.exports = nextConfig
