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
        return error(`${rawCode} は有効な追跡番号ではありません。`);
    }
    const links = {
        'ヤマト運輸': `https://jizen.kuronekoyamato.co.jp/jizen/servlet/crjz.b.NQ0010?id=${code}`,
        '佐川急便': `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${code}`,
        '日本郵政': `https://trackings.post.japanpost.jp/services/srv/search/direct?locale=ja&reqCodeNo1=${code}`,
        '福山通運': `https://corp.fukutsu.co.jp/situation/tracking_no_hunt/${code}`,
    };
    for (const [name, href] of Object.entries(links)) {
        const p = document.createElement('p');
        p.classList.add('item');
        container.append(p);
        const a = document.createElement('a');
        p.append(a);
        a.href = href;
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

    function error(msg: string) {
        const p = document.getElementById('error-message')!;
        p.textContent = msg;
        container.remove();
    }

    function format(code: string): string {
        if (/^\d{12}$/.test(code)) {
            return code.split(/(?<=^(?:\d{4})+)/).join('-');
        } else {
            return code;
        }
    }
}