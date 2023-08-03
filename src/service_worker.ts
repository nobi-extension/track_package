const ID = 'nobi.extension.track_package';
chrome.contextMenus.create({
    'id': ID,
    'contexts': ['selection'],
    'type': 'normal',
    'title': '荷物番号 「%s」 を追跡',
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selection = info.selectionText;
    if (selection == null) return;
    const code = selection.trim();
    const url = chrome.runtime.getURL(`main.html?code=${encodeURIComponent(code)}`);
    const index = (tab != null) ? (tab.index + 1) : void(0);
    chrome.tabs.create({ url, index, active: true });
});