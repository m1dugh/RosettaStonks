import * as esbuild from "npm:esbuild"

import { denoPlugins } from "jsr:@luca/esbuild-deno-loader"

const configs = {
    "front": {
        entryPoints: ["./src/frontend/index.ts"],
        outfile: "./dist/front.esm.js",
    },
    "worker": {
        entryPoints: ["./src/worker/index.ts"],
        outfile: "./dist/worker.esm.js",
    },
}

if (Deno.args.length != 1 || ! Object.keys(configs).includes(Deno.args[0])) {
    throw new Error("Expected an argument for packaging, expected one of '" + Object.keys(configs) + "', got " + Deno.args[0])
}

const config = configs[Deno.args[0]]

const result = await esbuild.build({
    plugins: [...denoPlugins()],
    bundle: true,
    format: "esm",
    ...config
})

console.log(result.outputFiles)

esbuild.stop()