import { Page } from 'playwright';
import type { RawProduct } from '../types/product';

export async function extractCases(page: Page): Promise<RawProduct[]> {
    return page.$$eval('rz-product-tile', (tiles) =>
        tiles.map((el) => {
            const titleEl = el.querySelector('.tile-title');
            const priceEl = el.querySelector('.price');
            const linkEl = el.querySelector('.tile-image-host');
            const imgEl = el.querySelector('img.tile-image');

            const priceText = priceEl?.textContent ?? '';
            const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

            return {
                title: titleEl?.textContent?.trim() || '',
                price,
                link: linkEl?.getAttribute('href') || '',
                img: imgEl?.getAttribute('src') || '',
            };
        }),
    );
}

