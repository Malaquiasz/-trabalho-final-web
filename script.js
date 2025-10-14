// =========================================================
// VARIÁVEIS GLOBAIS E INICIALIZAÇÃO (Otimizadas)
// =========================================================

const OBJETOS_KEY = 'objetosPerdidos';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

// Cache de elementos DOM frequentemente acessados
const domCache = new Map();

const getElement = (selector) => {
    if (!domCache.has(selector)) {
        domCache.set(selector, document.querySelector(selector));
    }
    return domCache.get(selector);
};

const getListaObjetos = () => {
    try {
        const listaJSON = localStorage.getItem(OBJETOS_KEY);
        return listaJSON ? JSON.parse(listaJSON) : [];
    } catch (error) {
        console.error('Erro ao carregar objetos:', error);
        return [];
    }
};

const salvarListaObjetos = (lista) => {
    try {
        localStorage.setItem(OBJETOS_KEY, JSON.stringify(lista));
        return true;
    } catch (error) {
        console.error('Erro ao salvar objetos:', error);
        return false;
    }
};

// =========================================================
// UTILITÁRIOS DE PERFORMANCE (Otimizados)
// =========================================================

const debounce = (func, wait = 300, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
};

const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const isMobile = () => window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// =========================================================
// SISTEMA DE EXPIRAÇÃO (Otimizado)
// =========================================================

const calcularDataExpiracao = (meses = 3) => {
    const data = new Date();
    data.setMonth(data.getMonth() + meses);
    return data.toISOString().split('T')[0];
};

const getStatusObjeto = (dataExpiracao) => {
    const hoje = new Date().toISOString().split('T')[0];
    if (dataExpiracao < hoje) return 'expirado';
    
    const diasRestantes = Math.ceil((new Date(dataExpiracao) - new Date()) / (86400000));
    return diasRestantes <= 7 ? 'expirando' : 'ativo';
};

const limparObjetosExpirados = () => {
    const objetos = getListaObjetos();
    const hoje = new Date().toISOString().split('T')[0];
    const objetosAtivos = objetos.filter(objeto => objeto.dataExpiracao >= hoje);
    
    if (objetos.length !== objetosAtivos.length) {
        salvarListaObjetos(objetosAtivos);
        return objetosAtivos;
    }
    return objetos;
};

// =========================================================
// FUNÇÕES DE SCROLL (Redesenhadas)
// =========================================================

const scrollGradual = (direcao = 'down', pixels = 500) => {
    const currentPosition = window.pageYOffset;
    const targetPosition = direcao === 'down' ? currentPosition + pixels : Math.max(0, currentPosition - pixels);
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
};

const scrollGradualUp = () => scrollGradual('up', 500);
const scrollGradualDown = () => scrollGradual('down', 500);

// =========================================================
// SISTEMA DE ARQUIVOS (Otimizado)
// =========================================================

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Arquivo de imagem inválido'));
            return;
        }

        // Limitar tamanho do arquivo (2MB)
        if (file.size > 2 * 1024 * 1024) {
            reject(new Error('Imagem muito grande. Máximo: 2MB'));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    });
};

// =========================================================
// 1. REGISTRO DE OBJETOS (Otimizado)
// =========================================================

