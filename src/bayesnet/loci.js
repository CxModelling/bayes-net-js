/**
 * Created by TimeWz667 on 03/07/2018.
 */
import * as math from "mathjs";
import {default as parser} from "../parser";


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

    fill(gene) {
        gene.put(this.Name, this.sample(gene))
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
}


class ExoValueLoci extends Loci {
    constructor(name, val) {
        super(name, "");
    }

    sample(gene) {
        throw "This node requires pre-definition";
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
    constructor(name, fn) {
        super(name, fn);
        const node = math.parse(fn);
        this.Function = node.compile();
        this.Parents = parser.findParents(node);
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
}


class PseudoLoci extends Loci {
    constructor(name, fn) {
        super(name, fn);
        this.Parents = parser.findParents(math.parse(fn));
    }

    sample(gene) {
        throw "This node is not usable";
    }

    evaluate(gene) {
        throw "This node is not usable";
    }

    toJSON() {
        const js = super.toJSON();
        js.Type = "Pseudo";
        js.Parents = this.Parents;
        return js;
    }
}


export default {
    Function: FunctionLoci,
    Value: ValueLoci,
    ExoValue: ExoValueLoci,
    Pseudo: PseudoLoci
};
