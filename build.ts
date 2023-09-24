console.log("Building...");
Bun.build({
    minify: true,
    entrypoints: ["./index.ts"],
    target: "bun",
    outdir: "./out"
}).then(() => console.log("Build succeed!")).catch(e => console.error(`Build failed: ${e}`));