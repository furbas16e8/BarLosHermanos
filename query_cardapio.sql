INSERT INTO cardapio (nome, descricao, valor, categoria, img_url, ativo) VALUES

-- Entradas e Petiscos
('Torresminho', NULL, 19.90, 'entradas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/entradas/torresminho.png', true),
('Jiló Recheado', 'Gratinado com carne de sol, molho especial e mussarela', 48.90, 'entradas', NULL, true),
('Jiló Especial (Inteira)', 'O famoso Jilozinho do Los: empanado com calabresa, cebola e queijo', 43.00, 'entradas', NULL, true),
('Jiló Especial (Meia)', 'Meia porção do Jiló Especial', 25.00, 'entradas', NULL, true),
('Jiló Solteiro', 'Jiló empanado salpicado de parmesão', 42.00, 'entradas', NULL, true),
('Mussarela Los Hermanos', 'Bolinha de queijo mussarela frita, acompanha molho', 36.00, 'entradas', NULL, true),
('Bolinho de Bacalhau', '6 unidades, acompanha molho da casa', 48.90, 'entradas', NULL, true),
('Fígado Acebolado', 'Fígado de boi acebolado com jiló', 42.00, 'entradas', NULL, true),
('Fígado com Jiló', NULL, 51.00, 'entradas', NULL, true),
('Torresmo de Barriga', NULL, 35.90, 'entradas', NULL, true),




-- Fritas
('Batata Chips', 'Caseira com parmesão', 32.00, 'fritas', NULL, true),
('Fritas', 'Fritas tipo palito tradicional', 28.00, 'fritas', NULL, true),
('Fritas c/ Catupiry e Bacon', 'Fritas tipo palito com catupiry e bacon', 39.90, 'fritas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/fritas/fritas_queijo_e_bacon.png', true),




-- Churrasquinhos
('Churrasquinho Frango', '160gr - Acompanha farofa e vinagrete', 17.00, 'churrasquinhos', NULL, true),
('Churrasquinho Alcatra', '160gr - Acompanha farofa e vinagrete', 23.00, 'churrasquinhos', NULL, true),
('Filé na Manteiga', '160gr - Acompanha farofa e vinagrete', 29.90, 'churrasquinhos', NULL, true),
('Filé Especial', '100gr - Com catupiry e batata palha caseira', 30.90, 'churrasquinhos', NULL, true),
('Filé Super Especial', '100gr - Com gorgonzola e batata palha caseira', 32.90, 'churrasquinhos', NULL, true),
('Frango Especial', '100gr - Com catupiry e batata palha caseira', 19.90, 'churrasquinhos', NULL, true),
('Frango Super Especial', '100gr - Com gorgonzola e batata palha caseira', 24.90, 'churrasquinhos', NULL, true),




--Coxinhas
('Coxinha Gourmet Costelinha', 'Sem massa, costelinha defumada e catupiry', 44.00, 'coxinhas', NULL, true),
('Coxinha Gourmet Frango', 'Sem massa, frango com catupiry', 44.00, 'coxinhas', NULL, true),




-- Jantinhas
('Jantinha de Filé Mingon', 'Com arroz, farofa, vinagrete e fritas', 33.00, 'jantinhas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/jantinhas/jantinha_file.png', true),
('Jantinha de Alcatra', 'Com arroz, farofa, vinagrete e fritas', 33.00, 'jantinhas', NULL, true),
('Jantinha de Frango', 'Com arroz, farofa, vinagrete e fritas', 33.00, 'jantinhas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/jantinhas/jantinha_frango.png', true),
('Jantinha de Frango Arrepiado', 'Com iscas de frango empanado, arroz, farofa, vinagrete e fritas', 33.00, 'jantinhas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/jantinhas/jantinha_frango_arrepiado.png', true),
('Jantinha de Carne de Sol', 'Com arroz, farofa, vinagrete e fritas', 33.00, 'jantinhas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/jantinhas/jantinha_carne_sol.png', true),




