/* eslint-disable no-undef */
/* eslint-disable sort-imports */
/* eslint-disable no-process-env */
import { defineConfig } from "vite";
import vitePluginMendix from "@engalar/vite-plugin-mendix";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

const sourcePath = process.cwd();
const widgetPackageJson = require(join(sourcePath, "package.json"));
// 获取 testProject 的值，优先从 MX_PROJECT_PATH 环境变量中获取
const testProject = process.env.MX_PROJECT_PATH || widgetPackageJson.config.projectPath;

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        include: ["react/jsx-runtime", "react-dom", "scheduler"]
    },
    plugins: [
        vitePluginMendix({
            widgetName: widgetPackageJson.widgetName,
            widgetPackage: widgetPackageJson.packagePath,
            testProject: testProject,
            isReactClient: false,
            isTs: false
        })
    ]
});
