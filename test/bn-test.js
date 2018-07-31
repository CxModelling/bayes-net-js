/**
 * Created by TimeWz667 on 03/07/2018.
 */
const tape = require("tape"),
    bn = require("../build/bayes-net");

tape("bn", function(test) {
    const g = new bn.BayesNet();
    g.node('a', 'Distribution', 'exp(0.3)')
        .node('c', 'Function', 'a+b')
        .node('d', 'Pseudo', 'a+b+ k')
        .node('b', 'Value', 5);

    g.freeze();
    test.deepEquals(g.ExoNodes, ["k"]);
    test.deepEquals(g.RootNodes, ["a", "b", "k"]);
    test.deepEquals(g.LeafNodes, ["c", "d"]);

    test.end();
});