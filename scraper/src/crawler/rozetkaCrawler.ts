import { PlaywrightCrawler } from '@crawlee/playwright';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import type { Page } from 'playwright';

import type { Category, Product, RawProduct, Specs } from '../types/product';
import { updateCheapest } from '../utils/mappers';

chromium.use(stealth());

const ALLOWED_SOCKETS = new Set(['AM4', 'AM5', 'LGA1700', 'LGA1151']);

export type CategoryConfig = {
    category: Category;
    extract: (page: Page) => Promise<RawProduct[]>;
    normalize: (title: string) => Specs;
};

export function createRozetkaCrawler(config: CategoryConfig) {
    return new PlaywrightCrawler({
        launchContext: {
            launcher: chromium,
            launchOptions: {
                headless: false,
            },
        },
        maxConcurrency: 3,
        async requestHandler({ page, enqueueLinks, log }) {
            await enqueueLinks({
                selector: 'a.pagination__link',
            });

            await page.waitForSelector('rz-product-tile');

            const rawProducts = await config.extract(page);

            log.info(`[${config.category}] Products found: ${rawProducts.length}`);

            for (const raw of rawProducts) {
                const specs = config.normalize(raw.title);

                // Отсеиваем мусорные/старые позиции по сокету для CPU/MOTHERBOARD,
                // чтобы не попадали ноутбучные/очень старые товары.
                if (
                    (specs.category === 'CPU' ||
                        specs.category === 'MOTHERBOARD') &&
                    (!specs.socket ||
                        specs.socket === 'Unknown' ||
                        !ALLOWED_SOCKETS.has(specs.socket))
                ) {
                    continue;
                }

                // Для CPU дополнительно пропускаем "Generic CPU"
                if (specs.category === 'CPU' && specs.model === 'Generic CPU') {
                    continue;
                }

                // Ключ модели: для CPU по model, для остальных – по title
                const modelKey =
                    specs.category === 'CPU' ? specs.model : raw.title;

                const key = `${specs.category}:${modelKey}`;

                const slug = key
                    .toLowerCase()
                    .replace(/\s+/g, '-');

                const product: Product = {
                    slug,
                    name: raw.title,
                    price: raw.price,
                    image_url: raw.img,
                    link: raw.link,
                    specs,
                };

                updateCheapest(key, product);
            }
        },
    });
}