import { PlaywrightCrawler } from '@crawlee/playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

import { normalizeCPU } from './normalizzers/cpu';

dotenv.config();

chromium.use(stealth());

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const runCrawler = async () => {
    const crawler = new PlaywrightCrawler({
        launchContext: {
            launcher: chromium,
            launchOptions: {
                headless: false,
            }
        },
        maxRequestsPerCrawl: 50,
        maxConcurrency: 5,
        maxRequestRetries: 3,
        requestHandlerTimeoutSecs: 60,
        async requestHandler({ page, log }) {
            log.info('Страница открыта, ждем загрузки...');

            // Прокрутка вниз, чтобы сработали скрипты Rozetka
            await page.mouse.wheel(0, 1000);
            await page.waitForTimeout(2000);

            // Rozetka может использовать разные классы. Ждем любой из них.
            try {
                await page.waitForSelector('.catalog-grid__cell, .goods-tile__inner', {
                    timeout: 30000,
                    state: 'visible'
                });
            } catch (e) {
                log.error('Товары не появились. Возможно, блок по IP или капча.');
                await page.screenshot({ path: 'debug_error.png' });
                return;
            }

            // Парсим данные
            const rawProducts = await page.$$eval('rz-grid-list > li, .catalog-grid__cell', (els) => {
                return els.map(el => {
                    const titleEl = el.querySelector('.goods-tile__title');
                    const priceEl = el.querySelector('.goods-tile__price-value');
                    const linkEl = el.querySelector('.goods-tile__heading') as HTMLAnchorElement;
                    const imgEl = el.querySelector('.goods-tile__picture img') as HTMLImageElement;

                    return {
                        title: titleEl?.textContent?.trim() || '',
                        price: priceEl?.textContent?.replace(/\D/g, '') || '0',
                        link: linkEl?.href || '',
                        img: imgEl?.src || imgEl?.getAttribute('data-src') || '' // Обработка lazy-load картинок
                    };
                }).filter(p => p.title && p.link); // Убираем пустые карточки
            });

            log.info(`Успешно получено: ${rawProducts.length} товаров`);

            for (const raw of rawProducts) {
                const specs = normalizeCPU(raw.title);
                const slug = raw.link.split('?')[0].split('/').filter(Boolean).pop();

                const { error } = await supabase.from('parts').upsert({
                    slug,
                    name: raw.title,
                    price: parseInt(raw.price, 10),
                    category: 'CPU',
                    image_url: raw.img,
                    link: raw.link,
                    specs,
                    last_updated: new Date().toISOString(),
                }, { onConflict: 'slug' });

                if (error) log.error(`DB Error: ${error.message}`);
            }
        },
    });

    await crawler.run(['https://hard.rozetka.com.ua/ua/processors/c80083/']);
};

runCrawler().catch((err) => {
    console.error('Критическая ошибка кроулера:', err);
    process.exit(1);
});