const PD = require("probability-distributions");
const oc = require("obj-creator");
const math = require("mathjs");
const dist = require("./build/bayes-net").dist;



function parseFunction(exp) {
    const root = math.parse(exp);
    return {
        Name: root.fn.name,
        Args: root.args
    }
}

function assignParents(parsed, loc) {
    return {
        Name: parsed.Name,
        Args: parsed.Args.map(e => e.eval(loc))
    }
}

var f = "binom(1, k)";
var di = parseFunction(f);

console.log(di);

var par = assignParents(di, {k: 0.8});

var ws = oc.getWorkshop("Distribution");
console.log(ws.fromJSON(par));
console.log(assignParents(di, {k: 0.8}));

console.log(math.parse("exp(s=5)").args[0])