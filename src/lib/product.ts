
export enum Product {
    Foundations = "foundations",
    FluencyBuilder = "fluency builder",
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
    const url = await getTabUrl()
    if (url.hostname === "totale.rosettastone.com")
        return Product.Foundations
    else if (url.hostname === "learn.rosettastone.com")
        return Product.FluencyBuilder

    throw new Error("Invalid site for product")
}
