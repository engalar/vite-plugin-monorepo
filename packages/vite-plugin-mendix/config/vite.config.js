import { defineConfig } from "vite";
import vitePluginMendix from "@engalar/vite-plugin-mendix";
import { join } from "path";
const sourcePath = process.cwd();
const widgetPackageJson = require(join(sourcePath, "package.json"));

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        include: ["react/jsx-runtime", "react-dom", "scheduler"]
    },
    plugins: [
        vitePluginMendix({
            widgetName: widgetPackageJson.widgetName,
            widgetPackage: widgetPackageJson.packagePath,
            testProject: widgetPackageJson.config.projectPath,
            isReactClient: true,
            isTs: false,
        }),
    ]
});
