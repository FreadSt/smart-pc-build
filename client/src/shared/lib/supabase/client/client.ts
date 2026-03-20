import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iirqssurrobhbowhldek.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnFzc3Vycm9iaGJvd2hsZGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjM3NTAsImV4cCI6MjA4ODc5OTc1MH0.fh9S0Fu_uWe5d2ZgjD_dXQlyNqSksv6HzJ6SbHXv7mc';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to client/.env.local."
    );
  }

  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}


export interface BuildReview {
  totalScore: number;
  verdict: string;
  tags: string[];
  competitors: { name: string; diff: number }[];
}

function simplifyModelName(name: string): string {
  return name
      .toLowerCase()
      .replace(/(intel|amd|nvidia|asus|msi|gigabyte|palit|zotac|sapphire|powercolor)\s+/g, '') // Убираем бренды
      .replace(/(core|ryzen|geforce|radeon)\s+/g, '') // Убираем линейки
      .replace(/\s+(oc|lhr|v2|edition|box|tray|lga\d+|am\d+).*/g, '') // Убираем ревизии и сокеты
      .trim();
}

export async function getPerformanceReview(cpuModel: string, gpuModel: string): Promise<BuildReview> {
  const client = getSupabaseClient(); // Используем функцию с фоллбэками!

  const { data: benchmarks, error } = await client
      .from('hardware_benchmarks')
      .select('*')
      .or(`model_name.ilike.%${cpuModel}%,model_name.ilike.%${gpuModel}%`);

  if (error) {
    console.error("Supabase error:", error);
    return { totalScore: 0, verdict: 'Ошибка базы', tags: [], competitors: [] };
  }

  // Добавь этот лог, чтобы увидеть, что реально пришло из базы
  console.log("Matched benchmarks:", benchmarks);

  const cleanCpu = simplifyModelName(cpuModel);
  const cleanGpu = simplifyModelName(gpuModel);

  console.log(`Searching for: CPU(${cleanCpu}), GPU(${cleanGpu})`);

  // Выполняем запросы параллельно для скорости
  const [cpuRes, gpuRes] = await Promise.all([
    client.from('hardware_benchmarks')
        .select('*')
        .eq('category', 'CPU')
        .ilike('model_name', `%${cleanCpu}%`)
        .limit(1)
        .single(),
    client.from('hardware_benchmarks')
        .select('*')
        .eq('category', 'GPU')
        .ilike('model_name', `%${cleanGpu}%`)
        .limit(1)
        .single()
  ]);

  const cpu = cpuRes.data;
  const gpu = gpuRes.data;

  // Если база всё еще пустая, возвращаем заглушку, чтобы интерфейс не был "дыркой"
  if (!cpu || !gpu) {
    console.warn("Benchmarks not found:", { cpuFound: !!cpu, gpuFound: !!gpu });
    return {
      totalScore: 0,
      verdict: 'Данные по производительности уточняются',
      tags: ['В процессе наполнения базы'],
      competitors: []
    };
  }

  // Формула веса производительности (70% - видеокарта, 30% - процессор для игр)
  const totalScore = Math.round(cpu.performance_score * 0.3 + gpu.performance_score * 0.7);

  // 2. Генерация тегов поведения
  const tags: string[] = [];
  if (gpu.tdp > 250) tags.push('Горячий нрав', 'Нужен мощный БП');
  if (gpu.tdp < 150) tags.push('Холодная сборка', 'Тихая работа');

  if (gpu.base_resolution === '4K') tags.push('Ultra Gaming', '4K Beast');
  else if (totalScore > 15000) tags.push('Идеально под 2K', 'Высокий FPS 1440p');
  else tags.push('Король 1080p', 'CyberSport Ready');

  // 3. Поиск конкурентов (кто на 10% мощнее или слабее)
  const { data: comps } = await client
      .from('hardware_benchmarks')
      .select('model_name, performance_score')
      .eq('category', 'GPU')
      .neq('model_name', gpu.model_name)
      .order('performance_score', { ascending: true });

  const competitors = comps
      ?.map(c => ({
        name: c.model_name,
        diff: Math.round(((c.performance_score - gpu.performance_score) / gpu.performance_score) * 100)
      }))
      .filter(c => Math.abs(c.diff) < 20)
      .slice(0, 2) || [];

  return {
    totalScore,
    verdict: totalScore > 20000 ? 'Экстремальная мощь' : 'Сбалансированное решение',
    tags,
    competitors
  };
}