
export interface ProductConfig {
    name: string;
    filterUrls: string[];
    matcher: RegExp;
    maxTime?: Date;
};

export const FluencyBuilderConfig: ProductConfig = {
    name: "fluency-builder",
    matcher: /learn\.rosettastone\.com/,
    filterUrls: [
        "https://gaia-server.rosettastone.com/graphql"
    ],
    maxTime: new Date(480000),
};

export const FoundationsConfig: ProductConfig = {
    name: "foundations",
    matcher: /totale\.rosettastone\.com/,
    filterUrls: [
        "https://tracking.rosettastone.com/*"
    ],
};

const products: ProductConfig[] = [
    FoundationsConfig,
    FluencyBuilderConfig,
]

export function getProduct(url: string)
{
    for (let cfg of products) {
        if (url.match(cfg.matcher))
            return cfg
    }

    return null
}
