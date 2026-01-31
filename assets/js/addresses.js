/**
 * API de Gerenciamento de Endereços
 * Bar Los Hermanos - Sistema de Múltiplos Endereços
 * 
 * Limite: 3 endereços por usuário (UI)
 * Banco: Ilimitado
 */

// Constantes
const MAX_ADDRESSES = 3;
const ADDRESSES_TABLE = 'enderecos';

/**
 * Buscar todos os endereços do usuário logado
 * @returns {Promise<{data: Array, error: Object}>}
 */
async function getUserAddresses() {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { data: null, error: { message: 'Usuário não autenticado' } };
        }

        const { data, error } = await _supabase
            .from(ADDRESSES_TABLE)
            .select('*')
            .eq('cliente_id', user.id)
            .order('is_padrao', { ascending: false })
            .order('created_at', { ascending: true });

        return { data, error };
    } catch (err) {
        console.error('Erro ao buscar endereços:', err);
        return { data: null, error: err };
    }
}

/**
 * Buscar endereço padrão do usuário
 * @returns {Promise<{data: Object, error: Object}>}
 */
async function getDefaultAddress() {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { data: null, error: { message: 'Usuário não autenticado' } };
        }

        const { data, error } = await _supabase
            .from(ADDRESSES_TABLE)
            .select('*')
            .eq('cliente_id', user.id)
            .eq('is_padrao', true)
            .single();

        // Se não encontrar padrão, retorna o primeiro endereço
        if (!data && !error) {
            const { data: firstAddress, error: firstError } = await _supabase
                .from(ADDRESSES_TABLE)
                .select('*')
                .eq('cliente_id', user.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
            
            return { data: firstAddress, error: firstError };
        }

        return { data, error };
    } catch (err) {
        console.error('Erro ao buscar endereço padrão:', err);
        return { data: null, error: err };
    }
}

/**
 * Buscar endereço específico por ID
 * @param {string} addressId - UUID do endereço
 * @returns {Promise<{data: Object, error: Object}>}
 */
async function getAddressById(addressId) {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { data: null, error: { message: 'Usuário não autenticado' } };
        }

        const { data, error } = await _supabase
            .from(ADDRESSES_TABLE)
            .select('*')
            .eq('id', addressId)
            .eq('cliente_id', user.id)
            .single();

        return { data, error };
    } catch (err) {
        console.error('Erro ao buscar endereço:', err);
        return { data: null, error: err };
    }
}

/**
 * Verificar se usuário pode adicionar mais endereços
 * @returns {Promise<{canAdd: boolean, count: number, error: Object}>}
 */
async function canAddMoreAddresses() {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { canAdd: false, count: 0, error: { message: 'Usuário não autenticado' } };
        }

        const { count, error } = await _supabase
            .from(ADDRESSES_TABLE)
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', user.id);

        if (error) throw error;

        return { 
            canAdd: count < MAX_ADDRESSES, 
            count: count || 0,
            remaining: Math.max(0, MAX_ADDRESSES - (count || 0)),
            error: null 
        };
    } catch (err) {
        console.error('Erro ao verificar limite:', err);
        return { canAdd: false, count: 0, error: err };
    }
}

/**
 * Criar novo endereço
 * @param {Object} addressData - Dados do endereço
 * @param {string} addressData.rua - Nome da rua (obrigatório)
 * @param {string} addressData.numero - Número (obrigatório)
 * @param {string} addressData.bairro - Bairro (obrigatório)
 * @param {string} [addressData.apelido] - Apelido opcional (Casa, Trabalho)
 * @param {string} [addressData.complemento] - Complemento
 * @param {string} [addressData.cidade] - Cidade (default: Governador Valadares)
 * @param {string} [addressData.estado] - Estado (default: MG)
 * @param {string} [addressData.cep] - CEP
 * @param {boolean} [addressData.is_padrao] - Definir como padrão
 * @returns {Promise<{data: Object, error: Object}>}
 */
