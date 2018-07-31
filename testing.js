const PD = require("probability-distributions");
const oc = require("obj-creator");
const math = require("mathjs");
const ig = require("infergraph.js");
const bn = require("./build/bayes-net");



var g = new bn.BayesNet();
g.node('a', 'Distribution', 'exp(0.3)')
    .node('c', 'Function', 'a+b')
    .node('d', 'Pseudo', 'a+b+ k')
    .node('b', 'Value', 5);

g.freeze();
console.log(g.Expression);
console.log(g.ExoNodes);
console.log(g.RootNodes);
console.log(g.LeafNodes);
