import { Page } from 'playwright';
import type { RawProduct } from '../types/product';

export async function extractCpuCoolers(page: Page): Promise<RawProduct[]> {
    return page.$$eval('rz-product-tile', (tiles) =>
        tiles
            .map((el) => {
                const titleEl = el.querySelector('.tile-title');
                const priceEl = el.querySelector('.price');
                const linkEl = el.querySelector('.tile-image-host');
                const imgEl = el.querySelector('img.tile-image');

                const title = titleEl?.textContent?.trim() || '';
                if (!title) return null;

                const badWords = [
                    'ТЕРМОПАСТА',
                    'ПАСТА',
                    'THERMAL PASTE',
                    'THERMAL PAD',
                    'ТЕРМОПРОКЛАДКА',
                    'РАДИАТОР SSD',
                    'M.2',
                    'NVME',
                    'SSD',
                    'MEMORY',
                    'RAM',
                ];
                const t = title.toUpperCase();
                if (badWords.some((w) => t.includes(w))) {
                    return null;
                }

                const priceText = priceEl?.textContent ?? '';
                const price =
                    parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

                return {
                    title,
                    price,
                    link: linkEl?.getAttribute('href') || '',
                    img: imgEl?.getAttribute('src') || '',
                };
            })
            .filter((p): p is RawProduct => p !== null),
    );
}
