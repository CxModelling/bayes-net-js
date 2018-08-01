/**
 * Created by TimeWz667 on 30/07/2018.
 */
import {default as ig} from "infergraph.js";
import {default as loci} from "./loci";


export class BayesNet {
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
                    this.DAG.addNode([p, {loci: new loci.ExoValue(p)}])
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
