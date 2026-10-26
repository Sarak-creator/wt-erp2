import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Fix Windows exFAT filesystem bug where readlink throws EISDIR instead of EINVAL on regular files
if (fs && fs.readlinkSync) {
  const origSync = fs.readlinkSync;
  fs.readlinkSync = function (p: any, o: any) {
    try {
      return origSync.call(fs, p, o);
    } catch (e: any) {
      if (e && e.code === "EISDIR") {
        e.code = "EINVAL";
      }
      throw e;
    }
  };
}

if (fs && fs.readlink) {
  const origAsync = fs.readlink;
  (fs as any).readlink = function (p: any, o: any, cb: any) {
    if (typeof o === "function") {
      cb = o;
      o = undefined;
    }
    return origAsync.call(fs, p, o, (err: any, link: any) => {
      if (err && err.code === "EISDIR") {
        err.code = "EINVAL";
      }
      if (cb) cb(err, link);
    });
  };
}

if (fs && fs.promises && fs.promises.readlink) {
  const origProm = fs.promises.readlink;
  fs.promises.readlink = async function (p: any, o: any) {
    try {
      return await origProm.call(fs.promises, p, o);
    } catch (e: any) {
      if (e && e.code === "EISDIR") {
        e.code = "EINVAL";
      }
      throw e;
    }
  };
}

const nextConfig: NextConfig = {
  distDir: '.next_build',
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.symlinks = false;
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    return config;
  },
};

export default nextConfig;
