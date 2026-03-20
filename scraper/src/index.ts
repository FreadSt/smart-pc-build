import { createRozetkaCrawler } from './crawler/rozetkaCrawler';
import { supabase } from './services/supabase';
import { cheapestProducts } from './utils/mappers';
import type { Category, Product } from './types/product';
import { extractCPU } from './extractors/rozetkaCPUExtractor';
import { extractMotherboards } from './extractors/rozetkaMotherboardExtractor';
import { extractGPUs } from './extractors/rozetkaGPUExtractor';
import { extractPSUs } from './extractors/rozetkaPSUExtractor';
import { extractCpuCoolers } from './extractors/rozetkaCpuCoolerExtractor';
import { extractCases } from './extractors/rozetkaCaseExtractor';
import { extractRAM } from './extractors/rozetkaRAMExtractor';
import { extractSSD } from './extractors/rozetkaSSDExtractor';
import { normalizeCPU } from './normalizzers/cpu';
import { normalizeMotherboard } from './normalizzers/motherboard';
import { normalizeGPU } from './normalizzers/gpu';
import { normalizePSU } from './normalizzers/psu';
import { normalizeCpuCooler } from './normalizzers/cpuCooler';
import { normalizeCase } from './normalizzers/case';
import { normalizeRAM } from './normalizzers/ram';
import { normalizeSSD } from './normalizzers/ssd';
import type { RawProduct, Specs } from './types/product';

type CrawlTarget = {
    category: Category;
    envVar: string;
    defaultUrl: string;
    extract: (page: Parameters<typeof extractCPU>[0]) => Promise<RawProduct[]>;
    normalize: (title: string) => Specs;
};

const targets: CrawlTarget[] = [
    {
        category: 'CPU',
        envVar: 'ROZETKA_CPU_URL',
        defaultUrl: 'https://hard.rozetka.com.ua/ua/processors/c80083/',
        extract: extractCPU,
        normalize: normalizeCPU,
    },
    {
        category: 'MOTHERBOARD',
        envVar: 'ROZETKA_MOTHERBOARD_URL',
        defaultUrl: 'https://hard.rozetka.com.ua/ua/motherboards/c80082/',
        extract: extractMotherboards,
        normalize: normalizeMotherboard,
    },
    {
        category: 'GPU',
        envVar: 'ROZETKA_GPU_URL',
        defaultUrl: 'https://hard.rozetka.com.ua/ua/videocards/c80087/',
        extract: extractGPUs,
        normalize: normalizeGPU,
    },
    {
        category: 'PSU',
        envVar: 'ROZETKA_PSU_URL',
        defaultUrl: 'https://hard.rozetka.com.ua/ua/psu/c80086/tip-98627=kompjyuternyj/',
        extract: extractPSUs,
        normalize: normalizePSU,
    },
    {
        category: 'CPU_COOLER',
        envVar: 'ROZETKA_CPU_COOLER_URL',
        defaultUrl: 'https://hard.rozetka.com.ua/ua/coolers/c80099/vid-229213=kuleri,sistemi-vodyanogo-ohlagdeniya;21439=4996/',
        extract: extractCpuCoolers,
        normalize: normalizeCpuCooler,
    },
    {
      category: 'CASE',
      envVar: 'ROZETKA_CASE_URL',
      defaultUrl: 'https://hard.rozetka.com.ua/ua/cases/c80090/21397=13807/',
      extract: extractCases,
      normalize: normalizeCase,
    },
    {
        category: 'SSD',
        envVar: 'ROZETKA_SSD_URL',
        defaultUrl: 'https://hard.rozetka.com.ua/ua/ssd/c80109/21508=5838,47824/',
        extract: extractSSD,
        normalize: normalizeSSD,
    },
    {
        category: 'RAM',
        envVar: 'ROZETKA_RAM_URL',
        defaultUrl: 'https://hard.rozetka.com.ua/ua/memory/c80081/21256=3370;21259=ddr5-sdram,119362/',
        extract: extractRAM,
        normalize: normalizeRAM,
    },
];

const run = async () => {
    for (const target of targets) {
        const url = process.env[target.envVar] ?? target.defaultUrl;

        console.log(`Starting crawl for ${target.category} at ${url}`);

        try {
            const crawler = createRozetkaCrawler({
                category: target.category,
                extract: target.extract,
                normalize: target.normalize,
            });

            await crawler.run([url]);
        } catch (err) {
            console.error(
                `Crawl failed for category ${target.category}:`,
                err,
            );
            // продолжаем остальные категории
        }
    }

    console.log(`Total cheapest products collected: ${cheapestProducts.size}`);

    for (const product of cheapestProducts.values() as Iterable<Product>) {
        const category = product.specs.category;

        const payload = {
            slug: product.slug,
            name: product.name,
            category,
            price: product.price,
            link: product.link,
            specs: product.specs,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('parts')
            .upsert(payload, { onConflict: 'slug' });

        if (error) console.error(error);
    }
};

run();