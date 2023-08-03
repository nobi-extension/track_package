const ID = 'com.nobapp.track_num_search';
chrome.contextMenus.create({
    'id': ID,
    'contexts': ['selection'],
    'type': 'normal',
    'title': '荷物 「%s」 を追跡',
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selection = info.selectionText;
    if (selection == null) return;
    const code = selection.trim();
    const url = chrome.runtime.getURL(`main.html?code=${encodeURIComponent(code)}`);
    chrome.tabs.create({ url, active: true });
});