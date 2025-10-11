// =========================================================
// VARIÁVEIS GLOBAIS E INICIALIZAÇÃO
// =========================================================

const getListaObjetos = () => {
    const listaJSON = localStorage.getItem('objetosPerdidos');
    return listaJSON ? JSON.parse(listaJSON) : [];
};

const salvarListaObjetos = (lista) => {
    localStorage.setItem('objetosPerdidos', JSON.stringify(lista));
};

let objetos = getListaObjetos();

// Função para converter arquivo em Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// =========================================================
// SISTEMA DE EXPIRAÇÃO DE OBJETOS (3 MESES)
// =========================================================

const calcularDataExpiracao = () => {
    const data = new Date();
    data.setMonth(data.getMonth() + 3);
    return data.toISOString().split('T')[0];
};

const limparObjetosExpirados = () => {
    const objetosLocais = getListaObjetos();
    const hoje = new Date().toISOString().split('T')[0];
    const objetosAtualizados = objetosLocais.filter(objeto => objeto.dataExpiracao >= hoje);
    
    if (objetosLocais.length !== objetosAtualizados.length) {
        salvarListaObjetos(objetosAtualizados);
        objetos = objetosAtualizados; // Atualiza a lista global
    }
};

// =========================================================
// FUNÇÕES GLOBAIS DE UI
// =========================================================

// Funções para os indicadores de scroll
function scrollToContent() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar/ocultar indicadores de scroll baseado na posição
window.addEventListener('scroll', function() {
    const scrollDown = document.querySelector('.scroll-down');
    const scrollUp = document.querySelector('.scroll-up');
    
    if (window.scrollY > 100) {
        if (scrollDown) scrollDown.style.opacity = '0.3';
        if (scrollUp) scrollUp.style.opacity = '1';
    } else {
        if (scrollDown) scrollDown.style.opacity = '1';
        if (scrollUp) scrollUp.style.opacity = '0.3';
    }
});

// Função para busca por local
function searchByLocation(local) {
    localStorage.setItem('filtroLocal', local);
    window.location.href = 'buscar.html';
}

// Função debounce para otimizar buscas em tempo real
function debounce(func, wait) {
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

// =========================================================
// 1. REGISTRO DE OBJETOS (Página registrar.html)
// =========================================================

const configurarRegistro = () => {
    const form = document.querySelector('.registration-form');
    
    if (!form) return;

    // Configurar alteração de texto do input de arquivo
    const fileInput = document.getElementById('foto');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : 'Clique aqui para escolher uma foto';
            const labelSpan = document.querySelector('.file-upload label span');
            if (labelSpan) {
                labelSpan.textContent = fileName;
            }
        });
    }

    // Configurar campo "Outro Local"
    const localSelect = document.getElementById('local');
    if (localSelect) {
        localSelect.addEventListener('change', function() {
            const outroContainer = document.getElementById('outro-local-container');
            if (this.value === 'Outro') {
                outroContainer.style.display = 'block';
            } else {
                outroContainer.style.display = 'none';
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Captura os dados do formulário
        const titulo = document.getElementById('titulo').value;
        const categoria = document.getElementById('categoria').value;
        const descricao = document.getElementById('descricao').value;
        let local = document.getElementById('local').value;
        let contato = document.getElementById('contato').value;
        const instagram = document.getElementById('instagram').value;
        const palavraPasse = document.getElementById('palavra_passe').value;
        const fotoInput = document.getElementById('foto');
        
        // Se selecionou "Outro", pega o valor do campo de texto
        if (local === 'Outro') {
            local = document.getElementById('outro-local').value || 'Outro Local';
        }
        
        // Remove caracteres não-dígitos do contato
        contato = contato.replace(/\D/g, '');
        
        // Validação: pelo menos um método de contato deve ser preenchido (WhatsApp ou Instagram)
        if (!contato && !instagram) {
            alert('Por favor, preencha pelo menos um método de contato (WhatsApp ou Instagram).');
            return;
        }

        // Validação básica
        if (!titulo || !local || !palavraPasse) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Processar a foto
        let fotoBase64 = 'placeholder-default.jpg';
        if (fotoInput.files.length > 0) {
            const file = fotoInput.files[0];
            
            // Validar tipo do arquivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem válido.');
                return;
            }

            try {
                fotoBase64 = await fileToBase64(file);
            } catch (error) {
                console.error('Erro ao converter a imagem:', error);
                alert('Erro ao processar a imagem. Tente novamente.');
                return;
            }
        }

        // Cria o novo objeto com data de expiração (sem email)
        const novoObjeto = {
            id: Date.now(),
            titulo,
            categoria,
            descricao,
            local,
            contato,
            instagram,
            palavraPasse,
            fotoBase64,
            dataRegistro: new Date().toLocaleDateString('pt-BR'),
            dataExpiracao: calcularDataExpiracao()
        };

        // Adiciona o novo objeto à lista e salva
        objetos.push(novoObjeto);
        salvarListaObjetos(objetos);

        // Feedback visual para o usuário
        alert(`✅ Objeto "${titulo}" registrado com sucesso!\n\nSua Palavra-Passe para exclusão é: ${palavraPasse}\n\nGuarde esta senha com segurança!`);
        form.reset();
        
        // Redireciona para a busca para ver o novo item
        window.location.href = 'buscar.html';
    });
};

