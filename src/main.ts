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
    const items = [
        createAnchor(label('ヤマト運輸', code), `https://jizen.kuronekoyamato.co.jp/jizen/servlet/crjz.b.NQ0010?id=${code}`),
        createAnchor(label('佐川急便', code), `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${code}`),
        createAnchor(label('日本郵政', code), `https://trackings.post.japanpost.jp/services/srv/search/direct?locale=ja&reqCodeNo1=${code}`),
        createAnchor(label('福山通運', code), `https://corp.fukutsu.co.jp/situation/tracking_no_hunt/${code}`),
    ];
    for (const item of items) {
        container.append(createElem('p', { class: 'item' }, [item]));
    }

    const pAll = document.createElement('p');
    pAll.classList.add('item');
    pAll.innerHTML = `<a><span class="title">すべてのリンクを開く</span></a>`;
    pAll.addEventListener('click', ev => {
        if (window.confirm(`${items.length}件のリンクをすべて開きますか?`)) {
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

    async function openAll() {
        for (const item of items) {
            item.click();
        }
    }

    function label(name: string, code: string): string {
        return `${name}の荷物 ${format(code)} を追跡`;
    }

    function format(code: string): string {
        if (/^\d{12}$/.test(code)) {
            return code.split(/(?<=^(?:\d{4})+)/).join('-');
        } else {
            return code;
        }
    }

    function createAnchor(text: string, href: string): HTMLAnchorElement {
        return createElem('a', { href, target: '_blank' }, [
            createElem('span', { class: 'title' }, text),
            createElem('br', {}),
            createElem('span', { class: 'url' }, href),
        ]) as HTMLAnchorElement;
    }

    type ContentsParam = null|string|HTMLElement|ContentsParam[]|(() => ContentsParam);

    function createElem(tag: string, attrs: { [key:string]: string[]|string|number|null }, contentsLike?: ContentsParam): HTMLElement {
        const elem = document.createElement(tag);
        for (const [key, value] of Object.entries(attrs)) {
            if (value == null) {
                elem.removeAttribute(key);
            } else if (Array.isArray(value)) {
                elem.setAttribute(key, value.join(' '));
            } else {
                elem.setAttribute(key, value.toString(10));
            }
        }
        contentsLike ??= null;
        while (typeof contentsLike === 'function') {
            contentsLike = contentsLike();
        }
        const contents = resolveContents(contentsLike ?? null);
        for (const content of contents) {
            if (content instanceof HTMLElement) {
                elem.append(content);
            } else {
                elem.append(document.createTextNode(content));
            }
        }
        return elem;
    }

    function resolveContents(contentsLike: ContentsParam): (string|HTMLElement)[] {
        if (contentsLike == null) return [];
        if (typeof contentsLike === 'function') return resolveContents(contentsLike());
        if (Array.isArray(contentsLike)) return contentsLike.map(resolveContents).flat();
        return [contentsLike];
    }
}