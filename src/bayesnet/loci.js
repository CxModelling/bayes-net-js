/**
 * Created by TimeWz667 on 03/07/2018.
 */
import * as math from "mathjs";
import {default as parser} from "../parser";
import {default as dist} from "../distribution";


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

    sample(parents) {

    }

    evaluate(parents) {

    }

    get Expression() {
        return this._name;
    }

    fill(gene) {
        gene[this.Name] = this.sample(gene)
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

    getDistribution(loc) {
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
        js.Type = "Function";
        js.Parents = this.Parents;
        return js;
    }

    get Expression() {
        return `${this.Name}~${this.Distribution}`
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
}


export default {
    Function: FunctionLoci,
    Value: ValueLoci,
    ExoValue: ExoValueLoci,
    Distribution: DistributionLoci,
    Pseudo: PseudoLoci
};