-- Batatas Rosti (Vegetarianas)
('Batata Rosti Vegetariana (Espinafre)', 'Espinafre, palmito, alho e cheiro verde', 44.00, 'batatas', NULL, true),
('Batata Rosti Vegetariana (Completa)', 'Espinafre, palmito, alho, tomate, cebola, azeitona, champion', 44.00, 'batatas', NULL, true),
('Batata Rosti Vegetariana (Palmito)', 'Palmito, alho, cebola, tomate e cheiro verde', 46.00, 'batatas', NULL, true),
('Batata Rosti Vegetariana (Alho Poró)', 'Palmito com alho poró', 44.00, 'batatas', NULL, true),
('Batata Rosti Filé Mignon', 'Filé na chapa', 42.00, 'batatas', NULL, true),
('Batata Rosti Filé c/ Palmito', 'Filé na chapa com Palmito', 44.00, 'batatas', NULL, true),
('Batata Rosti Filé c/ Bacon', 'Filé na chapa com Bacon', 44.00, 'batatas', NULL, true),
('Batata Rosti Filé c/ P&B', 'Filé na chapa com Palmito e Bacon', 46.00, 'batatas', NULL, true),
('Batata Rosti Bacon c/ Cream Cheese', NULL, 42.00, 'batatas', NULL, true),
('Batata Rosti Bacon c/ Palmito', NULL, 42.00, 'batatas', NULL, true),
('Batata Rosti Carne de Sol', NULL, 42.00, 'batatas', NULL, true),
('Batata Rosti Carne de Sol c/ Bacon', NULL, 44.00, 'batatas', NULL, true),
('Batata Rosti Carne de Sol c/ Palmito', NULL, 44.00, 'batatas', NULL, true),
('Batata Rosti Frango', NULL, 40.00, 'batatas', NULL, true),
('Batata Rosti Frango c/ Bacon', NULL, 42.00, 'batatas', NULL, true),
('Batata Rosti Frango c/ Palmito', NULL, 42.00, 'batatas', NULL, true),
('Batata Rosti Frango c/ P&B', 'Frango com Palmito e Bacon', 44.00, 'batatas', NULL, true),
('Batata Rosti Bacalhau', NULL, 46.00, 'batatas', NULL, true),
('Batata Rosti Bacalhau c/ Palmito', NULL, 48.00, 'batatas', NULL, true),
('Batata Rosti Camarão', NULL, 46.00, 'batatas', NULL, true),
('Batata Rosti Camarão c/ Palmito', NULL, 48.00, 'batatas', NULL, true),




-- Porçoes
('Filé Mignon Acebolado', 'Filé na manteiga acebolado', 92.00, 'porcoes', NULL, true),
('Filé c/ Fritas ou Mandioca', 'Na manteiga, sal grosso e cebola', 115.00, 'porcoes', NULL, true),
('Filé com Catupiry', 'Flambado na manteiga, catupiry e batata palha', 117.90, 'porcoes', NULL, true),
('Filé com Gorgonzola', 'Flambado na manteiga, gorgonzola e batata palha', 126.00, 'porcoes', NULL, true),
('Filé à Moda Nordestina', 'Mandioca, bananinha empanada, vinagrete e farofa', 119.00, 'porcoes', NULL, true),
('Alcatra Acebolada', 'Alcatra acebolada flambada na manteiga', 82.90, 'porcoes', NULL, true),
('Alcatra c/ Jiló', 'Alcatra acebolada com jiló', 92.00, 'porcoes', NULL, true),
('Alcatra c/ Fritas ou Mandioca', 'Alcatra acebolada com acompanhamento', 100.00, 'porcoes', NULL, true),
('Frango Arrepiado', 'Isca empanada super crocante com parmesão', 56.90, 'porcoes', NULL, true),
('Frango Acebolado', 'Filé de frango na manteiga acebolado', 52.00, 'porcoes', NULL, true),
('Frango c/ Fritas ou Mandioca', 'Filé de frango na manteiga com acompanhamento', 65.00, 'porcoes', NULL, true),
('Frango com Catupiry', 'Filé de frango na manteiga, catupiry e batata palha', 68.00, 'porcoes', NULL, true),
('Frango com Gorgonzola', 'Filé de frango na manteiga, gorgonzola e batata palha', 72.00, 'porcoes', NULL, true),
('Carne de Panela', 'Costela ou maçã de peito', 50.00, 'porcoes', NULL, true),
('Carne de Panela c/ Batata', 'Costela ou maçã de peito com batata', 60.00, 'porcoes', NULL, true),
('Mexidão do Los', 'Arroz, feijão, bacon, ovos, linguiça, carne, cebola, alho', 42.00, 'porcoes', NULL, true),
('Torresmo de Barriga c/ Mandioca', NULL, 55.00, 'porcoes', NULL, true),
('Carne de Sol à Moda Nordestina', 'Mandioca, tomate, cebola, farofa, vinagrete e banana', 106.90, 'porcoes', NULL, true),
('Carne de Sol c/ Fritas ou Mandioca', 'Carne de sol na manteiga com acompanhamento', 95.90, 'porcoes', NULL, true),




