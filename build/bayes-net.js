'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var math = require('mathjs');
var PD = require('probability-distributions');
var oc = require('obj-creator');
var ig = _interopDefault(require('infergraph.js'));

/**
 * Created by TimeWz667 on 04/07/2018.
 */


function flattenNodes(node) {
    const ns = [];
    function f(node) {
        ns.push(node);
        if (node.args) {
            node.args.forEach(f);
        }
    }
    f(node);
    return ns;
}


function findParents(node) {
    const nodes = flattenNodes(node);
    return nodes.filter(e => e.type === "SymbolNode").map(e => e.name);
}


function parseFunction(exp) {
    const root = math.parse(exp);
    return {
        Name: root.fn.name,
        Args: root.args,
        Parents: findParents(root)
    }
}


function assignParents(parsed, loc) {
    return {
        Name: parsed.Name,
        Args: parsed.Args.map(e => e.eval(loc))
    }
}


var parser = {
    findParents: findParents,
    parseFunction: parseFunction,
    assignParents: assignParents
}

class ProbabilityDistribution {
    constructor() {
        this.Name = null;
        this.json = null;
    }

    get Interval() {
        return [-Infinity, Infinity];
    }

    get Upper() {
        return Infinity;
    }

    get Lower() {
        return -Infinity;
    }

    get Type() {
        return "Double";
    }

    sample(n) {

    }

    logpdf(v) {

    }

    mean() {

    }

    std() {

    }

    toJSON() {
        return this.json;
    }
}


class DExp extends ProbabilityDistribution {
    constructor(rate) {
        super();
        this.Rate = rate;
        this.Name = `exp(${this.Rate})`;
        this.json = {Name: "exp", Args: {rate: rate}};

    }

    get Interval() {
        return [0, Infinity];
    }

    get Lower() {
        return 0;
    }

    mean() {
        return 1 / this.Rate;
    }

    std() {
        return 1 / this.Rate;
    }

    logpdf(v) {
        return PD.dexp(v, this.Rate);
    }

    sample(n) {
        n = n||1;
        if (n === 1) {
            return PD.rexp(n, this.Rate)[0];
        } else {
            return PD.rexp(n, this.Rate);
        }
    }
}


class DGamma extends ProbabilityDistribution {
    constructor(shape, rate) {
        super();
        this.Shape = shape;
        this.Rate = rate;
        this.Name = `gamma(${this.Shape}, ${this.Rate})`;
        this.json = {Name: "gamma", Args: {shape: shape, rate: rate}};
    }

    get Interval() {
        return [0, Infinity];
    }

    get Lower() {
        return 0;
    }

    mean() {
        return this.Shape / this.Rate;
    }

    std() {
        return math.sqrt(this.Shape / this.Rate / this.Rate);
    }

    logpdf(v) {
        return PD.dexp(v, this.Rate); // todo
    }

    sample(n) {
        n = n||1;
        if (n === 1) {
            return PD.rgamma(n, this.Shape, this.Rate)[0];
        } else {
            return PD.rgamma(n, this.Shape, this.Rate);
        }
    }
}


class DBinom extends ProbabilityDistribution {
    constructor(size, prob) {
        super();
        this.Size = size;
        this.Prob = prob;
        this.Name = `binom(${this.Size}, ${this.Prob})`;
        this.json = {Name: "binom", Args: {size: this.Size, prob: this.Prob}};
    }

    get Interval() {
        return [0, Infinity];
    }

    get Lower() {
        return 0;
    }

    get Type() {
        return "Integer";
    }

    mean() {
        return this.Size * this.Prob;
    }

    std() {
        return math.sqrt(this.Size * this.Prob * (1 - this.Prob));
    }

    logpdf(v) {
        let li = (v)*Math.log(this.Prob)+(this.Size - v)*Math.log(1-this.Prob);
        li += Math.log(math.gamma(this.Size + 1));
        li -= Math.log(math.gamma(v + 1));
        li -= Math.log(math.gamma(this.Size - v + 1));
        return li;
    }

    sample(n) {
        n = n||1;
        if (n === 1) {
            return PD.rbinom(n, this.Size, this.Prob)[0];
        } else {
            return PD.rbinom(n, this.Size, this.Prob);
        }
    }
}


class DNorm extends ProbabilityDistribution {
    constructor(mu, std) {
        super();
        this.Mu = mu;
        this.Std = std;
        this.Name = `norm(${this.Mu}, ${this.Std})`;
        this.json = {Name: "norm", Args: {mu: this.Mu, std: this.Std}};
    }

    get Interval() {
        return [-Infinity, Infinity];
    }

    get Upper() {
        return Infinity;
    }

    get Lower() {
        return -Infinity;
    }

    get Type() {
        return "Float";
    }

    mean() {
        return this.Mu;
    }

    std() {
        return this.Std;
    }

    logpdf(v) {
        return Math.log(PD.dnorm(v, this.Mu, this.Std));
    }

