// =========================================================
// VARIÁVEIS GLOBAIS E INICIALIZAÇÃO
// =========================================================

// Função para obter a lista de objetos do LocalStorage (simula um banco de dados)
// Se não houver nada, retorna um array vazio.
const getListaObjetos = () => {
    const listaJSON = localStorage.getItem('objetosPerdidos');
    return listaJSON ? JSON.parse(listaJSON) : [];
};

// Função para salvar a lista atualizada no LocalStorage
const salvarListaObjetos = (lista) => {
    localStorage.setItem('objetosPerdidos', JSON.stringify(lista));
};

// Array principal onde os objetos serão armazenados
let objetos = getListaObjetos();

// =========================================================
// 1. REGISTRO DE OBJETOS (Página registrar.html)
// =========================================================

const configurarRegistro = () => {
    const form = document.querySelector('.registration-form');
    
    // Verifica se o formulário existe na página atual (registrar.html)
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio tradicional do formulário

        // Captura os dados do formulário
        const titulo = document.getElementById('titulo').value;
        const palavrasChave = document.getElementById('palavras_chave').value;
        const descricao = document.getElementById('descricao').value;
        const local = document.getElementById('local').value;
        const contato = document.getElementById('contato').value;
        const palavraPasse = document.getElementById('palavra_passe').value;
        const fotoInput = document.getElementById('foto');
        
        // Simulação de URL da foto (em um projeto real, você usaria File Reader ou enviaria para um servidor)
        let fotoURL = 'placeholder-default.jpg'; 
        if (fotoInput.files.length > 0) {
            // Em um ambiente real, esta URL seria o endereço do servidor
            fotoURL = URL.createObjectURL(fotoInput.files[0]);
        }

        // Cria o novo objeto
        const novoObjeto = {
            id: Date.now(), // ID único baseado no timestamp
            titulo,
            palavrasChave,
            descricao,
            local,
            contato,
            palavraPasse, // Palavra-passe para exclusão
            fotoURL,
            dataRegistro: new Date().toLocaleDateString('pt-BR')
        };

        // Adiciona o novo objeto à lista e salva
        objetos.push(novoObjeto);
        salvarListaObjetos(objetos);

        // Feedback visual para o usuário
        alert(`Objeto "${titulo}" registrado com sucesso! Sua Palavra-Passe para exclusão é: ${palavraPasse}`);
        form.reset();
        
        // Redireciona para a busca para ver o novo item
        window.location.href = 'buscar.html'; 
    });
};


// =========================================================
// 2. BUSCA E LISTAGEM (Página buscar.html)
// =========================================================

const criarCardObjeto = (objeto) => {
    // Função para gerar o HTML de um único card
    return `
        <article class="object-card">
            <figure>
                <img src="${objeto.fotoURL}" alt="Foto de ${objeto.titulo}">
            </figure>
            <div class="card-info">
                <h4>${objeto.titulo}</h4>
                <p><strong>Local:</strong> ${objeto.local}</p>
                <p><strong>Data:</strong> ${objeto.dataRegistro}</p>
                <a href="detalhe.html?id=${objeto.id}" class="btn btn-primary btn-detail">Ver Detalhes</a>
            </div>
        </article>
    `;
};

const renderizarListaObjetos = (listaFiltrada) => {
    const containerResultados = document.querySelector('.cards-grid');
    const contador = document.querySelector('.results-list h3');

    if (!containerResultados) return; // Garante que estamos na página de busca

    containerResultados.innerHTML = ''; // Limpa os resultados anteriores

    if (listaFiltrada.length === 0) {
        containerResultados.innerHTML = '<p class="no-results">Nenhum objeto encontrado com este critério.</p>';
        contador.textContent = 'Resultados Encontrados (0)';
        return;
    }

    const cardsHTML = listaFiltrada.map(criarCardObjeto).join('');
    containerResultados.innerHTML = cardsHTML;
    contador.textContent = `Resultados Encontrados (${listaFiltrada.length})`;
};