// =========================================================
// 2. BUSCA E LISTAGEM (Página buscar.html)
// =========================================================

const criarCardObjeto = (objeto) => {
    const imagemSrc = objeto.fotoBase64 && objeto.fotoBase64 !== 'placeholder-default.jpg' 
        ? objeto.fotoBase64 
        : 'placeholder-default.jpg';

    return `
        <article class="object-card">
            <figure>
                <img src="${imagemSrc}" alt="Foto de ${objeto.titulo}" onerror="this.src='placeholder-default.jpg'; this.alt='Imagem placeholder para ${objeto.titulo}'">
            </figure>
            <div class="card-info">
                <h4>${objeto.titulo}</h4>
                <p><strong>Categoria:</strong> ${objeto.categoria || 'Não especificada'}</p>
                <p><strong>Local:</strong> ${objeto.local}</p>
                <p><strong>Data:</strong> ${objeto.dataRegistro}</p>
                <a href="detalhe.html?id=${objeto.id}" class="btn btn-primary btn-detail">🔍 Ver Detalhes e Contato</a>
            </div>
        </article>
    `;
};

const renderizarListaObjetos = (listaFiltrada) => {
    const containerResultados = document.querySelector('.cards-grid');
    const contador = document.querySelector('.results-list h3');

    if (!containerResultados) return;

    containerResultados.innerHTML = '';

    if (listaFiltrada.length === 0) {
        containerResultados.innerHTML = `
            <div class="no-results">
                <p>😔 Nenhum objeto encontrado com estes critérios.</p>
            </div>
        `;
        if (contador) {
            contador.textContent = 'Nenhum resultado encontrado';
        }
        return;
    }

    const cardsHTML = listaFiltrada.map(criarCardObjeto).join('');
    containerResultados.innerHTML = cardsHTML;
    if (contador) {
        contador.textContent = `Encontramos ${listaFiltrada.length} objeto(s)`;
    }
};

