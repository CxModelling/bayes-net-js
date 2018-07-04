/**
 * Created by TimeWz667 on 04/07/2018.
 */
import * as math from "mathjs";


function flattenNodes(node) {
    const ns = [];
    function f(node) {
        ns.push(node);
        if (node.args) {
            node.args.forEach(f)
        }
    }
    f(node);
    return ns;
}


function findParents(node) {
    const nodes = flattenNodes(node);
    return nodes.filter(e => e.type === "SymbolNode").map(e => e.name);
}


function parseFunction(exp) {
    const root = math.parse(exp);
    return {
        Name: root.fn.name,
        Args: root.args,
        Parents: findParents(root)
    }
}


function assignParents(parsed, loc) {
    return {
        Name: parsed.Name,
        Args: parsed.Args.map(e => e.eval(loc))
    }
}


export default {
    findParents: findParents,
    parseFunction: parseFunction,
    assignParents: assignParents
}
