/**
 * Created by TimeWz667 on 17/04/2018.
 */

const definition = require("./package.json");
const dependencies = Object.keys(definition.dependencies || {});

export default {
    input: 'index.js',
    external: dependencies,
    output: {
        file: 'build/bayes-net.js',
        format: 'cjs'
    },
    plugins: [ ]
};
