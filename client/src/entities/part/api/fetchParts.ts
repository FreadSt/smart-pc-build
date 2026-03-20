import { getSupabaseClient } from "@/shared/lib/supabase/client/client";

export async function fetchParts() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("parts").select("*");

    if (error) throw error;
    return data ?? [];
}