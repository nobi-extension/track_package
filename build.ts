import * as pathLib from "path";
import { execSync } from "child_process";
import { copyFileSync, createReadStream, createWriteStream, mkdirSync, readdirSync, statSync } from "fs";
const archiver = require('archiver');

const DEST = './dist';
const SRC = './src';
const ZIP = './pack.zip';

compileTS();
copyFiles();
zip();

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

function zip() {
    console.log('Packaging...');
    const output = createWriteStream(ZIP);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });
    archive.on('warning', (err: any) => {
        if (err.code === 'ENOENT') {
            console.log('file no entry.');
        } else {
            console.error(err);
            throw err;
        }
    });
    archive.on('error', (err: any) => {
        console.error(err);
        throw err;
    });
    archive.pipe(output);
    for (const p of enumFiles(DEST)) {
        archive.append(createReadStream(pathLib.join(DEST, p)), { name: p });
    }
    archive.finalize();
    console.log(`Packaging done`);
}

function enumFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir)) {
        const p = pathLib.join(dir, entry);
        const stat = statSync(p);
        if (stat.isFile()) {
            files.push(entry);
        } else if (stat.isDirectory()) {
            files.push(...enumFiles(p).map(f => pathLib.join(entry, f)));
        }
    }
    return files;
}