const configurarRegistro = () => {
    const form = getElement('.registration-form');
    if (!form) return;

    // Configuração de eventos otimizada
    const configurarEventos = () => {
        const fileInput = getElement('#foto');
        const localSelect = getElement('#local');
        const outroLocalContainer = getElement('#outro-local-container');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const fileName = e.target.files[0]?.name || 'Clique aqui para escolher uma foto';
                const labelSpan = getElement('.file-upload label span');
                if (labelSpan) labelSpan.textContent = fileName;
            });
        }

        if (localSelect && outroLocalContainer) {
            localSelect.addEventListener('change', debounce(() => {
                outroLocalContainer.style.display = localSelect.value === 'Outro' ? 'block' : 'none';
            }));
        }
    };

    const validarFormulario = (dados) => {
        const erros = [];

        if (!dados.titulo?.trim()) erros.push('Título é obrigatório');
        if (!dados.local?.trim()) erros.push('Local é obrigatório');
        if (!dados.palavraPasse?.trim()) erros.push('Palavra-passe é obrigatória');
        if (!dados.contato && !dados.instagram) erros.push('Pelo menos um método de contato é necessário');
        if (dados.palavraPasse && dados.palavraPasse.length < 4) erros.push('Palavra-passe deve ter pelo menos 4 caracteres');

        return erros;
    };

    const processarEnvio = async (e) => {
        e.preventDefault();
        const botaoEnviar = getElement('button[type="submit"]');
        
        try {
            // Desativar botão durante processamento
            if (botaoEnviar) {
                botaoEnviar.disabled = true;
                botaoEnviar.textContent = 'Processando...';
            }

            // Coletar dados do formulário
            const dados = {
                titulo: getElement('#titulo')?.value?.trim(),
                categoria: getElement('#categoria')?.value,
                descricao: getElement('#descricao')?.value?.trim(),
                local: getElement('#local')?.value === 'Outro'
                    ? (getElement('#outro-local')?.value?.trim() || 'Outro Local')
                    : getElement('#local')?.value,
                contato: getElement('#contato')?.value?.replace(/\D/g, ''),
                instagram: getElement('#instagram')?.value?.trim(),
                palavraPasse: getElement('#palavra_passe')?.value,
                fotoInput: getElement('#foto')
            };

            // Validação
            const erros = validarFormulario(dados);
            if (erros.length > 0) {
                alert(`❌ Erros no formulário:\n• ${erros.join('\n• ')}`);
                return;
            }

            // Processar imagem
            let fotoBase64 = 'placeholder-default.jpg';
            if (dados.fotoInput?.files[0]) {
                try {
                    fotoBase64 = await fileToBase64(dados.fotoInput.files[0]);
                } catch (error) {
                    alert(`❌ Erro na imagem: ${error.message}`);
                    return;
                }
            }

            // Criar objeto
            const novoObjeto = {
                id: Date.now(),
                ...dados,
                fotoBase64,
                dataRegistro: new Date().toLocaleDateString('pt-BR'),
                dataExpiracao: calcularDataExpiracao()
            };

            delete novoObjeto.fotoInput;

            // Salvar
            const objetos = getListaObjetos();
            objetos.push(novoObjeto);
            
            if (salvarListaObjetos(objetos)) {
                alert(`✅ Objeto "${novoObjeto.titulo}" registrado!\n\n🔑 Palavra-Passe: ${novoObjeto.palavraPasse}\n\n⚠️ Guarde esta senha para remover o objeto depois!`);
                form.reset();
                window.location.href = 'buscar.html';
            } else {
                throw new Error('Erro ao salvar no armazenamento local');
            }

        } catch (error) {
            console.error('Erro no registro:', error);
            alert('❌ Erro ao registrar objeto. Tente novamente.');
        } finally {
            // Reativar botão
            if (botaoEnviar) {
                botaoEnviar.disabled = false;
                botaoEnviar.textContent = '📝 Registrar Objeto Encontrado';
            }
        }
    };

    configurarEventos();
    form.addEventListener('submit', processarEnvio);
};

// =========================================================
// 2. BUSCA E FILTROS (Otimizado)
// =========================================================

const criarCardObjeto = (objeto) => {
    const status = getStatusObjeto(objeto.dataExpiracao);
    const imagemSrc = objeto.fotoBase64 && objeto.fotoBase64 !== 'placeholder-default.jpg' 
        ? objeto.fotoBase64 
        : 'placeholder-default.jpg';
    
    const statusClass = status === 'expirado' ? 'expirado' : status === 'expirando' ? 'expirando' : '';

    return `
        <article class="object-card interactive ${statusClass}" data-id="${objeto.id}">
            <figure>
                <img src="${imagemSrc}" alt="Foto de ${objeto.titulo}" loading="lazy" 
                     onerror="this.src='placeholder-default.jpg'">
            </figure>
            <div class="card-info">
                <h4>${objeto.titulo}</h4>
                <p><strong>Categoria:</strong> ${objeto.categoria || 'Não especificada'}</p>
                <p><strong>Local:</strong> ${objeto.local}</p>
                <p><strong>Data:</strong> ${objeto.dataRegistro}</p>
                ${status === 'expirando' ? '<p class="status expirando">⚠️ Expirando em breve</p>' : ''}
                <a href="detalhe.html?id=${objeto.id}" class="btn btn-primary btn-detail">
                    🔍 Ver Detalhes e Contato
                </a>
            </div>
        </article>
    `;
};

