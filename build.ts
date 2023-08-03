import { execSync } from "child_process";
import { copyFileSync, mkdirSync, readdirSync } from "fs";

const DEST = './dist';
const SRC = './src';

compileTS();
copyFiles();

function copyFiles() {
    for (const f of readdirSync('./src')) {
        if (/\.(html|js|css|json|jpg|ico|png)$/i.test(f)) {
            const src = `${SRC}/${f}`;
            const dst = `${DEST}/${f}`;
            mkdirSync(DEST, { recursive: true });
            console.log(`Copying ${src} -> ${dst}`);
            copyFileSync(src, dst);
        }
    }
}

function compileTS() {
    const msg = execSync('npx tsc --build --verbose', { 'encoding': 'ascii' });
    console.log(msg);
}