    sample(n) {
        n = n||1;
        if (n === 1) {
            return PD.rnorm(n, this.Mu, this.Std)[0];
        } else {
            return PD.rnorm(n, this.Mu, this.Std);
        }
    }
}


class DPois extends ProbabilityDistribution {
    constructor(lambda) {
        super();
        this.Lambda = lambda;
        this.Name = `pois(${this.Lambda})`;
        this.json = {Name: "pois", Args: {lambda: this.Lambda}};
    }

    get Interval() {
        return [0, Infinity];
    }

    get Upper() {
        return Infinity;
    }

    get Type() {
        return "Integer";
    }

    mean() {
        return this.Lambda;
    }

    std() {
        return Math.sqrt(this.Lambda);
    }

    logpdf(v) {
        return Math.log(PD.dpois(this.Lambda));
    }

    sample(n) {
        n = n||1;
        if (n === 1) {
            return PD.rpois(1, this.Lambda)[0];
        } else {
            return PD.rpois(n, this.Lambda);
        }
    }
}


class DBeta extends ProbabilityDistribution {
    constructor(a, b) {
        super();
        this.A = a;
        this.B = b;
        this.Name = `beta(${this.A}, ${this.B})`;
        this.json = {Name: "beta", Args: {alpha: this.A, beta: this.B}};
    }

    get Interval() {
        return [0, 1];
    }

    get Lower() {
        return 0;
    }

    get Upper() {
        return 1;
    }

    get Type() {
        return "Float";
    }

    mean() {
        return this.A/(this.A + this.B);
    }

    std() {
        const ab = this.A + this.B;
        return Math.sqrt(this.A * this.B / (ab + 1)) / ab;
    }

    logpdf(v) {
        let li = (this.A-1)*Math.log(v)+(this.B-1)*Math.log(1-v);
        li += Math.log(math.gamma(this.A+this.B));
        li -= Math.log(math.gamma(this.A));
        li -= Math.log(math.gamma(this.B));
        return li;
    }

    sample(n) {
        n = n||1;
        if (n === 1) {
            return PD.rbeta(1, this.A, this.B)[0];
        } else {
            return PD.rbeta(n, this.A, this.B);
        }
    }
}


const ws = oc.getWorkshop("Distribution");

ws.register({
    Name: "exp",
    Constructor: DExp,
    Validators: [
        {name: "rate", type: "PositiveFloat"}
    ]
});

ws.register({
    Name: "gamma",
    Constructor: DGamma,
    Validators: [
        {name: "shape", type: "PositiveFloat"},
        {name: "rate", type: "PositiveFloat"}
    ]
});

ws.register({
    Name: "binom",
    Constructor: DBinom,
    Validators: [
        {name: "size", type: "PositiveInteger"},
        {name: "prob", type: "Probability"}
    ]
});

ws.register({
    Name: "norm",
    Constructor: DNorm,
    Validators: [
        {name: "mu", type: "Float"},
        {name: "std", type: "PositiveFloat"}
    ]
});

ws.register({
    Name: "pois",
    Constructor: DPois,
    Validators: [
        {name: "lambda", type: "PositiveFloat"}
    ]
});

ws.register({
    Name: "beta",
    Constructor: DBeta,
    Validators: [
        {name: "alpha", type: "PositiveFloat"},
        {name: "beta", type: "PositiveFloat"}
    ]
});

var dist = {
    Exp: DExp,
    Gamma: DGamma,
    Binom: DBinom,
    Norm: DNorm,
    Pois: DPois,
    parseDistribution: function(exp) {
        const parsed = parser.parseFunction(exp);

        parsed.compile = function(loc) {
            return ws.fromJSON(parser.assignParents(this, loc));
        };

        if (parsed.Parents.length === 0) {
            return parsed.compile();
        } else {
            return parsed;
        }
    }
}

/**
 * Created by TimeWz667 on 03/07/2018.
 */


class Loci {
    constructor(name, def) {
        this._name = name;
        this._def = def;
    }

    get Name() {
        return this._name;
    }

    get Definition() {
        return this._def;
    }

    get Type() {

    }

    sample(parents) {

    }

    evaluate(parents) {

    }

    get Expression() {
        return this._name;
    }

    fill(gene) {
        gene[this.Name] = this.sample(gene);
    }

    toJSON() {
        return {
            Name: this.Name,
            Def: this.Definition,
        }
    }
}


class ValueLoci extends Loci {
    constructor(name, val) {
        super(name, math.eval(val) + "");
        this.Value = math.eval(val);
    }

    sample() {
        return this.Value;
    }

    evaluate() {
        return 0;
    }

    toJSON() {
        const js = super.toJSON();
        js.Type = "Value";
        return js;
    }

    get Type() {
        return "Value";
    }

    get Expression() {
        return `${this.Name}=${this.Value}`
    }
}


class ExoValueLoci extends Loci {
    constructor(name) {
        super(name, "");
    }

    sample(gene) {
        throw `${this.Name} is not usable`;
    }

    evaluate(gene) {
        return 0;
    }

    toJSON() {
        const js = super.toJSON();
        js.Type = "ExoValue";
        return js;
    }

