/**
 * Created by TimeWz667 on 03/07/2018.
 */
const tape = require("tape"),
    bn = require("../build/bayes-net");

tape("bn", function(test) {
    const g = new bn.BayesNet();
    g.node('a', 'Distribution', 'exp(0.3)')
        .node('c', 'Function', 'a+b')
        .node('d', 'Pseudo', 'c+ k')
        .node('b', 'Value', 5);

    g.freeze();
    test.deepEquals(["k"], g.ExoNodes);
    test.deepEquals(["a", "b", "k"], g.RootNodes);
    test.deepEquals(["d"], g.LeafNodes);
    test.deepEquals(["k", "c", "d"], g.findSufficientNodes(['d'], ['c','k']));
    test.end();
});