import { defineConfig } from "vite";
import vitePluginMendix from "@engalar/vite-plugin-mendix";
import { join } from "path";
const sourcePath = process.cwd();
const widgetPackageJson = require(join(sourcePath, "package.json"));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vitePluginMendix({
            widgetName: widgetPackageJson.widgetName,
            widgetPackage: widgetPackageJson.packagePath,
            testProject: widgetPackageJson.config.projectPath
        })
    ]
});
