
// =========================================================
// SISTEMA DE ADMINISTRAÇÃO - LOGIN E GERENCIAMENTO
// =========================================================

// URL base do back-end
const urlBase = "https://back-end-tf-web-silk.vercel.app";

// Elementos DOM
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Função para formatar data no formato dd/mm/aaaa
const formatarDataBR = (dataISO) => {
    if (!dataISO) return 'Não informado';
    
    try {
        // Se já estiver no formato YYYY-MM-DD (sem hora)
        if (dataISO.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [ano, mes, dia] = dataISO.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        
        // Se tiver a hora completa
        if (dataISO.includes('T')) {
            const dataParte = dataISO.split('T')[0];
            const [ano, mes, dia] = dataParte.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        
        // Se for uma string de data válida
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) {
            return dataISO; // Retorna o valor original se não for uma data válida
        }
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        
        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dataISO; // Retorna o valor original em caso de erro
    }
};

// Verificar se já está logado (em localStorage)
const checkLoginStatus = () => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    const token = localStorage.getItem('adminToken');
    
    if (loggedIn === 'true' && token) {
        // Já está logado, mostrar painel
        if (loginSection) loginSection.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        carregarDadosAdmin();
        return true;
    }
    return false;
};

// Função de login
const fazerLogin = async (username, password) => {
    try {
        console.log('🔄 Tentando login com:', username);
        
        const response = await fetch(`${urlBase}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('📊 Status do login:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Credenciais inválidas');
        }
        
        const data = await response.json();
        console.log('✅ Login bem-sucedido:', data);
        
        // Salvar status de login
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminToken', data.token || 'admin_token');
        localStorage.setItem('adminUser', username);
        
        return data;
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        throw error;
    }
};

// Função de logout
const fazerLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    if (loginSection) loginSection.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
    
    // Limpar campos do formulário
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    alert('✅ Logout realizado com sucesso!');
};

// Carregar dados administrativos
const carregarDadosAdmin = async () => {
    console.log('🔄 Carregando dados administrativos...');
    
    try {
        // Carregar objetos
        await carregarObjetosAdmin();
        
        // Carregar denúncias
        await carregarDenuncias();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados admin:', error);
    }
};

// Carregar objetos para administração
const carregarObjetosAdmin = async () => {
    try {
        const response = await fetch(`${urlBase}/admin/objetos`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar objetos: ${response.status}`);
        }
        
        const objetos = await response.json();
        console.log('📦 Objetos carregados:', objetos.length);
        
        // Renderizar objetos na lista
        renderizarObjetosAdmin(objetos);
        
    } catch (error) {
        console.error('❌ Erro ao carregar objetos admin:', error);
        const objectsList = document.getElementById('objects-list');
        if (objectsList) {
            objectsList.innerHTML = `
                <div class="error-message">
                    <p>❌ Erro ao carregar objetos: ${error.message}</p>
                    <button onclick="carregarObjetosAdmin()" class="btn btn-primary">Tentar Novamente</button>
                </div>
            `;
        }
    }
};

