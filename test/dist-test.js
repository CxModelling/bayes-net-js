/**
 * Created by TimeWz667 on 03/07/2018.
 */
const tape = require("tape"),
    dist = require("../build/bayes-net").dist;

tape("distributions", function(test) {
    let f;
    f = dist.parseDistribution("exp(2)");
    test.equals(f.Name, "exp(2)");
    test.deepEquals(f.toJSON().Args, { rate: 2 });

    f = dist.parseDistribution("binom(2, 0.5)");
    test.equals(f.Name, "binom(2, 0.5)");
    test.deepEquals(f.toJSON().Args, { size: 2, prob: 0.5 });

    f = dist.parseDistribution("gamma(2, 0.5/2)");
    test.equals(f.Name, "gamma(2, 0.25)");
    test.deepEquals(f.toJSON().Args, { shape: 2, rate: 0.25 });

    f = dist.parseDistribution("gamma(2, 0.5/k)");
    f = f.compile({k: 2});
    test.equals(f.Name, "gamma(2, 0.25)");
    test.deepEquals(f.toJSON().Args, { shape: 2, rate: 0.25 });

    f = dist.parseDistribution("pois(2)");
    test.equals(f.Name, "pois(2)");
    test.deepEquals(f.toJSON().Args, { lambda: 2});
    test.end();
});