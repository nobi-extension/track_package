init();
function init() {
    const container = document.getElementById('container')!;
    const m = document.location.search.match(/[?&]code\=([^&]+)/);
    if (m == null) {
        return error('追跡番号が指定されていません。');
    }
    const rawCode = decodeURIComponent(m[1]!);
    const code = rawCode.replace(/-/g, '').match(/[0-9A-Z]{10,}/)?.[0] ?? null;
    if (code === null) {
        return error(`「${rawCode} 」 は有効な追跡番号ではありません。`);
    }
    const links = {
        'ヤマト運輸': `https://jizen.kuronekoyamato.co.jp/jizen/servlet/crjz.b.NQ0010?id=${code}`,
        '佐川急便': `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${code}`,
        '日本郵政': `https://trackings.post.japanpost.jp/services/srv/search/direct?locale=ja&reqCodeNo1=${code}`,
        '福山通運': `https://corp.fukutsu.co.jp/situation/tracking_no_hunt/${code}`,
    };
    const hrefs: string[] = [];
    for (const [name, href] of Object.entries(links)) {
        const p = document.createElement('p');
        p.classList.add('item');
        container.append(p);
        const a = document.createElement('a');
        p.append(a);
        a.href = href;
        hrefs.push(href);
        a.target = '_blank';
        const spanTitle = document.createElement('span');
        spanTitle.classList.add('title');
        spanTitle.textContent = `${name}の荷物 ${format(code)} を追跡`;
        const spanURL = document.createElement('span');
        spanURL.classList.add('url');
        spanURL.textContent = href;
        a.append(
            spanTitle,
            document.createElement('br'),
            spanURL,
        );
    }

    const pAll = document.createElement('p');
    pAll.classList.add('item');
    pAll.innerHTML = `<a><span class="title">すべてのリンクを開く</span></a>`;
    pAll.addEventListener('click', ev => {
        if (window.confirm(`${hrefs.length}件のリンクをすべて開きますか?`)) {
            ev.preventDefault();
            openAll();
        }
    });
    container.append(pAll);

    function error(msg: string) {
        const p = document.createElement('p');
        p.classList.add('error'); 
        p.textContent = msg;
        container.append(p);
    }

    function format(code: string): string {
        if (/^\d{12}$/.test(code)) {
            return code.split(/(?<=^(?:\d{4})+)/).join('-');
        } else {
            return code;
        }
    }

    async function openAll() {
        const tab = await chrome.tabs.getCurrent();
        let index = tab?.index;
        if (index != null) index += 1;
        for (const href of hrefs.reverse()) {
            chrome.tabs.create({ url: href, index, active: true });
        }
    }
}