const configurarBusca = () => {
    const formBusca = document.querySelector('.main-search-bar');
    if (!formBusca) return;

    // Função que aplica o filtro
    const aplicarFiltros = () => {
        const query = document.querySelector('input[name="query"]').value.toLowerCase();
        
        const resultados = objetos.filter(objeto => {
            // Filtra por Título, Local ou Palavras-Chave
            const termoBusca = `${objeto.titulo} ${objeto.local} ${objeto.palavrasChave}`.toLowerCase();
            return termoBusca.includes(query);
        });

        renderizarListaObjetos(resultados);
    };

    // Inicializa a página de busca exibindo todos os objetos
    renderizarListaObjetos(objetos);
    
    // Configura o evento de submit do formulário
    formBusca.addEventListener('submit', (e) => {
        e.preventDefault();
        aplicarFiltros();
    });
};


// =========================================================
// 3. DETALHE DO OBJETO E EXCLUSÃO (Página detalhe.html)
// =========================================================

const configurarDetalheEExclusao = () => {
    const paginaDetalhe = document.querySelector('.object-detail-page');
    if (!paginaDetalhe) return;

    // 1. Obter o ID do objeto da URL (?id=123)
    const params = new URLSearchParams(window.location.search);
    const idObjeto = parseInt(params.get('id'));

    // 2. Buscar o objeto na lista
    const objeto = objetos.find(obj => obj.id === idObjeto);

    if (!objeto) {
        paginaDetalhe.innerHTML = '<h2>Objeto Não Encontrado</h2><p>Este item pode ter sido devolvido ou excluído.</p><a href="buscar.html" class="btn btn-primary">Voltar para a Busca</a>';
        return;
    }

    // 3. Renderizar os detalhes do objeto na tela
    document.querySelector('.object-media img').src = objeto.fotoURL;
    document.querySelector('.object-details h2').textContent = objeto.titulo;
    document.querySelector('.key-info p:nth-child(1)').innerHTML = `<strong>Palavras-Chave:</strong> ${objeto.palavrasChave}`;
    document.querySelector('.key-info p:nth-child(2)').innerHTML = `<strong>Local Encontrado:</strong> ${objeto.local}`;
    document.querySelector('.key-info p:nth-child(3)').innerHTML = `<strong>Data do Registro:</strong> ${objeto.dataRegistro}`;
    document.querySelector('.description-section p').textContent = objeto.descricao || 'Nenhuma descrição adicional fornecida.';
    
    // 4. Configurar a Ação de Contato (Simulada para WhatsApp)
    const contatoButton = document.querySelector('.contact-button');
    const mensagemPadrao = encodeURIComponent(`Olá, vi o item "${objeto.titulo}" no Achados e Perdidos Local (ID ${objeto.id}). Acredito que seja meu. Podemos combinar a devolução?`);
    // Em um projeto real, você faria uma requisição ao servidor para obter o contato mediado
    contatoButton.href = `https://wa.me/55${objeto.contato.replace(/\D/g, '')}?text=${mensagemPadrao}`;


    // 5. Configurar o Formulário de Exclusão
    const formExclusao = document.querySelector('.exclusion-section form');
    if (formExclusao) {
        formExclusao.addEventListener('submit', (e) => {
            e.preventDefault();
            const senhaDigitada = document.querySelector('input[type="password"]').value;

            if (senhaDigitada === objeto.palavraPasse) {
                // Filtra o array, removendo o objeto com o ID correspondente
                objetos = objetos.filter(obj => obj.id !== idObjeto);
                salvarListaObjetos(objetos);
                alert(`Objeto "${objeto.titulo}" removido com sucesso.`);
                window.location.href = 'buscar.html'; // Redireciona
            } else {
                alert('Palavra-Passe incorreta. O item não foi removido.');
            }
        });
    }
};

// =========================================================
// INICIALIZAÇÃO GERAL
// =========================================================

// Esta função verifica qual página está sendo carregada e executa o código JS específico
document.addEventListener('DOMContentLoaded', () => {
    const caminho = window.location.pathname;

    if (caminho.includes('registrar.html')) {
        configurarRegistro();
    } else if (caminho.includes('buscar.html')) {
        configurarBusca();
    } else if (caminho.includes('detalhe.html')) {
        configurarDetalheEExclusao();
    }
    // As páginas index.html e sobre.html não precisam de JS específico por enquanto
});