// Renderizar objetos na lista administrativa
const renderizarObjetosAdmin = (objetos) => {
    const objectsList = document.getElementById('objects-list');
    if (!objectsList) return;
    
    if (objetos.length === 0) {
        objectsList.innerHTML = `
            <div class="no-results">
                <p>📭 Nenhum objeto encontrado.</p>
            </div>
        `;
        return;
    }
    
    const html = objetos.map(objeto => {
        const status = objeto.status || 'ativo';
        const statusClass = status === 'expirado' ? 'expirado' : status === 'expirando' ? 'expirando' : 'ativo';
        const statusText = status === 'expirado' ? '❌ Expirado' : status === 'expirando' ? '⚠️ Expirando' : '✅ Ativo';
        
        // Formatar datas
        const dataRegistroFormatada = formatarDataBR(objeto.dataregistro);
        const dataExpiracaoFormatada = formatarDataBR(objeto.dataexpiracao);
        
        return `
            <div class="admin-object-card ${statusClass}">
                <div class="object-info">
                    <h4>${objeto.titulo || 'Sem título'}</h4>
                    <p><strong>ID:</strong> ${objeto.id}</p>
                    <p><strong>Categoria:</strong> ${objeto.categoria || 'Não especificada'}</p>
                    <p><strong>Local:</strong> ${objeto.local || 'Não informado'}</p>
                    <p><strong>Data Registro:</strong> ${dataRegistroFormatada}</p>
                    <p><strong>Data Expiração:</strong> ${dataExpiracaoFormatada}</p>
                    <p><strong>Status:</strong> <span class="status ${statusClass}">${statusText}</span></p>
                </div>
                <div class="object-actions">
                    <button onclick="excluirObjetoAdmin(${objeto.id})" class="btn btn-danger btn-small">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    objectsList.innerHTML = html;
};

// Carregar denúncias
const carregarDenuncias = async () => {
    try {
        const response = await fetch(`${urlBase}/admin/denuncias`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar denúncias: ${response.status}`);
        }
        
        const denuncias = await response.json();
        console.log('🚨 Denúncias carregadas:', denuncias.length);
        
        // Atualizar badge
        const badge = document.getElementById('denuncias-badge');
        if (badge && denuncias.length > 0) {
            badge.textContent = denuncias.length;
            badge.style.display = 'inline';
        }
        
        // Renderizar denúncias
        renderizarDenuncias(denuncias);
        
    } catch (error) {
        console.error('❌ Erro ao carregar denúncias:', error);
        const reportsList = document.getElementById('reports-list');
        if (reportsList) {
            reportsList.innerHTML = `
                <div class="error-message">
                    <p>❌ Erro ao carregar denúncias: ${error.message}</p>
                </div>
            `;
        }
    }
};

