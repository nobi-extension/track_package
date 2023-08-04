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
        createAnchorToPost(label('ヤマト運輸', code), 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko', { number01: code }),
        createAnchorToGet(label('佐川急便', code), `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${code}`),
        createAnchorToGet(label('日本郵便', code), `https://trackings.post.japanpost.jp/services/srv/search/direct?locale=ja&reqCodeNo1=${code}`),
        createAnchorToGet(label('福山通運', code), `https://corp.fukutsu.co.jp/situation/tracking_no_hunt/${code}`),
    ];
    for (const item of items) {
        container.append(createElem('p', { class: 'item' }, [item]));
    }

    const aAll = createAnchorToGet('すべてのリンクを開く', '');
    aAll.addEventListener('click', ev => {
        if (window.confirm(`${items.length}件のリンクをすべて開きますか?`)) {
            ev.preventDefault();
            openAll();
        }
    });
    container.append(createElem('p', { class: 'item' }, [aAll]));

    function error(msg: string) {
        const p = document.createElement('p');
        p.classList.add('error'); 
        p.textContent = msg;
        container.append(p);
    }

    function openAll() {
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

    type FormValues = { [key: string]: string };

    function createAnchorToGet(text: string, url: string, values: FormValues = {}): HTMLAnchorElement {
        const search = Object.entries(values).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&');
        const href = (search !== '') ? `${url}?${search}` : url;
        return createElem('a', { href, target: '_blank' }, [
            createElem('span', { class: 'title' }, text),
            createElem('br', {}),
            createElem('span', { class: 'url' }, href),
        ]) as HTMLAnchorElement;
    }

    function createAnchorToPost(label: string, action: string, values: FormValues): HTMLAnchorElement {
        const formName = `form-${document.forms.length + 1}`;
        const form = createElem('form', { name: formName, method: 'post', action, target: '_blank' });
        for (const [name, value] of Object.entries(values)) {
            form.append(createElem('input', { type: 'hidden', name, value }));
        }
        document.body.append(form);
        const a = createAnchorToGet(label, action);
        a.href = action;
        a.addEventListener('click', ev => {
            ev.preventDefault();
            document.forms.namedItem(formName)!.submit();
        });
        return a;
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