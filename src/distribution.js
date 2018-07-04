import * as math from "mathjs";
import * as PD from "probability-distributions";
import * as oc from "obj-creator";
import {default as parser} from "./parser";


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
        return 0; // todo
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

export default {
    Exp: DExp,
    Gamma: DGamma,
    Binom: DBinom,
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