const configurarBusca = () => {
    const formBusca = document.querySelector('.main-search-bar');
    if (!formBusca) return;

    // Função que aplica o filtro (com filtro extra de expirados)
    const aplicarFiltros = () => {
        const queryInput = document.querySelector('input[name="query"]');
        const filtroCategoria = document.getElementById('categoria');
        const filtroLocal = document.getElementById('local');
        
        if (!queryInput || !filtroCategoria || !filtroLocal) return;
        
        const query = queryInput.value.toLowerCase();
        const categoriaVal = filtroCategoria.value;
        const localVal = filtroLocal.value;
        const hoje = new Date().toISOString().split('T')[0];
        
        const resultados = objetos.filter(objeto => {
            // Filtro por expiração (não mostrar expirados)
            if (objeto.dataExpiracao < hoje) return false;
            
            // Filtro por título
            const correspondeTitulo = objeto.titulo.toLowerCase().includes(query);
            
            // Filtro por categoria
            const correspondeCategoria = !categoriaVal || objeto.categoria === categoriaVal;
            
            // Filtro por local
            const correspondeLocal = !localVal || objeto.local === localVal;
            
            return correspondeTitulo && correspondeCategoria && correspondeLocal;
        });

        renderizarListaObjetos(resultados);
    };

    // Inicializa a página de busca (aplica filtros iniciais)
    aplicarFiltros();
    
    // Configura o evento de submit do formulário
    formBusca.addEventListener('submit', (e) => {
        e.preventDefault();
        aplicarFiltros();
    });

    // Configura busca em tempo real com debounce (300ms)
    const inputBusca = document.querySelector('input[name="query"]');
    if (inputBusca) {
        const debouncedSearch = debounce(aplicarFiltros, 300);
        inputBusca.addEventListener('input', debouncedSearch);
    }

    // Configura filtros
    const filtroCategoria = document.getElementById('categoria');
    const filtroLocal = document.getElementById('local');
    
    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', aplicarFiltros);
    }
    if (filtroLocal) {
        filtroLocal.addEventListener('change', aplicarFiltros);
    }

    // Aplicar filtro de local se veio da página inicial
    const filtroSalvo = localStorage.getItem('filtroLocal');
    if (filtroSalvo && filtroLocal) {
        filtroLocal.value = filtroSalvo;
        localStorage.removeItem('filtroLocal');
        aplicarFiltros();
    }
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

    // 2. Buscar o objeto na lista (e verificar se não expirou)
    const hoje = new Date().toISOString().split('T')[0];
    const objeto = objetos.find(obj => obj.id === idObjeto && obj.dataExpiracao >= hoje);

    if (!objeto) {
        paginaDetalhe.innerHTML = `
            <div class="error-page">
                <h2>😔 Objeto Não Encontrado</h2>
                <p>Este item pode ter sido devolvido, excluído ou expirado do sistema. Tente buscar novamente.</p>
                <a href="buscar.html" class="btn btn-primary">← Voltar para a Busca</a>
            </div>
        `;
        return;
    }

    // 3. Renderizar os detalhes do objeto na tela
    const imgElement = document.getElementById('objeto-imagem'); // MUDANÇA: Targeting preciso por ID
    if (imgElement) {
        const imagemSrc = objeto.fotoBase64 && objeto.fotoBase64 !== 'placeholder-default.jpg' 
            ? objeto.fotoBase64 
            : 'placeholder-default.jpg';
        imgElement.src = imagemSrc;
        imgElement.alt = `Foto de ${objeto.titulo}`;
        
        // MUDANÇA: Fallback para erro de carregamento (evita desfiguração em Base64 falhas)
        imgElement.onerror = function() {
            this.src = 'placeholder-default.jpg';
            this.alt = 'Imagem não disponível para ' + objeto.titulo;
        };
        
        // Opcional: Listener para onload para garantir aplicação do CSS
        imgElement.onload = function() {
            this.style.opacity = '1'; // Fade in suave se quiser
        };
    }

    const tituloElement = document.querySelector('.object-details h2');
    if (tituloElement) {
        tituloElement.textContent = objeto.titulo;
    }

    const keyInfoElements = document.querySelectorAll('.key-info p');
    
    if (keyInfoElements.length >= 4) {
        keyInfoElements[0].innerHTML = `<strong>Categoria:</strong> ${objeto.categoria || 'Não Especificada'}`;
        keyInfoElements[1].innerHTML = `<strong>Local Encontrado:</strong> ${objeto.local}`;
        keyInfoElements[2].innerHTML = `<strong>Data do Registro:</strong> ${objeto.dataRegistro}`;
        keyInfoElements[3].innerHTML = `<strong>Data de Expiração:</strong> ${objeto.dataExpiracao}`;
    }

    const descricaoElement = document.querySelector('.description-section p');
    if (descricaoElement) {
        descricaoElement.textContent = objeto.descricao || 'Nenhuma descrição adicional fornecida.';
    }
    
    // 4. Configurar as Ações de Contato (sem e-mail)
    const whatsappOption = document.getElementById('whatsapp-option');
    const instagramOption = document.getElementById('instagram-option');
    
    // WhatsApp
    if (objeto.contato && whatsappOption) {
        whatsappOption.style.display = 'block';
        const mensagemPadrao = `Olá, vi o item "${objeto.titulo}" no Achados e Perdidos Local. Acredito que seja meu. Podemos combinar a devolução?`;
        const whatsappButton = document.querySelector('.contact-button');
        if (whatsappButton) {
            whatsappButton.href = `https://wa.me/55${objeto.contato}?text=${encodeURIComponent(mensagemPadrao)}`;
        }
    }
    
    // Instagram
    if (objeto.instagram && instagramOption) {
        instagramOption.style.display = 'block';
        const instagramButton = document.querySelector('.contact-instagram');
        if (instagramButton) {
            // Remove @ se existir e cria link para o perfil (usuário envia DM manualmente)
            const instagramUser = objeto.instagram.replace('@', '');
            instagramButton.href = `https://instagram.com/${instagramUser}`;
            instagramButton.target = '_blank';
            instagramButton.rel = 'noopener noreferrer';
        }
        // Atualiza o small para indicar DM
        const instagramSmall = instagramOption.querySelector('small');
        if (instagramSmall) {
            instagramSmall.textContent = 'Acesse o perfil e envie uma mensagem direta (DM)';
        }
    }

    // 5. Configurar o Formulário de Exclusão
    const formExclusao = document.querySelector('.exclusion-section form');
    if (formExclusao) {
        formExclusao.addEventListener('submit', (e) => {
            e.preventDefault();
            const senhaInput = document.querySelector('.exclusion-section input[type="password"]');
            if (!senhaInput) return;
            
            const senhaDigitada = senhaInput.value;

            if (senhaDigitada === objeto.palavraPasse) {
                if (confirm(`Tem certeza que deseja excluir o objeto "${objeto.titulo}"? Esta ação não pode ser desfeita.`)) {
                    objetos = objetos.filter(obj => obj.id !== idObjeto);
                    salvarListaObjetos(objetos);
                    alert(`✅ Objeto "${objeto.titulo}" removido com sucesso.`);
                    window.location.href = 'buscar.html';
                }
            } else {
                alert('❌ Palavra-Passe incorreta. O item não foi removido.');
            }
        });
    }
};
// =========================================================
// 4. ADMINISTRAÇÃO (Página admin.html)
// =========================================================

