import { getProductFromUrl } from "../lib/product.ts";

interface Tab {
    url: string;
    id: number;
    active: boolean;
}

interface ChangeInfo {
    status: string;
}

function onTabUpdate(tab: Tab) {
    const effectiveUrl = URL.parse(tab.url)
    if (effectiveUrl === null)
        return
    try {
        getProductFromUrl(effectiveUrl)
        browser.action.enable(tab.id)
    } catch (_e) {
        browser.action.disable(tab.id)
    }
}

export function setupTabListeners() {
    browser.tabs.onActivated.addListener(({tabId}: {tabId: number}) => {
        browser.tabs.get(tabId, onTabUpdate)
    });

    browser.tabs.onUpdated.addListener((_tabId: number, changeInfo: ChangeInfo, tab: Tab) => {
        if (changeInfo.status === "complete")
            onTabUpdate(tab);
    })
}