async function createAddress(addressData) {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { data: null, error: { message: 'Usuário não autenticado' } };
        }

        // Verificar limite
        const { canAdd, error: limitError } = await canAddMoreAddresses();
        if (!canAdd) {
            return { 
                data: null, 
                error: { message: `Limite de ${MAX_ADDRESSES} endereços atingido` } 
            };
        }

        // Validações básicas
        if (!addressData.rua?.trim()) {
            return { data: null, error: { message: 'Rua é obrigatória' } };
        }
        if (!addressData.numero?.trim()) {
            return { data: null, error: { message: 'Número é obrigatório' } };
        }
        if (!addressData.bairro?.trim()) {
            return { data: null, error: { message: 'Bairro é obrigatório' } };
        }

        // Preparar dados
        const newAddress = {
            cliente_id: user.id,
            apelido: addressData.apelido?.trim() || null,
            rua: addressData.rua.trim(),
            numero: addressData.numero.trim(),
            complemento: addressData.complemento?.trim() || null,
            bairro: addressData.bairro.trim(),
            cidade: addressData.cidade?.trim() || 'Governador Valadares',
            estado: addressData.estado?.trim() || 'MG',
            cep: addressData.cep?.trim() || null,
            is_padrao: addressData.is_padrao || false
        };

        const { data, error } = await _supabase
            .from(ADDRESSES_TABLE)
            .insert([newAddress])
            .select()
            .single();

        return { data, error };
    } catch (err) {
        console.error('Erro ao criar endereço:', err);
        return { data: null, error: err };
    }
}

/**
 * Atualizar endereço existente
 * @param {string} addressId - UUID do endereço
 * @param {Object} addressData - Dados a atualizar
 * @returns {Promise<{data: Object, error: Object}>}
 */
async function updateAddress(addressId, addressData) {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { data: null, error: { message: 'Usuário não autenticado' } };
        }

        // Verificar se endereço pertence ao usuário
        const { data: existing, error: checkError } = await getAddressById(addressId);
        if (checkError || !existing) {
            return { data: null, error: { message: 'Endereço não encontrado' } };
        }

        // Preparar dados para atualização
        const updateData = {};
        
        if (addressData.apelido !== undefined) {
            updateData.apelido = addressData.apelido?.trim() || null;
        }
        if (addressData.rua !== undefined) {
            if (!addressData.rua?.trim()) {
                return { data: null, error: { message: 'Rua é obrigatória' } };
            }
            updateData.rua = addressData.rua.trim();
        }
        if (addressData.numero !== undefined) {
            if (!addressData.numero?.trim()) {
                return { data: null, error: { message: 'Número é obrigatório' } };
            }
            updateData.numero = addressData.numero.trim();
        }
        if (addressData.bairro !== undefined) {
            if (!addressData.bairro?.trim()) {
                return { data: null, error: { message: 'Bairro é obrigatório' } };
            }
            updateData.bairro = addressData.bairro.trim();
        }
        if (addressData.complemento !== undefined) {
            updateData.complemento = addressData.complemento?.trim() || null;
        }
        if (addressData.cidade !== undefined) {
            updateData.cidade = addressData.cidade?.trim() || 'Governador Valadares';
        }
        if (addressData.estado !== undefined) {
            updateData.estado = addressData.estado?.trim() || 'MG';
        }
        if (addressData.cep !== undefined) {
            updateData.cep = addressData.cep?.trim() || null;
        }
        if (addressData.is_padrao !== undefined) {
            updateData.is_padrao = addressData.is_padrao;
        }

        const { data, error } = await _supabase
            .from(ADDRESSES_TABLE)
            .update(updateData)
            .eq('id', addressId)
            .eq('cliente_id', user.id)
            .select()
            .single();

        return { data, error };
    } catch (err) {
        console.error('Erro ao atualizar endereço:', err);
        return { data: null, error: err };
    }
}

