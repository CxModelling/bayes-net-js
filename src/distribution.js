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

export default {
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
