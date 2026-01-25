
import { supabase } from "./supabase-client.js";

/**
 * Busca itens marcados como destaque (combos/promocionais)
 */
export async function getFeaturedItems() {
    try {
        const { data, error } = await supabase
            .from('cardapio')
            .select('*')
            .eq('destaque', true)
            .eq('ativo', true)
            .not('img_url', 'is', null);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Erro ao buscar destaques:", error);
        return [];
    }
}

/**
 * Busca itens por categoria
 * @param {string} category - Categoria no banco (ex: 'burguers', 'bebidas')
 */
export async function getItemsByCategory(category) {
    try {
        const { data, error } = await supabase
            .from('cardapio')
            .select('*')
            .eq('categoria', category)
            .eq('ativo', true)
            .not('img_url', 'is', null);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error(`Erro ao buscar categoria ${category}:`, error);
        return [];
    }
}

/**
 * Busca um item específico pelo ID
 * @param {number} id 
 */
export async function getItemById(id) {
    try {
        const { data, error } = await supabase
            .from('cardapio')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Erro ao buscar item ${id}:`, error);
        return null;
    }
}

/**
 * Busca itens populares (pode ser baseado em flag ou aleatório, por enquanto busca todos os ativos não-destaque para preencher a grid)
 */
export async function getPopularItems() {
    try {
        // Buscando alguns itens para a grid de populares (limitado a 10 para não pesar)
        const { data, error } = await supabase
            .from('cardapio')
            .select('*')
            .eq('ativo', true)
            .not('img_url', 'is', null)
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Erro ao buscar itens populares:", error);
        return [];
    }
}

/**
 * Busca TODOS os itens ativos (para a categoria "Todas")
 */
export async function getAllItems() {
    try {
        const { data, error } = await supabase
            .from('cardapio')
            .select('*')
            .eq('ativo', true)
            .not('img_url', 'is', null);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Erro ao buscar todos os itens:", error);
        return [];
    }
}
