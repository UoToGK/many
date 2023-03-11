//Created by uoto on 16/4/12.

var ts = require('typescript');
var yaml = require('js-yaml');

var compilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES5,
    inlineSourceMap: true
};

function loadTs(module, filePath) {
    let answer = ts.transpile(ts.sys.readFile(filePath), compilerOptions, filePath);
    return module._compile(answer, filePath);
}

function loadCss(module, filePath) {
    let modcode = '';
    let document = global.document;
    if (document) {
        let basestyle = document.getElementById('basestyle');
        let link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = filePath;
        if (basestyle) {
            document.head.insertBefore(link, basestyle);
        } else {
            document.head.appendChild(link);
        }
    }
    return module._compile(modcode, filePath);
}

function loadYaml(module, filePath) {
    let doc = yaml.load(ts.sys.readFile(filePath), {
        json: true,
        filename: filePath
    });

    return module._compile(`module.exports = ${JSON.stringify(doc)}`, filePath);
}

require.extensions['.ts'] = loadTs;
require.extensions['.css'] = loadCss;
require.extensions['.yaml'] = loadYaml;
