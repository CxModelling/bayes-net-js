/**
 * Created by TimeWz667 on 03/07/2018.
 */
const tape = require("tape"),
    dist = require("../build/bayes-net").dist;

tape("distributions", function(test) {
    let f;
    f = dist.parse("exp(2)");
    test.equals(f.Name, "exp(2)");
    test.deepEquals(f.toJSON().Args, { rate: 2 });

    f = dist.parse("binom(2, 0.5)");
    test.equals(f.Name, "binom(2, 0.5)");
    test.deepEquals(f.toJSON().Args, { size: 2, prob: 0.5 });

    f = dist.parse("gamma(2, 0.5/2)");
    test.equals(f.Name, "gamma(2, 0.25)");
    test.deepEquals(f.toJSON().Args, { shape: 2, rate: 0.25 });

    f = dist.parse("gamma(2, 0.5/k)");
    f = dist.compile(f, {k: 2});
    test.equals(f.Name, "gamma(2, 0.25)");
    test.deepEquals(f.toJSON().Args, { shape: 2, rate: 0.25 });
    test.end();
});