// Renderizar denúncias
const renderizarDenuncias = (denuncias) => {
    const reportsList = document.getElementById('reports-list');
    if (!reportsList) return;
    
    if (denuncias.length === 0) {
        reportsList.innerHTML = `
            <div class="no-results">
                <p>✅ Nenhuma denúncia pendente.</p>
            </div>
        `;
        return;
    }
    
    const html = denuncias.map(denuncia => {
        // Formatar data
        const dataRegistroFormatada = formatarDataBR(denuncia.dataregistro);
        
        // Adicionar informações de contato se disponíveis
        const contatoInfo = [];
        if (denuncia.contatowhatsapp) {
            contatoInfo.push(`WhatsApp: ${denuncia.contatowhatsapp}`);
        }
        if (denuncia.contatoinstagram) {
            contatoInfo.push(`Instagram: @${denuncia.contatoinstagram}`);
        }
        
        return `
            <div class="admin-report-card">
                <div class="report-info">
                    <h4>${denuncia.titulo || 'Sem título'}</h4>
                    <p><strong>ID:</strong> ${denuncia.id}</p>
                    <p><strong>Categoria:</strong> ${denuncia.categoria || 'Não especificada'}</p>
                    <p><strong>Local:</strong> ${denuncia.local || 'Não informado'}</p>
                    <p><strong>Data Registro:</strong> ${dataRegistroFormatada}</p>
                    ${contatoInfo.length > 0 ? `<p><strong>Contato:</strong> ${contatoInfo.join(', ')}</p>` : ''}
                    <p><strong>Status:</strong> <span class="status pendente">🚨 Pendente</span></p>
                    ${denuncia.descricao ? `<p><strong>Descrição:</strong> ${denuncia.descricao.substring(0, 100)}${denuncia.descricao.length > 100 ? '...' : ''}</p>` : ''}
                </div>
                <div class="report-actions">
                    <button onclick="aprovarDenuncia(${denuncia.id})" class="btn btn-danger btn-small">
                        ✅ Aprovar e Remover
                    </button>
                    <button onclick="rejeitarDenuncia(${denuncia.id})" class="btn btn-secondary btn-small">
                        ❌ Rejeitar Denúncia
                    </button>
                    <a href="detalhe.html?id=${denuncia.id}" target="_blank" class="btn btn-primary btn-small">
                        👁️ Ver Detalhes
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    reportsList.innerHTML = html;
};
// Funções administrativas globais
window.excluirObjetoAdmin = async (id) => {
    if (!confirm(`⚠️ Tem certeza que deseja excluir o objeto ID ${id}?\n\nEsta ação é administrativa e não requer senha do usuário.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${urlBase}/admin/objetos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao excluir objeto: ${response.status}`);
        }
        
        alert('✅ Objeto excluído administrativamente!');
        await carregarObjetosAdmin(); // Recarregar lista
        
    } catch (error) {
        console.error('❌ Erro ao excluir objeto admin:', error);
        alert(`❌ Erro ao excluir objeto: ${error.message}`);
    }
};

window.aprovarDenuncia = async (id) => {
    if (!confirm(`⚠️ Aprovar denúncia do objeto ID ${id}?\n\nO objeto será removido do sistema.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${urlBase}/admin/objetos/${id}/resolver-denuncia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ acao: 'aprovar' })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao aprovar denúncia: ${response.status}`);
        }
        
        alert('✅ Denúncia aprovada e objeto removido!');
        await carregarDenuncias(); // Recarregar denúncias
        await carregarObjetosAdmin(); // Recarregar objetos
        
    } catch (error) {
        console.error('❌ Erro ao aprovar denúncia:', error);
        alert(`❌ Erro ao aprovar denúncia: ${error.message}`);
    }
};

window.rejeitarDenuncia = async (id) => {
    if (!confirm(`Rejeitar denúncia do objeto ID ${id}?\n\nO objeto permanecerá no sistema.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${urlBase}/admin/objetos/${id}/resolver-denuncia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ acao: 'rejeitar' })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao rejeitar denúncia: ${response.status}`);
        }
        
        alert('✅ Denúncia rejeitada!');
        await carregarDenuncias(); // Recarregar denúncias
        
    } catch (error) {
        console.error('❌ Erro ao rejeitar denúncia:', error);
        alert(`❌ Erro ao rejeitar denúncia: ${error.message}`);
    }
};




window.atualizarDadosAdmin = async () => {
    try {
        await carregarObjetosAdmin();
        await carregarDenuncias();
        alert('✅ Dados atualizados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error);
        alert(`❌ Erro ao atualizar dados: ${error.message}`);
    }
};





// Sistema de navegação por abas
const initTabsSystem = () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            const targetPanel = document.getElementById(`tab-${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.style.display = 'block';
            }
            
            // Trigger specific tab loading
            if (targetTab === 'objects') {
                carregarObjetosAdmin();
            } else if (targetTab === 'reports') {
                carregarDenuncias();
            } else if (targetTab === 'overview') {
                atualizarEstatisticas();
                carregarObjetosRecentes();
            }
        });
    });
};