-- Especiais
('Costelinha Outback', 'Defumada com barbecue e mandioca ou batata rústica', 89.90, 'especiais', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/especiais/costela_outback.png', true),




-- Peixes e Frutos do Mar
('Filé de Tilápia', 'Isca de tilápia empanada e frita', 56.90, 'peixes', NULL, true),
('Filé de Tilápia Especial', 'Isca de tilápia, batata frita - bem sequinha', 82.00, 'peixes', NULL, true),
('Oasis do Mar', 'Filé de tilápia com ervas finas, arroz e salada', 59.00, 'peixes', NULL, true),
('Oasis do Mar c/ Camarão', 'Tilápia, ervas, arroz, 3 camarões VM e salada', 69.00, 'peixes', NULL, true),
('Camarão Alho e Óleo', 'Camarão VM flambado no azeite com alho e ervas', 109.90, 'peixes', NULL, true),




-- Escondidinhos
('Escondidinho à Moda', 'Purê de mandioca e mussarela (Serve 2)', 68.00, 'escondidinhos', NULL, true),
('Escondidinho Camarão', 'Purê de mandioca e mussarela (Individual)', 37.00, 'escondidinhos', NULL, true),
('Escondidinho Carne de Sol', 'Purê de mandioca e mussarela (Individual)', 37.00, 'escondidinhos', NULL, true),




-- Mexicanos
('Quesadilla Filé (1 un)', 'Tortilha de trigo, salada, mussarela e bacon', 38.00, 'mexicanos', NULL, true),
('Quesadilla Filé (2 un)', 'Tortilhas de trigo, salada, mussarela e bacon', 68.00, 'mexicanos', NULL, true),
('Quesadilla Camarão (1 un)', 'Tortilha de trigo, salada, mussarela e bacon', 38.00, 'mexicanos', NULL, true),
('Quesadilla Camarão (2 un)', 'Tortilhas de trigo, salada, mussarela e bacon', 68.00, 'mexicanos', NULL, true),
('Quesadilla Frango (1 un)', 'Tortilha de trigo, salada, mussarela e bacon', 38.00, 'mexicanos', NULL, true),
('Quesadilla Frango (2 un)', 'Tortilhas de trigo, salada, mussarela e bacon', 55.00, 'mexicanos', NULL, true),
('Burritos Filé (1 un)', 'Tortilha de trigo, salada, mussarela e bacon', 38.00, 'mexicanos', NULL, true),
('Burritos Filé (2 un)', 'Tortilhas de trigo, salada, mussarela e bacon', 68.00, 'mexicanos', NULL, true),
('La Vitta Bacon (1 un)', 'Massa fina, bacon, cebola, cream cheese', 30.00, 'mexicanos', NULL, true),
('La Vitta Bacon (2 un)', 'Massa fina, bacon, cebola, cream cheese', 49.00, 'mexicanos', NULL, true),




-- Burgers
('Combo The Beatles', 'Hambúrguer + Refri mini + Fritas', 39.00, 'burgers', NULL, true),
('Hambúrguer The Beatles', 'Blend bovino 130g, bacon, queijo, cebola caramelizada', 32.00, 'burgers',  'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/burgers/burger_beatles.png', true),
('Bob Marley', NULL, 32.00, 'burgers', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/burgers/burger_bobmarley.png', true),




-- Caldos
('Caldo de Feijão', NULL, 23.90, 'caldos', NULL, true),
('Angu à Baiana', NULL, 23.90, 'caldos', NULL, true),
('Bobó de Camarão', NULL, 33.00, 'caldos', NULL, true),
('Caldo de Pinto', NULL, 23.90, 'caldos', NULL, true),




-- Pizzas
('Sertaneja Arretada', 'Carne de sol com banana-da-terra, tomate, cebola e pingos de catupiry.', 72.00, 'Pizzas', NULL, false),
('Calabroca', 'Calabresa acebolada com muçarela dourada; levemente picante.', 55.00, 'Pizzas', NULL, false),
('Dona Verde', 'Marguerita com tomate fresco, manjericão e muito amor.', 65.00, 'Pizzas', NULL, false),
('Frangolícia', 'Frango desfiado, cebola, milho, tomate com catupiry legítimo.', 75.00, 'Pizzas', NULL, false),
('Branquela Safada', 'Só queijo, pura sedução: muçarela derretida em dose dupla.', 55.00, 'Pizzas', NULL, false),
('Rainha Dos Queijos', 'Muçarela, parmesão, gorgonzola e provolone.', 75.00, 'Pizzas', NULL, false),
('Camarão Paulista', 'Camarão ao molho branco de palmito, um toque de alho.', 95.00, 'Pizzas', NULL, false),
('Camarão Mineiro', 'Camarão com bacon crocante e pingos de catupiry ao molho branco.', 98.00, 'Pizzas', NULL, false);




-- Bebidas Alcoólicas
('Gin Tônica', 'Gin, limão, tônica e gelo', 37.00, NULL, NULL, true),
('Gin Tropical', 'Gin, laranja, maracujá, tônica e gelo', 36.00, NULL, NULL, true),
('Gin Tropical c/ Tônica', NULL, 34.00, NULL, NULL, true),
('Gin Exótico', 'Gin, laranja, maracujá, energético', 38.00, NULL, NULL, true),
('Piña Colada', 'Rum, abacaxi, leite de coco e leite condensado', 30.00, NULL, NULL, true),
('Mojito', 'Rum, limão, hortelã e tônica', 26.00, NULL, NULL, true),
('Cosmopolitan', 'Vodka, limão, cranberry, licor de laranja', 27.00, NULL, NULL, true),
('Aperol Spritz', 'Aperol, espumante e laranja', 35.00, NULL, NULL, true),
('Margarita', 'Tequila, licor fino, limão e sal', 33.00, NULL, NULL, true),
('Sossega Leão', 'Frozen com 3 doses de vodka', 39.00, NULL, NULL, true),
('Caipi Frutas (Orloff)', 'Vodka e fruta a escolha', 26.00, NULL, NULL, true),
('Caipi Frutas (Absolut)', 'Vodka e fruta a escolha', 36.00, NULL, NULL, true),
('Caipirinha (Cachaça da Casa)', NULL, 22.00, NULL, NULL, true),
('Caipirinha (Seleta)', NULL, 27.00, NULL, NULL, true),
('Caipi Saquê', NULL, 26.00, NULL, NULL, true),
('Caipi Bruto', 'Jack Daniel''s, limão, açúcar e gelo', 39.00, NULL, NULL, true),
('Cerveja Brahma 600ml', NULL, 10.50, NULL, NULL, true),
('Cerveja Budweiser 600ml', NULL, 10.00, NULL, NULL, true),
('Cerveja Duplo Malte 600ml', NULL, 11.00, NULL, NULL, true),
('Cerveja Heineken 600ml', NULL, 16.00, NULL, NULL, true),
('Cerveja Spaten 600ml', NULL, 12.50, NULL, NULL, true),
('Cerveja Original 600ml', NULL, 13.50, NULL, NULL, true),
('Long Neck Corona', NULL, 11.90, NULL, NULL, true),
('Long Neck Heineken', NULL, 12.00, NULL, NULL, true),
('Combo Long Neck Budweiser', 'Preço do combo', 48.00, NULL, NULL, true),
('Combo Long Neck Heineken', 'Preço do combo', 57.00, NULL, NULL, true),
('Vinho Chilano', NULL, 60.00, NULL, NULL, true),
('Vinho Verde', NULL, 89.00, NULL, NULL, true),
('Dose Whisky Red Label', NULL, 22.00, NULL, NULL, true),
('Dose Whisky Black Label', NULL, 32.00, NULL, NULL, true),



-- Sucos
('Suco Natural de Laranja', NULL, 14.00, 'bebidas', NULL, true),
('Suco Natural de Limão', NULL, 14.00, 'bebidas', NULL, true),
('Suco Polpa de Abacaxi', NULL, 14.00, 'bebidas', NULL, true),
('Suco Polpa de Abacaxi c/ Hortelã', NULL, 14.00, 'bebidas', NULL, true),
('Suco Natural de Morango', NULL, 14.00, 'bebidas', NULL, true),
('Suco Natural de Morango c/ Maracujá', NULL, 16.00, 'bebidas', NULL, true),
('Suco Natural de Laranja c/ Morango', NULL, 16.00, 'bebidas', NULL, true),



-- Bebidas
('Água Mineral sem gás - 500ml', NULL, 4,50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/agua_sem_gas.jpg', true),
('Água Mineral com gás' - 500ml, NULL, 4,50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/agua_com_gas.jpg', true),
('Água Tônica - Lata 350ml', NULL, 8.50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/agua_tonica.jpg', true),
('Água Tônica Zero - Lata 350ml', NULL, 8.50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/agua_tonica_zero.jpg', true),
('Coca-Cola - Lata 350ml', NULL, 7.50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/coca_lata.jpg', true),
('Coca-Cola Zero - Lata 350ml', NULL, 7.50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/coca_lata_zero.jpg', true),
('Coca-Cola - Pet 600ml', NULL, 9.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/coca_600.jpg', true),
('Coca-Cola Zero - Pet 600ml', NULL, 9.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/coca_600_zero.jpg', true),
('Coca-Cola - Pet 2 litros', NULL, 16.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/coca_2_litros.jpg', true),
('Coca-Cola Zero - Pet 2 litros', NULL, 16.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/coca_2_litros_zero.jpg', true),
('Guaraná Antártica - Lata 350ml', NULL, 7.50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/guara_antartica_lata.jpg', true),
('Guaraná Antártica Zero - Lata 350ml', NULL, 7.50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/guarana_antartica_lata_zero.jpg', true),
('Guaraná Antártica - Lata 600ml', NULL, 16.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/guarana_antartica_600.jpg', true),
('Guaraná Antártica - Pet 2 litros', NULL, 16.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/guarana_antartica_2_litros.jpg', true),
('H20', NULL, 8.50, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/h2o.jpg', true),
('Energético RedBull', NULL, 14.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/redbull.jpg', true);
('Energético RedBull Tropical', NULL, 14.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/redbull_tropical.jpg', true);
('Energético Monster', NULL, 14.00, 'bebidas', 'https://bdkqoyalqrypfzwijosd.supabase.co/storage/v1/object/public/cardapio_imagens/bebidas/monster.jpg', true);