document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('about-gallery-grid');

    // CONFIGURAÇÃO: Total de imagens disponíveis na pasta (nomeadas como image_1.jpeg, image_2.jpeg...)
    const totalImages = 9;
    // ^ Desenvolvedor: Ao adicionar fotos, salve como image_10.jpeg, image_11.jpeg e atualize este número.

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

    if (galleryContainer && totalImages > 0) {
        // 1. Gera um array de números [1, 2, 3, ... totalImages]
        const indices = Array.from({ length: totalImages }, (_, i) => i + 1);

        // 2. Embaralha os números
        const shuffledIndices = shuffleArray(indices);

        // 3. Pega os primeiros 5 números
        const selectedIndices = shuffledIndices.slice(0, maxImagesToShow);

        // 4. Cria e injeta os elementos IMG baseados no padrão de nome
        selectedIndices.forEach((num, index) => {
            const img = document.createElement('img');
            // Constrói o nome do arquivo: image_1.jpeg, image_2.jpeg...
            img.src = `${imagePath}image_${num}.jpeg`;
            img.alt = 'Ambiente Bar Los Hermanos';

            // Adiciona delay na animação
            img.style.animationDelay = `${index * 0.15}s`;

            img.onerror = function () {
                this.style.display = 'none';
            };

            galleryContainer.appendChild(img);
        });
    }
});
