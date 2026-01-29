/**
 * assets/js/dom-helpers.js
 * Utilitários para criação segura de elementos DOM
 */

export const el = (tag, props = {}, children = []) => {
    // 1. Criar Elemento
    const element = document.createElement(tag);

    // 2. Aplicar Propriedades e Eventos
    Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
            // Event Listeners (ex: onClick)
            const eventName = key.toLowerCase().substring(2);
            element.addEventListener(eventName, value);
        } else if (key === 'className' || key === 'class') {
            // Classes
            element.className = value;
        } else if (key === 'dataset') {
            // Data Attributes
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key === 'style' && typeof value === 'object') {
            // Estilos Inline
            Object.assign(element.style, value);
        } else {
            // Atributos normais (src, href, id)
            if (value !== null && value !== undefined && value !== false) {
                element.setAttribute(key, value);
            }
        }
    });

    // 3. Anexar Filhos
    if (children) {
        const childArray = Array.isArray(children) ? children : [children];
        
        childArray.forEach(child => {
            if (child instanceof Node) {
                element.appendChild(child);
            } else if (child !== null && child !== undefined && child !== false) {
                element.appendChild(document.createTextNode(String(child)));
            }
        });
    }

    return element;
};

// Helper para selecionar (estilo jQuery light)
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
