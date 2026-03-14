import { createClient } from '@supabase/supabase-js'

// Используем service_role для теста записи
const supabase = createClient(
    'https://iirqssurrobhbowhldek.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnFzc3Vycm9iaGJvd2hsZGVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyMzc1MCwiZXhwIjoyMDg4Nzk5NzUwfQ.9ScgwsZxG5HyFZTSB8Ehkx_cwvSK_e-Zx6wjWX-7eTA'
)

async function test() {
    const { data, error } = await supabase
        .from('parts')
        .insert([
            {
                slug: 'test-item',
                name: 'Test Component',
                category: 'CPU',
                price: 0
            }
        ])
        .select()

    if (error) {
        console.error('Ошибка подключения:', error.message)
    } else {
        console.log('Успех! Данные записаны:', data)
    }
}

test()