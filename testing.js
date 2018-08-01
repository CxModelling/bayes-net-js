const PD = require("probability-distributions");
const oc = require("obj-creator");
const math = require("mathjs");
const ig = require("infergraph.js");
const bn = require("./build/bayes-net");



var g = new bn.BayesNet();
g.node('a', 'Distribution', 'exp(0.3)')
    .node('c', 'Function', 'a+b')
    .node('d', 'Function', 'c + k')
    .node('k', 'Function', 'a + 5');

g.freeze();
console.log(g.Expression);
console.log(g.ExoNodes);
console.log(g.RootNodes);
console.log(g.LeafNodes);

var x = {b: 5};
g.Order.filter(e=>!x[e]).forEach(e=> g.node(e).fill(x));
console.log(x)


console.log(g.findSufficientNodes(['d'], ['c','k']));
