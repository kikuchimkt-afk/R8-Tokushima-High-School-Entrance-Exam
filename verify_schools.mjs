import { readFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extract(filePath) {
    const data = new Uint8Array(readFileSync(filePath));
    const doc = await getDocument({ data }).promise;

    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();

        const rows = {};
        for (const item of content.items) {
            if (!item.str || item.str.trim() === '') continue;
            const y = Math.round(item.transform[5]);
            const x = Math.round(item.transform[4]);
            if (!rows[y]) rows[y] = [];
            rows[y].push({ x, text: item.str.trim() });
        }

        const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a);

        console.log(`\n=== Page ${i} ===`);
        for (const y of sortedYs) {
            const cells = rows[y].sort((a, b) => a.x - b.x);
            // Show ALL items with position info
            const line = cells.map(c => `[${c.x}]${c.text}`).join('  ');
            console.log(`Y${y}: ${line}`);
        }
    }
}

// Only extract the出願状況 PDF which has the school-department mapping
console.log('=== 出願状況PDF (学校名と学科の対応確認) ===');
await extract('2月18日出願状況_志願変更前.pdf');