const configurarAdministracao = () => {
    // Credenciais de administração
    const ADMIN_CREDENTIALS = {
        username: "admin",
        password: "admin123"
    };

    // Elementos do DOM
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameInput = document.getElementById('username');

    if (!loginSection || !adminPanel || !loginForm) return;

    // Foco automático no username para melhor UX
    if (usernameInput) {
        usernameInput.focus();
    }

    // Função de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            carregarDadosAdmin();
        } else {
            alert('❌ Credenciais inválidas. Tente novamente.');
        }
    });

    // Função de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja sair do painel administrativo?')) {
                adminPanel.style.display = 'none';
                loginSection.style.display = 'block';
                loginForm.reset();
                if (usernameInput) usernameInput.focus();
            }
        });
    }

    // Função para carregar dados administrativos
    function carregarDadosAdmin() {
        const objetosLocais = getListaObjetos();
        const agora = new Date();
        const hoje = agora.toISOString().split('T')[0];
        
        // Estatísticas
        const totalObjects = objetosLocais.length;
        const expiredObjects = objetosLocais.filter(obj => obj.dataExpiracao < hoje).length;
        const expiringSoon = objetosLocais.filter(obj => {
            const diasParaExpirar = Math.ceil((new Date(obj.dataExpiracao) - agora) / (1000 * 60 * 60 * 24));
            return diasParaExpirar <= 7 && diasParaExpirar > 0;
        }).length;
        const activeObjects = totalObjects - expiredObjects;

        // Atualizar estatísticas
        const totalCount = document.getElementById('total-objects-count');
        const activeCount = document.getElementById('active-objects-count');
        const expiringCount = document.getElementById('expired-soon-count');
        const expiredCount = document.getElementById('expired-count');
        
        if (totalCount) totalCount.textContent = totalObjects;
        if (activeCount) activeCount.textContent = activeObjects;
        if (expiringCount) expiringCount.textContent = expiringSoon;
        if (expiredCount) expiredCount.textContent = expiredObjects;

        // Carregar lista de objetos (com filtros de busca e status)
        renderizarListaAdmin(objetosLocais);
    }

    // Função para renderizar lista de objetos no admin (com busca e filtro de status)
    function renderizarListaAdmin(objetos) {
        const objectsList = document.getElementById('objects-list');
        const adminSearch = document.getElementById('admin-search');
        const adminFilterStatus = document.getElementById('admin-filter-status');
        const agora = new Date();
        const hoje = agora.toISOString().split('T')[0];

        if (!objectsList) return;

        // Função para filtrar e renderizar
        const filtrarERenderizar = () => {
            let listaFiltrada = objetos;

            // Filtro por busca
            if (adminSearch && adminSearch.value) {
                const termo = adminSearch.value.toLowerCase();
                listaFiltrada = listaFiltrada.filter(obj => 
                    obj.titulo.toLowerCase().includes(termo) ||
                    obj.categoria.toLowerCase().includes(termo) ||
                    obj.local.toLowerCase().includes(termo)
                );
            }

            // Filtro por status
            if (adminFilterStatus && adminFilterStatus.value) {
                const status = adminFilterStatus.value;
                if (status === 'active') {
                    listaFiltrada = listaFiltrada.filter(obj => obj.dataExpiracao >= hoje);
                } else if (status === 'expired') {
                    listaFiltrada = listaFiltrada.filter(obj => obj.dataExpiracao < hoje);
                } else if (status === 'expiring') {
                    const diasParaExpirar = Math.ceil((new Date(obj.dataExpiracao) - agora) / (1000 * 60 * 60 * 24));
                    listaFiltrada = listaFiltrada.filter(obj => diasParaExpirar <= 7 && diasParaExpirar > 0);
                }
            }

            if (listaFiltrada.length === 0) {
                objectsList.innerHTML = '<div class="no-objects">Nenhum objeto encontrado com estes critérios.</div>';
                return;
            }

            const objetosHTML = listaFiltrada.map(objeto => {
                const dataExpiracao = new Date(objeto.dataExpiracao);
                const diasRestantes = Math.ceil((dataExpiracao - agora) / (1000 * 60 * 60 * 24));
                const statusClass = objeto.dataExpiracao < hoje ? 'expirado' : diasRestantes <= 7 ? 'expirando' : 'ativo';
                
                // Informações de contato para exibir no admin
                const contatos = [];
                if (objeto.contato) contatos.push('WhatsApp');
                if (objeto.instagram) contatos.push('Instagram');
                
                return `
                    <div class="object-admin-card ${statusClass}">
                        <div class="object-admin-image">
                            <img src="${objeto.fotoBase64 || 'placeholder-default.jpg'}" alt="Foto de ${objeto.titulo}" onerror="this.src='placeholder-default.jpg'; this.alt='Imagem placeholder para ${objeto.titulo}'">
                        </div>
                        <div class="object-admin-info">
                            <h4>${objeto.titulo}</h4>
                            <p><strong>Categoria:</strong> ${objeto.categoria || 'Não especificada'}</p>
                            <p><strong>Local:</strong> ${objeto.local}</p>
                            <p><strong>Contatos:</strong> ${contatos.join(', ') || 'Nenhum'}</p>
                            <p><strong>Registrado em:</strong> ${objeto.dataRegistro}</p>
                            <p><strong>Expira em:</strong> ${objeto.dataExpiracao}</p>
                            <p class="status ${statusClass}">
                                ${statusClass === 'expirado' ? '❌ Expirado' : statusClass === 'expirando' ? '⚠️ Expira em ' + diasRestantes + ' dias' : '✅ Ativo'}
                            </p>
                        </div>
                        <div class="object-admin-actions">
                            <button onclick="excluirObjetoAdmin(${objeto.id})" class="btn btn-danger btn-small">🗑️ Excluir</button>
                            <button onclick="verDetalhesObjeto(${objeto.id})" class="btn btn-primary btn-small">👀 Ver Detalhes</button>
                        </div>
                    </div>
                `;
            }).join('');

            objectsList.innerHTML = objetosHTML;
        };

        // Render inicial
        filtrarERenderizar();

        // Eventos para busca e filtro
        if (adminSearch) {
            const debouncedAdminSearch = debounce(filtrarERenderizar, 300);
            adminSearch.addEventListener('input', debouncedAdminSearch);
        }
        if (adminFilterStatus) {
            adminFilterStatus.addEventListener('change', filtrarERenderizar);
        }
    }

    // Função para excluir objeto (admin)
    window.excluirObjetoAdmin = function(id) {
        if (confirm('Tem certeza que deseja excluir permanentemente este objeto?')) {
            let objetosLocais = getListaObjetos();
            objetosLocais = objetosLocais.filter(obj => obj.id !== id);
            salvarListaObjetos(objetosLocais);
            objetos = objetosLocais; // Atualiza global
            carregarDadosAdmin();
            alert('✅ Objeto excluído com sucesso!');
        }
    };

    // Função para ver detalhes do objeto
    window.verDetalhesObjeto = function(id) {
        window.open(`detalhe.html?id=${id}`, '_blank');
    };

    // Botão para limpar objetos expirados
    const cleanExpiredBtn = document.getElementById('clean-expired-btn');
    if (cleanExpiredBtn) {
        cleanExpiredBtn.addEventListener('click', function() {
            if (confirm('Esta ação removerá permanentemente todos os objetos expirados. Continuar?')) {
                const hoje = new Date().toISOString().split('T')[0];
                let objetosLocais = getListaObjetos();
                const objetosAntigos = objetosLocais.length;
                objetosLocais = objetosLocais.filter(obj => obj.dataExpiracao >= hoje);
                const objetosRemovidos = objetosAntigos - objetosLocais.length;
                
                salvarListaObjetos(objetosLocais);
                objetos = objetosLocais; // Atualiza global
                carregarDadosAdmin();
                alert(`✅ ${objetosRemovidos} objetos expirados foram removidos!`);
            }
        });
    }

    // Botão para exportar dados
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            const objetosLocais = getListaObjetos();
            const dataStr = JSON.stringify(objetosLocais, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup-objetos-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('📥 Backup exportado com sucesso!');
        });
    }

    // Botão para atualizar dados
    const refreshDataBtn = document.getElementById('refresh-data-btn');
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', carregarDadosAdmin);
    }
};

// =========================================================
// INICIALIZAÇÃO GERAL
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    const caminho = window.location.pathname;

    // Executar limpeza de objetos expirados em todas as páginas
    limparObjetosExpirados();

    // Configurar funcionalidades específicas de cada página
    if (caminho.includes('registrar.html')) {
        configurarRegistro();
    } else if (caminho.includes('buscar.html')) {
        configurarBusca();
    } else if (caminho.includes('detalhe.html')) {
        configurarDetalheEExclusao();
    } else if (caminho.includes('admin.html')) {
        configurarAdministracao();
    }
    // Para index.html e sobre.html, apenas as funções globais de scroll são usadas
});