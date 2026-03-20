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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export interface BuildReview {
  totalScore: number;
  verdict: string;
  tags: string[];
  competitors: { name: string; diff: number }[];
}

export async function getPerformanceReview(cpuModel: string, gpuModel: string): Promise<BuildReview> {
  // 1. Получаем данные по обоим компонентам из нашей эталонной таблицы
  const { data: benchmarks } = await supabase
      .from('hardware_benchmarks')
      .select('*')
      .or(`model_name.ilike.%${cpuModel}%,model_name.ilike.%${gpuModel}%`);

  const cpu = benchmarks?.find(b => b.category === 'CPU');
  const gpu = benchmarks?.find(b => b.category === 'GPU');

  if (!cpu || !gpu) {
    return { totalScore: 0, verdict: 'Данные не найдены', tags: [], competitors: [] };
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
  const { data: comps } = await supabase
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