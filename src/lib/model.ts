
export interface ProductConfig {
    name: string;
    filterUrls: string[];
    matcher: RegExp;
    maxTime?: Date;
};

export interface CustomRequest {
    url: string;
    body: string;
    headers: any;

    id?: Number;
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

interface CoursePath {
    id: string;
    challengeCount: Number;
}

export interface Course {
    name: string;
    paths: CoursePath[];
}

export interface StoreProduct {
    config: ProductConfig;
    course?: Course;
    timeRequest?: CustomRequest;
    courseRequest?: CustomRequest;
    ready: boolean;
}
