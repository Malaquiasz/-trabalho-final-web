
// URL base do back-end
const urlBase = "https://back-end-tf-web-silk.vercel.app";

// URL para placeholder de imagem
const PLACEHOLDER_IMAGE = "https://placehold.co/300x200/cccccc/666666?text=Sem+Imagem";

// Obtém elemento dos cards (container de objetos na página buscar.html)
const cardsContainer = document.querySelector(".cards-grid");

// Função para formatar data (remove hora e fica só com YYYY-MM-DD)
const formatarData = (dataISO) => {
    if (!dataISO) return 'Não informado';
    
    try {
        // Se já estiver no formato YYYY-MM-DD (sem hora)
        if (dataISO.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dataISO;
        }
        
        // Se tiver a hora completa
        if (dataISO.includes('T')) {
            return dataISO.split('T')[0];
        }
        
        // Se for uma string de data válida
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) {
            return dataISO; // Retorna o valor original se não for uma data válida
        }
        
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        
        return `${ano}-${mes}-${dia}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dataISO; // Retorna o valor original em caso de erro
    }
};

// Função para criar cards dos objetos
const criarCardObjeto = (objeto) => {
    console.log('Criando card para objeto:', objeto);
    
    // Determinar status do objeto
    const status = objeto.status || 'ativo';
    const statusClass = status === 'expirado' ? 'expirado' : status === 'expirando' ? 'expirando' : 'ativo';

    // Determinar imagem (usar foto se disponível, senão placeholder online)
    const imagemSrc = objeto.foto || PLACEHOLDER_IMAGE;
    
    // Formatar data
    const dataFormatada = formatarData(objeto.dataregistro);
    
    return `
        <article class="object-card interactive ${statusClass}" data-id="${objeto.id}">
            <figure>
                <img src="${imagemSrc}" alt="Foto de ${objeto.titulo}" loading="lazy" 
                     onerror="this.src='${PLACEHOLDER_IMAGE}'">
            </figure>
            <div class="card-info">
                <h4>${objeto.titulo}</h4>
                <p><strong>Categoria:</strong> ${objeto.categoria || 'Não especificada'}</p>
                <p><strong>Local:</strong> ${objeto.local}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                ${status === 'expirando' ? '<p class="status expirando">⚠️ Expirando em breve</p>' : ''}
                ${status === 'expirado' ? '<p class="status expirado">❌ Expirado</p>' : ''}
                <div class="card-actions">
                    <a href="detalhe.html?id=${objeto.id}" class="btn btn-primary btn-detail">
                        🔍 Ver Detalhes e Contato
                    </a>

                    <button onclick="confirmarExclusao(${objeto.id}, '${objeto.titulo}')" class="btn btn-danger">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        </article>
    `;
};

// Função para aplicar filtros de busca
const aplicarFiltrosBusca = async () => {
    const query = document.getElementById('query')?.value.toLowerCase() || '';
    const categoriaVal = document.getElementById('categoria')?.value || '';
    const localVal = document.getElementById('local')?.value || '';

    // Mostrar indicador de carregamento
    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <div class="loading">
                <p>🔄 Carregando objetos...</p>
            </div>
        `;
    }

    try {
        // Fazer requisição para obter objetos
        const response = await fetch(`${urlBase}/objetos`);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const objetos = await response.json();
        console.log('Objetos recebidos:', objetos);
        
        // Aplicar filtros
        const objetosFiltrados = objetos.filter(objeto => {
            const matchQuery = !query || 
                objeto.titulo.toLowerCase().includes(query) ||
                objeto.descricao?.toLowerCase().includes(query);
            const matchCategoria = !categoriaVal || objeto.categoria === categoriaVal;
            const matchLocal = !localVal || objeto.local === localVal;

            return matchQuery && matchCategoria && matchLocal;
        });

        // Renderizar resultados
        if (!cardsContainer) return;

        if (objetosFiltrados.length === 0) {
            cardsContainer.innerHTML = `
                <div class="no-results">
                    <p>😔 Nenhum objeto encontrado.</p>
                    <p>Tente outros termos ou verifique a ortografia.</p>
                </div>
            `;
        } else {
            cardsContainer.innerHTML = objetosFiltrados.map(criarCardObjeto).join('');
        }

        // Atualizar contador
        const contador = document.querySelector('.results-list h3');
        if (contador) {
            contador.textContent = objetosFiltrados.length === 0 
                ? 'Nenhum resultado encontrado' 
                : `Encontramos ${objetosFiltrados.length} objeto(s)`;
        }

    } catch (error) {
        console.error('Erro ao buscar objetos:', error);
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="error-message">
                    <p>❌ Erro ao carregar objetos: ${error.message}</p>
                    <button onclick="aplicarFiltrosBusca()" class="btn btn-primary">Tentar Novamente</button>
                </div>
            `;
        }
    }
};

// Função para buscar objetos por local específico (usada no index.html)
window.searchByLocation = (local) => {
    // Salvar filtro local e redirecionar
    localStorage.setItem('filtroLocal', local);
    window.location.href = 'buscar.html';
};

window.confirmarExclusao = (id, titulo) => {
    if (confirm(`⚠️ Tem certeza que deseja excluir "${titulo}"?\n\nEsta ação é irreversível!`)) {
        excluirObjeto(id);
    }
};

// Função para excluir objeto (integrada diretamente neste arquivo)
const excluirObjeto = async (id) => {
    try {
        const palavraPasse = prompt('Digite a palavra-passe para confirmar a exclusão:');
        if (!palavraPasse) {
            alert('❌ Palavra-passe é obrigatória para exclusão.');
            return;
        }

        const response = await fetch(`${urlBase}/objetos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ palavraPasse })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao excluir objeto');
        }

        alert('✅ Objeto excluído com sucesso!');
        aplicarFiltrosBusca(); // Recarregar lista
        
    } catch (error) {
        console.error('Erro ao excluir objeto:', error);
        alert(`❌ Erro ao excluir objeto: ${error.message}`);
    }
};

// Função autoexecutável para buscar e exibir objetos
(async () => {
    try {
        // Verificar se estamos na página de busca
        if (!cardsContainer) {
            console.log('⚠️ Elemento .cards-grid não encontrado. Esta página não requer listagem de objetos.');
            return;
        }

        // Inicializar carregamento
        cardsContainer.innerHTML = `
            <div class="loading">
                <p>🔄 Carregando objetos...</p>
            </div>
        `;

        // Carregar objetos iniciais
        await aplicarFiltrosBusca();

        // Configurar eventos de filtro
        const inputBusca = document.getElementById('query');
        const categoriaSelect = document.getElementById('categoria');
        const localSelect = document.getElementById('local');

        // Aplicar filtro salvo (se veio de outra página)
        const filtroSalvo = localStorage.getItem('filtroLocal');
        if (filtroSalvo && localSelect) {
            localSelect.value = filtroSalvo;
            localStorage.removeItem('filtroLocal');
            await aplicarFiltrosBusca();
        }

        // Adicionar event listeners para filtros
        if (inputBusca) {
            inputBusca.addEventListener('input', debounce(aplicarFiltrosBusca, 300));
        }

        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', aplicarFiltrosBusca);
        }

        if (localSelect) {
            localSelect.addEventListener('change', aplicarFiltrosBusca);
        }

        console.log('✅ Sistema de listagem de objetos carregado');

    } catch (error) {
        console.error('❌ Erro ao inicializar listagem de objetos:', error);
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="error-message">
                    <p>❌ Erro ao carregar a página: ${error.message}</p>
                </div>
            `;
        }
    }
})();

// Função debounce para otimizar filtros
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}