// Atualizar estatísticas do dashboard
const atualizarEstatisticas = async () => {
    try {
        // Carregar objetos para contar estatísticas
        const response = await fetch(`${urlBase}/admin/objetos`);
        if (!response.ok) return;
        
        const objetos = await response.json();
        
        // Calcular estatísticas
        const totalObjetos = objetos.length;
        const objetosAtivos = objetos.filter(obj => obj.status === 'ativo').length;
        const objetosExpirando = objetos.filter(obj => obj.status === 'expirando').length;
        
        // Contar denúncias pendentes
        const denunciasResponse = await fetch(`${urlBase}/admin/denuncias`);
        let totalDenuncias = 0;
        if (denunciasResponse.ok) {
            const denuncias = await denunciasResponse.json();
            totalDenuncias = denuncias.length;
        }
        

        // Atualizar elementos no DOM
        const totalObjetosEl = document.getElementById('total-objetos');
        const objetosAtivosEl = document.getElementById('objetos-ativos');
        const objetosExpirandoEl = document.getElementById('objetos-expirando');
        const totalDenunciasEl = document.getElementById('total-denuncias');
        
        if (totalObjetosEl) totalObjetosEl.textContent = totalObjetos;
        if (objetosAtivosEl) objetosAtivosEl.textContent = objetosAtivos;
        if (objetosExpirandoEl) objetosExpirandoEl.textContent = objetosExpirando;
        if (totalDenunciasEl) totalDenunciasEl.textContent = totalDenuncias;
        
        console.log('📊 Estatísticas atualizadas:', {
            totalObjetos,
            objetosAtivos,
            objetosExpirando,
            totalDenuncias
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar estatísticas:', error);
    }
};

// Carregar objetos recentes para o dashboard
const carregarObjetosRecentes = async () => {
    const recentObjectsList = document.getElementById('recent-objects-list');
    if (!recentObjectsList) return;
    
    try {
        const response = await fetch(`${urlBase}/admin/objetos`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar objetos: ${response.status}`);
        }
        
        const objetos = await response.json();
        
        // Pegar os 5 objetos mais recentes
        const objetosRecentes = objetos
            .sort((a, b) => new Date(b.dataregistro) - new Date(a.dataregistro))
            .slice(0, 5);
        
        if (objetosRecentes.length === 0) {
            recentObjectsList.innerHTML = `
                <div class="no-objects">
                    <p>📭 Nenhum objeto encontrado.</p>
                </div>
            `;
            return;
        }
        
        const html = objetosRecentes.map(objeto => {
            const status = objeto.status || 'ativo';
            const statusClass = status === 'expirado' ? 'expirado' : status === 'expirando' ? 'expirando' : 'ativo';
            const statusText = status === 'expirado' ? '❌ Expirado' : status === 'expirando' ? '⚠️ Expirando' : '✅ Ativo';
            
            const dataRegistroFormatada = formatarDataBR(objeto.dataregistro);
            
            return `
                <div class="recent-object-item ${statusClass}">
                    <div class="recent-object-info">
                        <h5>${objeto.titulo || 'Sem título'}</h5>
                        <p><strong>ID:</strong> ${objeto.id} | <strong>Data:</strong> ${dataRegistroFormatada}</p>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="recent-object-actions">
                        <button onclick="excluirObjetoAdmin(${objeto.id})" class="btn btn-danger btn-small">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        recentObjectsList.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Erro ao carregar objetos recentes:', error);
        recentObjectsList.innerHTML = `
            <div class="no-objects">
                <p>❌ Erro ao carregar objetos recentes.</p>
            </div>
        `;
    }
};


// Atualizar informações do usuário logado
const atualizarInfoUsuario = () => {
    const userInfo = document.getElementById('admin-user-info');
    
    const username = localStorage.getItem('adminUser') || 'Admin';
    
    if (userInfo) userInfo.textContent = `👤 ${username}`;
};

// Configurar event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Inicializando sistema administrativo...');
    
    // Verificar se já está logado
    checkLoginStatus();
    
    // Configurar sistema de abas
    initTabsSystem();
    
    // Configurar formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            if (!username || !password) {
                alert('❌ Por favor, preencha ambos os campos.');
                return;
            }
            
            // Mostrar loading
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Entrando...';
            
            try {
                await fazerLogin(username, password);
                
                // Login bem-sucedido
                if (loginSection) loginSection.style.display = 'none';
                if (adminPanel) adminPanel.style.display = 'block';
                
                // Atualizar informações do usuário
                atualizarInfoUsuario();
                
                // Carregar dados administrativos
                await carregarDadosAdmin();
                
                alert(`✅ Bem-vindo, ${username}!`);
                
            } catch (error) {
                console.error('❌ Erro no login:', error);
                alert(`❌ Login falhou: ${error.message || 'Credenciais inválidas'}`);
                
                // Limpar senha
                passwordInput.value = '';
                passwordInput.focus();
            } finally {
                // Restaurar botão
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Configurar botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
    


    // Configurar botões de ação
    const refreshObjectsBtn = document.getElementById('refresh-objects-btn');
    const refreshReportsBtn = document.getElementById('refresh-reports-btn');
    
    if (refreshObjectsBtn) {
        refreshObjectsBtn.addEventListener('click', carregarObjetosAdmin);
    }
    
    if (refreshReportsBtn) {
        refreshReportsBtn.addEventListener('click', carregarDenuncias);
    }
    
    // Configurar filtros de busca
    const adminSearch = document.getElementById('admin-search');
    const adminFilterStatus = document.getElementById('admin-filter-status');
    const reportsSearch = document.getElementById('reports-search');
    const reportsFilterStatus = document.getElementById('reports-filter-status');
    
    // Função para filtrar objetos
    const filtrarObjetos = async () => {
        try {
            const response = await fetch(`${urlBase}/admin/objetos`);
            if (!response.ok) return;
            
            const objetos = await response.json();
            let filtrados = [...objetos];
            
            // Aplicar filtro de texto
            const searchText = adminSearch?.value.toLowerCase() || '';
            if (searchText) {
                filtrados = filtrados.filter(obj => 
                    (obj.titulo && obj.titulo.toLowerCase().includes(searchText)) ||
                    (obj.categoria && obj.categoria.toLowerCase().includes(searchText)) ||
                    (obj.local && obj.local.toLowerCase().includes(searchText))
                );
            }
            
            // Aplicar filtro de status
            const statusFilter = adminFilterStatus?.value || '';
            if (statusFilter) {
                if (statusFilter === 'active') {
                    filtrados = filtrados.filter(obj => obj.status === 'ativo');
                } else if (statusFilter === 'expired') {
                    filtrados = filtrados.filter(obj => obj.status === 'expirado');
                } else if (statusFilter === 'expiring') {
                    filtrados = filtrados.filter(obj => obj.status === 'expirando');
                }
            }
            
            renderizarObjetosAdmin(filtrados);
            
        } catch (error) {
            console.error('Erro ao filtrar objetos:', error);
        }
    };
    
    // Função para filtrar denúncias
    const filtrarDenuncias = async () => {
        try {
            const response = await fetch(`${urlBase}/admin/denuncias`);
            if (!response.ok) return;
            
            const denuncias = await response.json();
            let filtradas = [...denuncias];
            
            // Aplicar filtro de texto
            const searchText = reportsSearch?.value.toLowerCase() || '';
            if (searchText) {
                filtradas = filtradas.filter(denuncia => 
                    (denuncia.titulo && denuncia.titulo.toLowerCase().includes(searchText)) ||
                    (denuncia.categoria && denuncia.categoria.toLowerCase().includes(searchText)) ||
                    (denuncia.local && denuncia.local.toLowerCase().includes(searchText))
                );
            }
            
            // Aplicar filtro de status
            const statusFilter = reportsFilterStatus?.value || '';
            if (statusFilter) {
                // Como todas as denúncias retornadas são "pendentes" por padrão,
                // esta filtragem é mais para demonstração
                // Em um sistema real, você teria diferentes status de denúncia
            }
            
            renderizarDenuncias(filtradas);
            
        } catch (error) {
            console.error('Erro ao filtrar denúncias:', error);
        }
    };
    
    if (adminSearch) {
        adminSearch.addEventListener('input', filtrarObjetos);
    }
    
    if (adminFilterStatus) {
        adminFilterStatus.addEventListener('change', filtrarObjetos);
    }
    
    if (reportsSearch) {
        reportsSearch.addEventListener('input', filtrarDenuncias);
    }
    
    if (reportsFilterStatus) {
        reportsFilterStatus.addEventListener('change', filtrarDenuncias);
    }
    
    console.log('✅ Sistema administrativo inicializado');
});
