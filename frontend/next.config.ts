import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";
const repoName = "AI-Startup-Roadmap-Coach";

const nextConfig: NextConfig = {
  ...(isGithubPages && {
    output: "export",
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
  }),
  images: { unoptimized: true },
};

export default nextConfig;