/**
 * Definir endereço como padrão
 * @param {string} addressId - UUID do endereço
 * @returns {Promise<{data: Object, error: Object}>}
 */
async function setDefaultAddress(addressId) {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { data: null, error: { message: 'Usuário não autenticado' } };
        }

        // Verificar se endereço existe e pertence ao usuário
        const { data: existing, error: checkError } = await getAddressById(addressId);
        if (checkError || !existing) {
            return { data: null, error: { message: 'Endereço não encontrado' } };
        }

        // O trigger no banco vai desmarcar os outros automaticamente
        const { data, error } = await _supabase
            .from(ADDRESSES_TABLE)
            .update({ is_padrao: true })
            .eq('id', addressId)
            .eq('cliente_id', user.id)
            .select()
            .single();

        return { data, error };
    } catch (err) {
        console.error('Erro ao definir endereço padrão:', err);
        return { data: null, error: err };
    }
}

/**
 * Excluir endereço
 * @param {string} addressId - UUID do endereço
 * @returns {Promise<{success: boolean, error: Object}>}
 */
async function deleteAddress(addressId) {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: { message: 'Usuário não autenticado' } };
        }

        // Verificar se endereço existe e pertence ao usuário
        const { data: existing, error: checkError } = await getAddressById(addressId);
        if (checkError || !existing) {
            return { success: false, error: { message: 'Endereço não encontrado' } };
        }

        // Verificar se é o único endereço
        const { count, error: countError } = await _supabase
            .from(ADDRESSES_TABLE)
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', user.id);

        if (countError) throw countError;

        if (count === 1) {
            return { 
                success: false, 
                error: { message: 'Você precisa manter pelo menos um endereço' } 
            };
        }

        // Se for o padrão, definir outro como padrão antes de excluir
        if (existing.is_padrao) {
            const { data: otherAddress } = await _supabase
                .from(ADDRESSES_TABLE)
                .select('id')
                .eq('cliente_id', user.id)
                .neq('id', addressId)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();

            if (otherAddress) {
                await _supabase
                    .from(ADDRESSES_TABLE)
                    .update({ is_padrao: true })
                    .eq('id', otherAddress.id);
            }
        }

        // Excluir endereço
        const { error } = await _supabase
            .from(ADDRESSES_TABLE)
            .delete()
            .eq('id', addressId)
            .eq('cliente_id', user.id);

        if (error) throw error;

        return { success: true, error: null };
    } catch (err) {
        console.error('Erro ao excluir endereço:', err);
        return { success: false, error: err };
    }
}

/**
 * Formatar endereço para exibição
 * @param {Object} address - Objeto endereço
 * @param {boolean} [includeCity=false] - Incluir cidade/estado
 * @returns {string}
 */
function formatAddress(address, includeCity = false) {
    if (!address) return 'Endereço não cadastrado';
    
    let formatted = '';
    
    if (address.apelido) {
        formatted += `${address.apelido}: `;
    }
    
    formatted += `${address.rua}, ${address.numero}`;
    
    if (address.complemento) {
        formatted += ` - ${address.complemento}`;
    }
    
    formatted += ` - ${address.bairro}`;
    
    if (includeCity) {
        formatted += `, ${address.cidade}/${address.estado}`;
    }
    
    return formatted;
}

/**
 * Formatar endereço curto (para badge/cards pequenos)
 * @param {Object} address - Objeto endereço
 * @returns {string}
 */
function formatAddressShort(address) {
    if (!address) return 'Sem endereço';
    
    if (address.apelido) {
        return address.apelido;
    }
    
    return `${address.rua}, ${address.numero}`;
}

// Expor funções globalmente para uso em outras partes do sistema
window.addressesAPI = {
    getUserAddresses,
    getDefaultAddress,
    getAddressById,
    canAddMoreAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    formatAddress,
    formatAddressShort,
    MAX_ADDRESSES
};

// Log de inicialização
console.log('📍 addresses.js carregado - API de endereços disponível');
