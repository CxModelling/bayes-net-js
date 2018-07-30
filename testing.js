const PD = require("probability-distributions");
const oc = require("obj-creator");
const math = require("mathjs");
const ig = require("infergraph.js");
const loci = require("./build/bayes-net").loci;



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
                return this.DAG.getNode(key).get();
            }

        }

        const loc = new (loci[type])(key, value);
        this.DAG.addNode(key).attr('loci', loc);
        if (loc.Parents) {
            loc.Parents.forEach(p => {
                if (!this.DAG.Nodes[p]) {
                    this.DAG.addNode([p, {loci: new loci.ExoValue(p)}])
                }
                this.DAG.addEdge(p, key);
            });
        }

        return this;
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
        const ns = this.Order;
        this.RootNodes = this.DAG.getNodes(e=>!e.loci.Parents).attr("id");
        this.LeafNodes = ns.map((e, i)=>this.DAG.getDescendantKeys(e));
        this.ExoNodes = this.DAG.getNodes(e=>e.loci.Type === 'ExoValue').attr("id");


        this._frozen = true;
    }

}



var g = new BayesNet();
g.node('a', 'Distribution', 'exp(0.3)')
    .node('c', 'Function', 'a+b')
    .node('d', 'Pseudo', 'a+b+ k')
    .node('b', 'Value', 5);

g.freeze();
console.log(g.Expression);
console.log(g.ExoNodes);
console.log(g.RootNodes);
console.log(g.LeafNodes);
