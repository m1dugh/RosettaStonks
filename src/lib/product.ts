export enum Product {
    Foundations = "foundations",
    FluencyBuilder = "fluency builder",
}

export function getProductFromUrl(url: URL): Product {
    switch (url.hostname) {
        case "totale.rosettastone.com":
            return Product.Foundations;
        case "learn.rosettastone.com":
            return Product.FluencyBuilder;
        default:
            throw new Error("Invalid site for product");
    }
}

export function getTabUrl(): Promise<URL> {
    return new Promise((resolve, reject) => {
        browser.tabs.query({
            active: true,
            currentWindow: true,
        }).then(([tab]: {url: string | undefined}[]) => {
            if (tab.url === undefined) {
                reject()
                return
            }

            const url = URL.parse(tab.url)
            if (url === null)
                reject()
            else
                resolve(url)

        }).catch(reject)
    })
}

export async function getProduct(): Promise<Product> {
    return getProductFromUrl(await getTabUrl())
}