const aplicarFiltrosBusca = () => {
    const query = getElement('input[name="query"]')?.value.toLowerCase() || '';
    const categoriaVal = getElement('#categoria')?.value || '';
    const localVal = getElement('#local')?.value || '';
    const container = getElement('.cards-grid');
    
    if (!container) return;

    const objetos = getListaObjetos();
    const hoje = new Date().toISOString().split('T')[0];

    const resultados = objetos.filter(objeto => {
        // Filtro de expiração
        if (objeto.dataExpiracao < hoje) return false;
        
        // Filtro de busca
        const matchQuery = !query || objeto.titulo.toLowerCase().includes(query) || 
                          objeto.descricao?.toLowerCase().includes(query);
        const matchCategoria = !categoriaVal || objeto.categoria === categoriaVal;
        const matchLocal = !localVal || objeto.local === localVal;

        return matchQuery && matchCategoria && matchLocal;
    });

    // Renderização otimizada
    if (resultados.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>😔 Nenhum objeto encontrado.</p>
                <p>Tente outros termos ou verifique a ortografia.</p>
            </div>
        `;
    } else {
        container.innerHTML = resultados.map(criarCardObjeto).join('');
    }

    // Atualizar contador
    const contador = getElement('.results-list h3');
    if (contador) {
        contador.textContent = resultados.length === 0 
            ? 'Nenhum resultado encontrado' 
            : `Encontramos ${resultados.length} objeto(s)`;
    }
};

const configurarBusca = () => {
    // Aplicar filtros iniciais
    aplicarFiltrosBusca();

    // Configurar eventos com debounce
    const inputBusca = getElement('input[name="query"]');
    const categoriaSelect = getElement('#categoria');
    const localSelect = getElement('#local');

    if (inputBusca) {
        inputBusca.addEventListener('input', debounce(aplicarFiltrosBusca, 300));
    }

    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', debounce(aplicarFiltrosBusca, 200));
    }

    if (localSelect) {
        localSelect.addEventListener('change', debounce(aplicarFiltrosBusca, 200));
    }

    // Aplicar filtro salvo
    const filtroSalvo = localStorage.getItem('filtroLocal');
    if (filtroSalvo && localSelect) {
        localSelect.value = filtroSalvo;
        localStorage.removeItem('filtroLocal');
        aplicarFiltrosBusca();
    }
};

// =========================================================
// 3. DETALHES E EXCLUSÃO (Otimizado)
// =========================================================

const configurarDetalheEExclusao = () => {
    const params = new URLSearchParams(window.location.search);
    const idObjeto = parseInt(params.get('id'));
    
    if (!idObjeto) {
        mostrarErroDetalhe('ID do objeto não especificado');
        return;
    }

    const objetos = getListaObjetos();
    const objeto = objetos.find(obj => obj.id === idObjeto);

    if (!objeto) {
        mostrarErroDetalhe('Objeto não encontrado ou já foi removido');
        return;
    }

    // Verificar expiração
    const status = getStatusObjeto(objeto.dataExpiracao);
    if (status === 'expirado') {
        mostrarErroDetalhe('Este objeto expirou e não está mais disponível');
        return;
    }

    renderizarDetalhesObjeto(objeto);
    configurarExclusao(objeto);
    configurarDenuncia(objeto);
};

const mostrarErroDetalhe = (mensagem) => {
    const pagina = getElement('.object-detail-page');
    if (pagina) {
        pagina.innerHTML = `
            <div class="error-page">
                <h2>😔 Objeto Não Encontrado</h2>
                <p>${mensagem}</p>
                <a href="buscar.html" class="btn btn-primary">← Voltar para a Busca</a>
            </div>
        `;
    }
};

const renderizarDetalhesObjeto = (objeto) => {
    // Atualizar elementos da página
    const mapeamentoElementos = {
        '#objeto-imagem': { src: objeto.fotoBase64 || 'placeholder-default.jpg' },
        '#detalhes-objeto': { textContent: objeto.titulo },
        '#categoria-info': { innerHTML: `<strong>Categoria:</strong> ${objeto.categoria || 'Não Especificada'}` },
        '#local-info': { innerHTML: `<strong>Local Encontrado:</strong> ${objeto.local}` },
        '#data-registro-info': { innerHTML: `<strong>Data do Registro:</strong> ${objeto.dataRegistro}` },
        '#data-expiracao-info': { innerHTML: `<strong>Data de Expiração:</strong> ${objeto.dataExpiracao}` },
        '#descricao-info': { textContent: objeto.descricao || 'Nenhuma descrição adicional fornecida.' }
    };

    Object.entries(mapeamentoElementos).forEach(([seletor, propriedades]) => {
        const elemento = getElement(seletor);
        if (elemento) {
            Object.assign(elemento, propriedades);
        }
    });

    configurarContatos(objeto);
};

const configurarContatos = (objeto) => {
    const whatsappOption = getElement('#whatsapp-option');
    const instagramOption = getElement('#instagram-option');

    // WhatsApp
    if (objeto.contato && whatsappOption) {
        whatsappOption.style.display = 'block';
        const mensagem = encodeURIComponent(
            `Olá! Vi o item "${objeto.titulo}" no Achados e Perdidos Local e acredito que seja meu. ` +
            `Podemos combinar a devolução? Obrigado!`
        );
        const linkWhatsApp = getElement('.contact-button');
        if (linkWhatsApp) {
            linkWhatsApp.href = `https://wa.me/55${objeto.contato}?text=${mensagem}`;
        }
    }

    // Instagram
    if (objeto.instagram && instagramOption) {
        instagramOption.style.display = 'block';
        const instagramUser = objeto.instagram.replace('@', '');
        const linkInstagram = getElement('.contact-instagram');
        if (linkInstagram) {
            linkInstagram.href = `https://instagram.com/${instagramUser}`;
        }
    }
};

