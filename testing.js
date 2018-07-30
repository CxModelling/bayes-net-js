const PD = require("probability-distributions");
const oc = require("obj-creator");
const math = require("mathjs");
const ig = require("infergraph.js");
const loci = require("./build/bayes-net").loci;



class BayesNet {
    constructor(name) {
        this.Name = name || 'BN';
        this.DAG = ig.newDiGraph();
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

    get Expression() {
        const od = this.DAG.getOrder();
        return `PCore ${this.Name} {\n\t` +
                od.map(n=>this.DAG.getNode(n).attr('loci').Expression).join("\n\t") +
                "\n}";

        //return this.DAG.getNodes(()=>true).attr('loci').map(l=>l.Expression).join("\n");
    }
}



var g = new BayesNet();
g.node('a', 'Distribution', 'exp(0.3)')
    .node('b', 'Value', 5)
    .node('c', 'Function', 'a+b')
    .node('d', 'Pseudo', 'a+b+ k');

console.log(g.Expression);