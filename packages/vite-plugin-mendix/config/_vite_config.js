import { defineConfig } from "vite";
import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
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
        }),
        rewriteReactImports()
    ]
});


// https://astexplorer.net/#/KJ8AjD6maa
// https://babeljs.io/repl
// https://www.typescriptlang.org/play
function rewriteReactImports() {
    let severUrl;
    return {
        name: "rewrite-react-imports",
        // enforce: "pre",
        transform(code, id) {
            if (id.endsWith(".js") || id.endsWith(".jsx") || id.endsWith(".ts") || id.endsWith(".tsx")) {
                // 使用 Babel 解析器解析代码
                const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });

                // 遍历 AST 并修改导入语句
                traverse(ast, {
                    ImportDeclaration(path) {
                        if (path.node.source.value === "big.js") {
                            path.replaceWith(
                                t.importDeclaration(
                                    [t.importSpecifier(t.identifier("Big"), t.identifier("Big"))],
                                    t.stringLiteral(`${severUrl}/test/dist/commons.js`)
                                )
                            );
                        } else if (path.node.source.value === "mendix") {
                            if (path.node.specifiers.length === 1 && t.isImportSpecifier(path.node.specifiers[0])) {
                                path.replaceWith(
                                    t.variableDeclaration("const", [
                                        t.variableDeclarator(
                                            t.identifier("ValueStatus"),
                                            t.objectExpression([
                                                t.objectProperty(
                                                    t.identifier("Available"),
                                                    t.stringLiteral("available")
                                                ),
                                                t.objectProperty(
                                                    t.identifier("Unavailable"),
                                                    t.stringLiteral("unavailable")
                                                ),
                                                t.objectProperty(t.identifier("Loading"), t.stringLiteral("loading"))
                                            ])
                                        )
                                    ])
                                );
                            }
                        } else {
                            // append severUrl to other imports
                            // path.node.source.value = `${severUrl}/${path.node.source.value}`;
                        }
                    }
                });

                // 使用 Babel 生成器生成新的代码
                const output = generate(ast, { retainLines: true });
                return {
                    code: output.code,
                    map: output.map
                };
            }
            return null;
        },
        configureServer(server) {
            server.httpServer?.once("listening", () => {
                const address = server.httpServer?.address();
                severUrl = `http://localhost:${address.port}`;
                // severUrl = `http://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${
                //     address.port
                // }`;
            });
        }
    };
}