const configurarExclusao = (objeto) => {
    const formExclusao = getElement('#exclusao-form');
    if (!formExclusao) return;

    formExclusao.addEventListener('submit', (e) => {
        e.preventDefault();

        const senhaDigitada = getElement('#senha-exclusao')?.value;
        if (!senhaDigitada) {
            alert('❌ Digite a palavra-passe para excluir');
            return;
        }

        if (senhaDigitada === objeto.palavraPasse) {
            if (confirm(`⚠️ Tem certeza que deseja excluir "${objeto.titulo}"?\n\nEsta ação é irreversível!`)) {
                const objetos = getListaObjetos();
                const objetosAtualizados = objetos.filter(obj => obj.id !== objeto.id);

                if (salvarListaObjetos(objetosAtualizados)) {
                    alert(`✅ "${objeto.titulo}" removido com sucesso!`);
                    window.location.href = 'buscar.html';
                } else {
                    alert('❌ Erro ao remover objeto. Tente novamente.');
                }
            }
        } else {
            alert('❌ Palavra-passe incorreta. Tente novamente.');
            getElement('#senha-exclusao').value = '';
            getElement('#senha-exclusao').focus();
        }
    });
};

const configurarDenuncia = (objeto) => {
    const formDenuncia = getElement('#report-form');
    if (!formDenuncia) return;

    const reportReasonSelect = getElement('#report-reason');
    const otherReasonContainer = getElement('#other-reason-container');

    if (reportReasonSelect && otherReasonContainer) {
        reportReasonSelect.addEventListener('change', () => {
            otherReasonContainer.style.display = reportReasonSelect.value === 'outro' ? 'block' : 'none';
        });
    }

    formDenuncia.addEventListener('submit', (e) => {
        e.preventDefault();

        const motivo = reportReasonSelect?.value;
        const outroMotivo = getElement('#other-reason')?.value?.trim();

        if (!motivo) {
            alert('❌ Selecione um motivo para a denúncia.');
            return;
        }

        if (motivo === 'outro' && !outroMotivo) {
            alert('❌ Descreva o motivo da denúncia.');
            return;
        }

        const motivoFinal = motivo === 'outro' ? outroMotivo : motivo;

        // Verificar se já existe denúncia pendente para este objeto
        const denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]');
        const denunciasPendentes = denuncias.filter(d =>
            d.objetoId === objeto.id && d.status === 'pendente'
        );

        if (denunciasPendentes.length > 0) {
            alert(`⚠️ Já existe uma denúncia pendente para este objeto.\n\nMotivo da denúncia existente: ${denunciasPendentes[0].motivo}\n\nA administração analisará a denúncia em breve.`);
            return;
        }

        // Salvar nova denúncia
        denuncias.push({
            id: Date.now(),
            objetoId: objeto.id,
            titulo: objeto.titulo,
            motivo: motivoFinal,
            dataDenuncia: new Date().toISOString(),
            status: 'pendente'
        });

        localStorage.setItem('denuncias', JSON.stringify(denuncias));

        alert(`✅ Denúncia enviada com sucesso!\n\nMotivo: ${motivoFinal}\n\nA administração analisará a denúncia em breve.`);
        formDenuncia.reset();
        otherReasonContainer.style.display = 'none';
    });
};



