/**
 * Created by TimeWz667 on 30/07/2018.
 */

export class Gene {
    constructor(vs) {
        if (vs) {
            Object.assign(this, vs);
        }
        this.LogPrior = 0;
        this.LogLikelihood = 0;
    }

    get LogPosterior() {
        return this.LogLikelihood + this.LogPrior;
    }
}
