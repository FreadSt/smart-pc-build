import { Page } from 'playwright';
import type { RawProduct } from '../types/product';

function shouldExcludeTitle(title: string): boolean {
    const t = title.toUpperCase();
    return (
        t.includes('SO-DIMM') ||
        t.includes('SODIMM') ||
        t.includes('SO DIMM') ||
        t.includes('NOTEBOOK') ||
        t.includes('НОУТБУК') ||
        t.includes('DDR3') ||
        t.includes('ddr3') ||
        t.includes('ЛАПТОП')
    );
}

export async function extractRAM(page: Page): Promise<RawProduct[]> {
    // 1. Достаем все данные из браузера без фильтрации
    const products = await page.$$eval('rz-product-tile', (tiles) =>
        tiles.map((el) => {
            const titleEl = el.querySelector('.tile-title');
            const priceEl = el.querySelector('.price');
            const linkEl = el.querySelector('.tile-image-host');
            const imgEl = el.querySelector('img.tile-image');

            return {
                title: titleEl?.textContent?.trim() || '',
                priceText: priceEl?.textContent || '',
                link: linkEl?.getAttribute('href') || '',
                img: imgEl?.getAttribute('src') || '',
            };
        })
    );

    // 2. Фильтруем и обрабатываем данные уже в Node.js контексте
    return products
        .filter((p) => p.title && !shouldExcludeTitle(p.title)) // Здесь shouldExcludeTitle доступен
        .map((p) => ({
            title: p.title,
            price: parseInt(p.priceText.replace(/[^\d]/g, ''), 10) || 0,
            link: p.link,
            img: p.img,
        }));
}

