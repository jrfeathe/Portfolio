const ts = require("typescript");

const compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ES2020,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  isolatedModules: true
};

module.exports = {
  process(src, filename) {
    if (/\.(ts|tsx)$/i.test(filename)) {
      const { outputText } = ts.transpileModule(src, {
        compilerOptions,
        fileName: filename
      });
      return { code: outputText };
    }

    return { code: src };
  }
};
