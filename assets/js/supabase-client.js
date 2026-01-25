
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ⚠️ SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE ⚠️
const SUPABASE_URL = "https://bdkqoyalqrypfzwijosd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_f7t3ptWdXeQY1m2e7CI5ug_zCA0fn9U";

if (SUPABASE_URL.includes("https://bdkqoyalqrypfzwijosd.supabase.co")) {
    console.warn("⚠️ Supabase Credentials not set! Please configure assets/js/supabase-client.js");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
