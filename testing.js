const PD = require("probability-distributions");
const math = require("mathjs");
const bn = require("./build/bayes-net");



class NodeGroup {
    constructor(name, nodes) {
        this.Name = name;
        this.Nodes = new Set(nodes);
        this.Children = [];
    }


}



const g = new bn.BayesNet("BMI");

g.node("b1", "Value", 0.5)
    .node("b0", "Distribution", "norm(12, 1)")
    .node("pf", "Distribution", "beta(8, 20)")
    .node("foodstore", "Distribution", "binom(100, pf)")
    .node("b0r", "Distribution", "norm(0, .01)")
    .node("ageA", "Distribution", "norm(20, 3)")
    .node("ageB", "Distribution", "norm(30, 2)")
    .node("muA", "Function", "b0 + b0r + b1*ageA")
    .node("muB", "Function", "b0 + b0r + b1*ageB")
    .node("sdB", "Function", "sd * 0.5")
    .node("bmiA", "Distribution", "norm(muA, sd)")
    .node("bmiB", "Distribution", "norm(muB, sdB)");

g.freeze();
console.log(g.Expression);
console.log(g.ExoNodes);
console.log(g.RootNodes);
console.log(g.LeafNodes);

var x = {sd: 5};
g.Order.filter(e=>!x[e]).forEach(e=> g.node(e).fill(x));
console.log(x);

const bp = [
    {Group: "country", Children: ["city"]},
    {Group: "city", Fixed: ["b0r", "pf"], Children: ["agA", "agB"]},
    {Group: "agA", Fixed: ["ageA"], Actor: ["bmiA"]},
    {Group: "agB", Fixed: ["ageB"], Actor: ["bmiB"]},
];