// =========================================================
// 4. ADMINISTRAÇÃO (Otimizado)
// =========================================================

const configurarAdministracao = () => {
    configurarLoginAdmin();
    configurarPainelAdmin();
};

const configurarLoginAdmin = () => {
    const loginForm = getElement('#login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = getElement('#username')?.value;
        const password = getElement('#password')?.value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            getElement('#login-section').style.display = 'none';
            getElement('#admin-panel').style.display = 'block';
            carregarDadosAdmin();
        } else {
            alert('❌ Credenciais inválidas. Tente novamente.');
            getElement('#password').value = '';
            getElement('#password').focus();
        }
    });
};

const configurarPainelAdmin = () => {
    const logoutBtn = getElement('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Deseja sair do painel administrativo?')) {
                getElement('#admin-panel').style.display = 'none';
                getElement('#login-section').style.display = 'block';
                getElement('#login-form').reset();
            }
        });
    }

    // Configurar botões de ação
    const botoesAcao = {
        '#clean-expired-btn': limparObjetosExpiradosAdmin,
        '#export-data-btn': exportarDadosAdmin,
        '#refresh-data-btn': carregarDadosAdmin
    };

    Object.entries(botoesAcao).forEach(([seletor, funcao]) => {
        const botao = getElement(seletor);
        if (botao) {
            botao.addEventListener('click', funcao);
        }
    });

    // Configurar filtros administrativos para objetos
    const searchInput = getElement('#admin-search');
    const statusFilter = getElement('#admin-filter-status');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => renderizarListaAdmin(), 300));
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => renderizarListaAdmin());
    }

    // Configurar filtros administrativos para denúncias
    const reportsSearchInput = getElement('#reports-search');
    const reportsStatusFilter = getElement('#reports-filter-status');

    if (reportsSearchInput) {
        reportsSearchInput.addEventListener('input', debounce(() => renderizarListaDenunciasAdmin(), 300));
    }

    if (reportsStatusFilter) {
        reportsStatusFilter.addEventListener('change', () => renderizarListaDenunciasAdmin());
    }
};

const carregarDadosAdmin = () => {
    const objetos = getListaObjetos();
    const denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]');
    const hoje = new Date().toISOString().split('T')[0];

    const estatisticas = objetos.reduce((acc, obj) => {
        const status = getStatusObjeto(obj.dataExpiracao);
        acc.total++;
        if (status === 'ativo') acc.ativos++;
        if (status === 'expirando') acc.expirando++;
        if (status === 'expirado') acc.expirados++;
        return acc;
    }, { total: 0, ativos: 0, expirando: 0, expirados: 0 });

    // Adicionar estatísticas de denúncias
    estatisticas.denunciasPendente = denuncias.filter(d => d.status === 'pendente').length;
    estatisticas.denunciasAnalisada = denuncias.filter(d => d.status === 'analisada').length;
    estatisticas.denunciasResolvida = denuncias.filter(d => d.status === 'resolvida').length;

    // Atualizar badge de denúncias no menu
    atualizarBadgeDenuncias(estatisticas.denunciasPendente);

    // Atualizar estatísticas
    const elementosEstatisticas = {
        '#total-objects-count': estatisticas.total,
        '#active-objects-count': estatisticas.ativos,
        '#expired-soon-count': estatisticas.expirando,
        '#expired-count': estatisticas.expirados
    };

    Object.entries(elementosEstatisticas).forEach(([seletor, valor]) => {
        const elemento = getElement(seletor);
        if (elemento) {
            elemento.textContent = valor;
            // Animação de contagem
            elemento.style.animation = 'pulse 0.5s ease';
            setTimeout(() => elemento.style.animation = '', 500);
        }
    });

    renderizarListaAdmin(objetos);
    renderizarListaDenunciasAdmin(denuncias);
};

