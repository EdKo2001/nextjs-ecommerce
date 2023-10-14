/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { hostname: 'hips.hearstapps.com' }, { hostname: 'static.pcbuilder.net' }, { hostname: 'lh3.googleusercontent.com' }
        ]
    },
    experimental: {
        serverActions: true,
    },
}

module.exports = nextConfig
