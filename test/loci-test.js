/**
 * Created by TimeWz667 on 03/07/2018.
 */
const tape = require("tape"),
    loci = require("../build/bayes-net").loci;

tape("nodes", function(test) {
    const fl = new loci.Function("f", "min(4, x)/y");
    test.deepEquals(fl.Parents, ["x", "y"]);
    test.equals(fl.sample({x: 2, y: 1}), 2);

    const vl = new loci.Value("v", "5");
    test.deepEquals(vl.Parents, undefined);
    test.equals(vl.sample(), 5);

    const vfl = new loci.Value("v", "5/2");
    test.deepEquals(vfl.Parents, undefined);
    test.equals(vfl.sample(), 2.5);
    test.end();
});