const atualizarBadgeDenuncias = (quantidade) => {
    const badge = getElement('#denuncias-badge');
    if (badge) {
        if (quantidade > 0) {
            badge.textContent = quantidade;
            badge.style.display = 'inline-block';
            badge.classList.add('pulse-animation');
        } else {
            badge.style.display = 'none';
            badge.classList.remove('pulse-animation');
        }
    }
};

const renderizarListaAdmin = (objetos = getListaObjetos()) => {
    const container = getElement('#objects-list');
    if (!container) return;

    // Aplicar filtros
    const searchTerm = getElement('#admin-search')?.value.toLowerCase() || '';
    const statusFilter = getElement('#admin-filter-status')?.value;

    const objetosFiltrados = objetos.filter(objeto => {
        const matchSearch = !searchTerm || 
            objeto.titulo.toLowerCase().includes(searchTerm) ||
            objeto.categoria.toLowerCase().includes(searchTerm) ||
            objeto.local.toLowerCase().includes(searchTerm);
        
        const matchStatus = !statusFilter || getStatusObjeto(objeto.dataExpiracao) === statusFilter;
        
        return matchSearch && matchStatus;
    });

    if (objetosFiltrados.length === 0) {
        container.innerHTML = '<div class="no-objects">Nenhum objeto encontrado com os filtros atuais.</div>';
        return;
    }

    container.innerHTML = objetosFiltrados.map(objeto => {
        const status = getStatusObjeto(objeto.dataExpiracao);
        const diasRestantes = Math.ceil((new Date(objeto.dataExpiracao) - new Date()) / 86400000);
        
        return `
            <div class="object-admin-card ${status} interactive">
                <div class="object-admin-image">
                    <img src="${objeto.fotoBase64 || 'placeholder-default.jpg'}" 
                         alt="Foto de ${objeto.titulo}" loading="lazy"
                         onerror="this.src='placeholder-default.jpg'">
                </div>
                <div class="object-admin-info">
                    <h4>${objeto.titulo}</h4>
                    <p><strong>Categoria:</strong> ${objeto.categoria || 'Não especificada'}</p>
                    <p><strong>Local:</strong> ${objeto.local}</p>
                    <p><strong>Contatos:</strong> ${objeto.contato ? 'WhatsApp' : ''}${objeto.contato && objeto.instagram ? ', ' : ''}${objeto.instagram ? 'Instagram' : ''}</p>
                    <p><strong>Registrado em:</strong> ${objeto.dataRegistro}</p>
                    <p><strong>Expira em:</strong> ${objeto.dataExpiracao}</p>
                    <span class="status ${status}">
                        ${status === 'expirado' ? '❌ Expirado' : 
                          status === 'expirando' ? `⚠️ Expira em ${diasRestantes} dias` : '✅ Ativo'}
                    </span>
                </div>
                <div class="object-admin-actions">
                    <button onclick="excluirObjetoAdmin(${objeto.id})" class="btn btn-danger btn-small">
                        🗑️ Excluir
                    </button>
                    <button onclick="verDetalhesObjeto(${objeto.id})" class="btn btn-primary btn-small">
                        👀 Ver Detalhes
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

// Funções globais para admin
window.excluirObjetoAdmin = (id) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este objeto?')) {
        const objetos = getListaObjetos();
        const objetosAtualizados = objetos.filter(obj => obj.id !== id);
        
        if (salvarListaObjetos(objetosAtualizados)) {
            alert('✅ Objeto excluído com sucesso!');
            carregarDadosAdmin();
        } else {
            alert('❌ Erro ao excluir objeto.');
        }
    }
};

window.verDetalhesObjeto = (id) => {
    window.open(`detalhe.html?id=${id}`, '_blank');
};

const limparObjetosExpiradosAdmin = () => {
    if (confirm('Deseja remover todos os objetos expirados do sistema?\n\nEsta ação não pode ser desfeita.')) {
        const objetosAtualizados = limparObjetosExpirados();
        alert(`✅ ${objetosAtualizados.length} objetos ativos no sistema.`);
        carregarDadosAdmin();
    }
};

const exportarDadosAdmin = () => {
    try {
        const objetos = getListaObjetos();
        const denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]');
        const data = {
            objetos: objetos,
            denuncias: denuncias,
            dataExportacao: new Date().toISOString()
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-completo-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('📥 Backup completo exportado com sucesso!');
    } catch (error) {
        alert('❌ Erro ao exportar backup.');
    }
};

const renderizarListaDenunciasAdmin = (denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]')) => {
    const container = getElement('#reports-list');
    if (!container) return;

    // Aplicar filtros
    const searchTerm = getElement('#reports-search')?.value.toLowerCase() || '';
    const statusFilter = getElement('#reports-filter-status')?.value;

    const denunciasFiltradas = denuncias.filter(denuncia => {
        const matchSearch = !searchTerm ||
            denuncia.titulo.toLowerCase().includes(searchTerm) ||
            denuncia.motivo.toLowerCase().includes(searchTerm);

        const matchStatus = !statusFilter || denuncia.status === statusFilter;

        return matchSearch && matchStatus;
    });

    if (denunciasFiltradas.length === 0) {
        container.innerHTML = '<div class="no-objects">Nenhuma denúncia encontrada com os filtros atuais.</div>';
        return;
    }

    // Agrupar denúncias por objetoId para mostrar apenas uma por objeto
    const denunciasAgrupadas = {};
    denunciasFiltradas.forEach(denuncia => {
        const key = denuncia.objetoId || `sem-id-${denuncia.id}`;
        if (!denunciasAgrupadas[key]) {
            denunciasAgrupadas[key] = [];
        }
        denunciasAgrupadas[key].push(denuncia);
    });

    // Para cada grupo, mostrar apenas a denúncia mais recente
    const denunciasUnicas = Object.values(denunciasAgrupadas).map(grupo => {
        return grupo.sort((a, b) => new Date(b.dataDenuncia) - new Date(a.dataDenuncia))[0];
    });

    container.innerHTML = denunciasUnicas.map(denuncia => {
        const dataFormatada = new Date(denuncia.dataDenuncia).toLocaleDateString('pt-BR');
        const statusClass = denuncia.status === 'pendente' ? 'expirado' : denuncia.status === 'analisada' ? 'expirando' : 'ativo';
        const totalDenuncias = denunciasAgrupadas[denuncia.objetoId || `sem-id-${denuncia.id}`].length;

        return `
            <div class="object-admin-card ${statusClass} interactive">
                <div class="object-admin-info">
                    <h4>Denúncia sobre: ${denuncia.titulo}</h4>
                    <p><strong>Motivo:</strong> ${denuncia.motivo}</p>
                    <p><strong>Data da Denúncia:</strong> ${dataFormatada}</p>
                    <p><strong>ID do Objeto:</strong> ${denuncia.objetoId || 'N/A'}</p>
                    ${totalDenuncias > 1 ? `<p><strong>Total de Denúncias:</strong> ${totalDenuncias}</p>` : ''}
                    <span class="status ${statusClass}">
                        ${denuncia.status === 'pendente' ? '⏳ Pendente' :
                          denuncia.status === 'analisada' ? '🔍 Analisada' : '✅ Resolvida'}
                    </span>
                </div>
                <div class="object-admin-actions">
                    <button onclick="processarDenunciaRapida(${denuncia.id}, 'aprovar')" class="btn btn-success btn-small">
                        ✅ Aprovar
                    </button>
                    <button onclick="processarDenunciaRapida(${denuncia.id}, 'rejeitar')" class="btn btn-warning btn-small">
                        ❌ Rejeitar
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

// Funções globais para admin de denúncias
window.alterarStatusDenuncia = (id, novoStatus) => {
    const denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]');
    const denunciaIndex = denuncias.findIndex(d => d.id === id);

    if (denunciaIndex !== -1) {
        denuncias[denunciaIndex].status = novoStatus;
        localStorage.setItem('denuncias', JSON.stringify(denuncias));

        const mensagens = {
            'analisada': '🔍 Denúncia marcada como analisada.',
            'resolvida': '✅ Denúncia aprovada! O objeto será removido automaticamente.'
        };

        alert(mensagens[novoStatus] || `✅ Status alterado para "${novoStatus}".`);
        carregarDadosAdmin();
    } else {
        alert('❌ Denúncia não encontrada.');
    }
};



window.processarDenunciaRapida = (id, acao) => {
    const denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]');
    const denunciaIndex = denuncias.findIndex(d => d.id === id);

    if (denunciaIndex === -1) {
        alert('❌ Denúncia não encontrada.');
        return;
    }

    const denuncia = denuncias[denunciaIndex];

    if (acao === 'aprovar') {
        // Aprovar denúncia e remover objeto
        if (confirm(`⚠️ APROVAR DENÚNCIA\n\nObjeto: ${denuncia.titulo}\nMotivo: ${denuncia.motivo}\n\nO objeto será removido permanentemente. Continuar?`)) {
            denuncias[denunciaIndex].status = 'resolvida';
            localStorage.setItem('denuncias', JSON.stringify(denuncias));

            // Remover objeto denunciado
            const objetos = getListaObjetos();
            const objetosAtualizados = objetos.filter(obj => obj.id !== denuncia.objetoId);
            salvarListaObjetos(objetosAtualizados);

            alert('✅ Denúncia aprovada! Objeto removido com sucesso.');
            carregarDadosAdmin();
        }
    } else if (acao === 'rejeitar') {
        // Rejeitar denúncia
        if (confirm(`❌ REJEITAR DENÚNCIA\n\nObjeto: ${denuncia.titulo}\nMotivo: ${denuncia.motivo}\n\nA denúncia será marcada como analisada e rejeitada. Continuar?`)) {
            denuncias[denunciaIndex].status = 'analisada';
            localStorage.setItem('denuncias', JSON.stringify(denuncias));

            alert('❌ Denúncia rejeitada. Objeto mantido no sistema.');
            carregarDadosAdmin();
        }
    }
};



// =========================================================
// INICIALIZAÇÃO E OTIMIZAÇÕES GLOBAIS
// =========================================================

const initMobileOptimizations = () => {
    if (!isMobile()) return;

    // Otimizações de performance para mobile
    let scrollTimeout;
    window.addEventListener('scroll', throttle(() => {
        document.body.classList.add('stop-animations-during-scroll');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('stop-animations-during-scroll');
        }, 100);
    }), { passive: true });

    // Prevenir zoom em inputs
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    // Lazy loading para imagens
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
};

const initInteractiveElements = () => {
    // Hover effects otimizados
    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('.interactive');
        if (interactive) {
            interactive.classList.add('hovered');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        const interactive = e.target.closest('.interactive');
        if (interactive) {
            interactive.classList.remove('hovered');
        }
    }, { passive: true });
};

// =========================================================
// INICIALIZAÇÃO PRINCIPAL
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Limpar cache do DOM após 5 minutos
    setTimeout(() => domCache.clear(), 300000);

    // Inicializações básicas
    limparObjetosExpirados();
    initMobileOptimizations();
    initInteractiveElements();

    // Roteamento de páginas
    const paginaAtual = window.location.pathname.split('/').pop();
    
    const configuradores = {
        'registrar.html': configurarRegistro,
        'buscar.html': configurarBusca,
        'detalhe.html': configurarDetalheEExclusao,
        'admin.html': configurarAdministracao
    };

    const configurador = configuradores[paginaAtual];
    if (configurador) {
        configurador();
    }

    console.log('✅ Sistema Achados e Perdidos carregado e otimizado');
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered: ', registration))
            .catch(registrationError => console.log('SW registration failed: ', registrationError));
    });
}