"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProduct = exports.FoundationsConfig = exports.FluencyBuilderConfig = void 0;
;
exports.FluencyBuilderConfig = {
    name: "fluency-builder",
    matcher: /learn\.rosettastone\.com/,
    filterUrls: [
        "https://gaia-server.rosettastone.com/graphql"
    ],
    maxTime: new Date(480000),
};
exports.FoundationsConfig = {
    name: "foundations",
    matcher: /totale\.rosettastone\.com/,
    filterUrls: [
        "https://tracking.rosettastone.com/*"
    ],
};
const products = [
    exports.FoundationsConfig,
    exports.FluencyBuilderConfig,
];
function getProduct(url) {
    for (let cfg of products) {
        if (url.match(cfg.matcher))
            return cfg;
    }
    return null;
}
exports.getProduct = getProduct;
