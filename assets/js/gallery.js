document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('about-gallery-grid');
    
    // CONFIGURAÇÃO: Liste aqui os nomes exatos das imagens disponíveis na pasta assets/img/sobre/
    const allImages = [
        'angu-baiana.jpeg', 
        'cachaca-sabor.jpeg', 
        'camarao.jpeg', 
        'cestinha-file.jpeg', 
        'jilo-especial.jpeg', 
        'moda-nordestina.jpeg', 
        'quesadilha.jpeg', 
        'taco-loko.jpeg'
    ]; 
    // ^ Desenvolvedor: Certifique-se que estes arquivos existem ou renomeie suas imagens para este padrão.

    const imagePath = 'assets/img/sobre/';
    const maxImagesToShow = 5; // Quantidade desejada na grade

    // Função para embaralhar (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    if (galleryContainer && allImages.length > 0) {
        // 1. Embaralha o array de nomes
        const shuffled = shuffleArray([...allImages]);
        
        // 2. Pega os primeiros 5 itens
        const selected = shuffled.slice(0, maxImagesToShow);

        // 3. Cria e injeta os elementos IMG
        selected.forEach((filename, index) => {
            const img = document.createElement('img');
            img.src = `${imagePath}${filename}`;
            img.alt = 'Ambiente Bar Los Hermanos';
            
            // Adiciona delay na animação para cada imagem aparecer em sequência
            img.style.animationDelay = `${index * 0.15}s`;
            
            // Tratamento caso a imagem não carregue (evita ícone de erro quebrado)
            img.onerror = function() { 
                this.style.display = 'none'; 
            };

            galleryContainer.appendChild(img);
        });
    }
});