    get Type() {
        return "ExoValue";
    }
}


class FunctionLoci extends Loci {
    constructor(name, fn, parents) {
        super(name, fn);
        const node = math.parse(fn);
        this.Function = node.compile();
        if (parents) {
            this.Parents = parents;
        } else {
            this.Parents = parser.findParents(node);
        }
    }

    sample(gene) {
        const loc = {};
        this.Parents.forEach(p => loc[p] = gene[p]);
        return this.Function.eval(loc);
    }

    evaluate(gene) {
        return 0;
    }

    toJSON() {
        const js = super.toJSON();
        js.Type = "Function";
        js.Parents = this.Parents;
        return js;
    }

    get Expression() {
        return `${this.Name}=${this.Definition}`
    }

    get Type() {
        return "Function";
    }
}



class DistributionLoci extends Loci {
    constructor(name, di, parents) {
        super(name, di);

        this.Distribution = dist.parseDistribution(di);

        if (parents) {
            this.Parents = parents;
        } else {
            this.Parents = this.Distribution.Parents;
        }
    }

    getDistribution(gene) {
        if (this.Distribution.sample) {
            return this.Distribution;
        } else {
            return this.Distribution.compile(gene);
        }
    }


    sample(gene) {
        return this.getDistribution(gene).sample();
    }

    evaluate(gene) {
        const v = gene[this.Name];
        return this.getDistribution(gene).logpdf(v);
    }

    toJSON() {
        const js = super.toJSON();
        js.Type = "Distribution";
        js.Parents = this.Parents;
        return js;
    }

    get Expression() {
        return `${this.Name}~${this.Definition}`
    }

    get Type() {
        return "Distribution";
    }
}


class PseudoLoci extends Loci {
    constructor(name, fn) {
        super(name, fn);
        this.Parents = parser.findParents(math.parse(fn));
    }

    sample(gene) {
        throw `${this.Name} is not usable`;
    }

    evaluate(gene) {
        throw `${this.Name} is not usable`;
    }

    toJSON() {
        const js = super.toJSON();
        js.Type = "Pseudo";
        js.Parents = this.Parents;
        return js;
    }

    get Expression() {
        return `${this.Name}=f(${this.Parents.join(", ")})`;
    }

    get Type() {
        return "Pseudo";
    }
}


var loci = {
    Function: FunctionLoci,
    Value: ValueLoci,
    ExoValue: ExoValueLoci,
    Distribution: DistributionLoci,
    Pseudo: PseudoLoci
};

/**
 * Created by TimeWz667 on 30/07/2018.
 */


class BayesNet {
    constructor(name) {
        this.Name = name || 'BN';
        this.DAG = ig.newDiGraph();
        this._frozen = false;
    }

    node(key, type, value) {
        if (arguments.length === 1) {
            if (typeof key === "object") {
                type = key.Type;
                value = key.Def;
                key = key.Name;
            } else {
                return this.DAG.getNode(key).attr("loci");
            }

        }

        const loc = new loci[type](key, value);
        this.DAG.addNode(key).attr("loci", loc);
        if (loc.Parents) {
            loc.Parents.forEach(p => {
                if (!this.DAG.Nodes[p]) {
                    this.DAG.addNode([p, {loci: new loci.ExoValue(p)}]);
                }
                this.DAG.addEdge(p, key);
            });
        }

        return this;
    }

    sample(given) {
        const x = Object.assign({}, given);
        g.Order.filter(e=>!x[e]).forEach(e=> g.node(e).fill(x));
        return x;
    }

    findSufficientNodes(include, given) {
        given = new Set(given);
        let inc = new Set(include);
        let querying = include;

        while(true) {
            querying = querying.map(e => this.DAG.getParentKeys(e))
                .reduce((a, b) => a.concat(b), [])
                .filter(e => !given.has(e) & !inc.has(e));

            querying = [...(new Set(querying))];

            if (querying.length > 0) {
                querying.forEach(e => inc.add(e));
            } else {
                break;
            }
        }

        for(let k in given.keys()) {inc.add(k);}
        return this.Order.filter(e=>inc.has(e)|given.has(e));
    }

    get isFrozen() {
        return this._frozen;
    }

    get Order() {
        return this.DAG.getOrder();
    }

    get Expression() {
        const od = this.DAG.getOrder();
        return `PCore ${this.Name} {\n\t` +
            this.DAG.getNodes(od).attr('loci').map(l=>l.Expression).join("\n\t") +
            "\n}";
    }

    freeze() {
        if (this._frozen) return;
        const ns = this.Order;
        this.RootNodes = this.DAG.getNodes(e=>!e.loci.Parents).attr("id");
        this.LeafNodes = ns.filter(e=>!this.DAG.getChildKeys(e).length);
        this.ExoNodes = this.DAG.getNodes(e=>e.loci.Type === 'ExoValue').attr("id");

        this._frozen = true;
    }

}

exports.parser = parser;
exports.dist = dist;
exports.loci = loci;
exports.BayesNet = BayesNet;
