
// URL base do back-end
const urlBase = "https://back-end-tf-web-silk.vercel.app";

// Variáveis globais
let imageUrl = null;
let currentObjectId = null;

// Função para obter parâmetros da URL
const obterParametrosURL = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    console.log('📌 ID obtido da URL:', id);
    return { id };
};

// Função para carregar dados do objeto
const carregarDadosObjeto = async (id) => {
    try {
        console.log(`🔄 Carregando objeto com ID: ${id}`);
        const response = await fetch(`${urlBase}/objetos/${id}`);
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📊 Status text:', response.statusText);
        
        if (!response.ok) {
            // Tentar obter mais detalhes do erro
            let errorDetails = `Erro ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.log('📊 Corpo do erro:', errorData);
                errorDetails = errorData.erro || errorDetails;
            } catch (e) {
                console.log('⚠️ Não foi possível ler corpo do erro como JSON');
            }
            
            throw new Error(errorDetails);
        }
        
        const objeto = await response.json();
        console.log('✅ Objeto carregado com sucesso:', objeto);
        return objeto;
        
    } catch (error) {
        console.error('❌ Erro detalhado ao carregar objeto:', error);
        
        // Verificar se é erro de rede
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        }
        
        throw error;
    }
};

// Função para preencher formulário com dados do objeto
const preencherFormulario = (objeto) => {
    console.log('📝 Preenchendo formulário com objeto:', objeto);
    
    try {
        // Preencher campos do formulário
        const titulo = document.getElementById("titulo");
        const categoria = document.getElementById("categoria");
        const descricao = document.getElementById("descricao");
        const local = document.getElementById("local");
        const contato = document.getElementById("contato");
        const instagram = document.getElementById("instagram");
        const imagemPreview = document.getElementById("imagem-preview");
        
        if (titulo) titulo.value = objeto.titulo || '';
        if (categoria) categoria.value = objeto.categoria || '';
        if (descricao) descricao.value = objeto.descricao || '';
        if (local) local.value = objeto.local || '';
        
        // Acessar propriedades em minúsculas (conforme retornado pelo PostgreSQL)
        if (contato) contato.value = objeto.contatowhatsapp || '';
        if (instagram) instagram.value = objeto.contatoinstagram || '';
        
        // Configurar imagem preview
        if (imagemPreview && objeto.foto) {
            imagemPreview.src = objeto.foto;
            imagemPreview.style.display = 'block';
            imageUrl = objeto.foto; // Definir URL da imagem atual
            console.log('🖼️ Imagem carregada:', objeto.foto);
        } else if (imagemPreview) {
            imagemPreview.style.display = 'none';
        }
        
        // Verificar se o local é "Outro" para mostrar campo de local customizado
        const localSelect = document.getElementById("local");
        const outroLocalContainer = document.getElementById("outro-local-container");
        const outroLocal = document.getElementById("outro-local");
        
        if (localSelect && outroLocalContainer && outroLocal && objeto.local) {
            const locaisFixos = [
                "Área de Convivência(Galpão)", "Biblioteca", "Brinquedoteca", "Cantina", 
                "CELIN", "CGAE", "Gabinete dos Professores", "Ginásio",
                "Lab 1 de Informática", "Lab 2 de Informática", "Lab 3 de Informática", "Lab 4 de Informática",
                "Laboratório de Anatomia Humana", "Laboratório de Física", "Laboratório de Microbiologia",
                "Laboratório de Práticas Pedagógicas", "Laboratório de Química",
                "Mini-Auditório 1", "Mini-Auditório 2", "Salas de Aula", "Prédio Administrativo",
                "Portaria/Guarita", "Refeitório", "Reprografia", "Quadra 1", "Quadra 2",
                "Quiosques", "Zootecnia"
            ];
            
            // Verificar se o local atual não está na lista de locais fixos
            if (!locaisFixos.includes(objeto.local) && objeto.local !== "Outro") {
                localSelect.value = "Outro";
                outroLocalContainer.style.display = "block";
                outroLocal.value = objeto.local;
                console.log('📍 Local personalizado:', objeto.local);
            }
        }
        
        console.log('✅ Formulário preenchido com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao preencher formulário:', error);
        throw new Error(`Erro ao preencher formulário: ${error.message}`);
    }
};

// Função para validar formulário
const validarFormulario = () => {
    console.log('🔍 Validando formulário...');
    
    const titulo = document.getElementById("titulo")?.value.trim();
    const categoria = document.getElementById("categoria")?.value;
    const local = document.getElementById("local")?.value;
    const palavraPasse = document.getElementById("palavra_passe")?.value.trim();
    const contato = document.getElementById("contato")?.value.trim();
    const instagram = document.getElementById("instagram")?.value.trim();
    
    // Validar campos obrigatórios
    if (!titulo) {
        alert("❌ Título é obrigatório");
        document.getElementById("titulo")?.focus();
        return false;
    }
    
    if (!categoria) {
        alert("❌ Categoria é obrigatória");
        document.getElementById("categoria")?.focus();
        return false;
    }
    
    if (!local) {
        alert("❌ Local é obrigatório");
        document.getElementById("local")?.focus();
        return false;
    }
    
    // Se local for "Outro", verificar se o campo personalizado está preenchido
    if (local === "Outro") {
        const outroLocal = document.getElementById("outro-local")?.value.trim();
        if (!outroLocal) {
            alert("❌ Por favor, especifique o local");
            document.getElementById("outro-local")?.focus();
            return false;
        }
    }
    
    // Validar pelo menos um método de contato
    if (!contato && !instagram) {
        alert("❌ Pelo menos um método de contato é obrigatório (WhatsApp ou Instagram)");
        document.getElementById("contato")?.focus();
        return false;
    }
    
    if (!palavraPasse) {
        alert("❌ Palavra-passe é obrigatória para salvar as alterações");
        document.getElementById("palavra_passe")?.focus();
        return false;
    }
    
    if (palavraPasse.length < 4) {
        alert("❌ A palavra-passe deve ter pelo menos 4 caracteres");
        document.getElementById("palavra_passe")?.focus();
        return false;
    }
    
    console.log('✅ Validação do formulário concluída');
    return true;
};

// Função para obter dados do formulário
const obterDadosFormulario = () => {
    const titulo = document.getElementById("titulo").value.trim();
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao")?.value.trim() || null;
    const local = document.getElementById("local").value;
    const contato = document.getElementById("contato")?.value.trim();
    const instagram = document.getElementById("instagram")?.value.trim();
    const palavraPasse = document.getElementById("palavra_passe").value.trim();
    
    // Processar local "Outro"
    let localFinal = local;
    if (local === "Outro") {
        const outroLocal = document.getElementById("outro-local")?.value.trim();
        if (outroLocal) {
            localFinal = outroLocal;
        }
    }
    
    // Preparar dados para envio
    const dados = {
        titulo,
        categoria,
        descricao,
        local: localFinal,
        palavraPasse
    };
    
    // Adicionar contatos se existirem
    if (contato) {
        dados.contatoWhatsapp = contato.replace(/\D/g, '');
    } else {
        dados.contatoWhatsapp = null;
    }
    
    if (instagram) {
        dados.contatoInstagram = instagram.replace('@', '');
    } else {
        dados.contatoInstagram = null;
    }
    
    // Adicionar foto se uma nova foi enviada
    if (imageUrl) {
        dados.foto = imageUrl;
    }
    
    console.log('📤 Dados preparados para envio:', dados);
    return dados;
};

// Função para salvar objeto
const salvarObjeto = async (id, dados) => {
    try {
        const endpoint = `/objetos/${id}`;
        const urlFinal = urlBase + endpoint;
        
        console.log('🔄 Enviando dados para:', urlFinal);
        console.log('📦 Dados enviados:', dados);
        
        const response = await fetch(urlFinal, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        });
        
        console.log('📊 Status da resposta (PUT):', response.status);
        console.log('📊 Status text (PUT):', response.statusText);
        
        if (!response.ok) {
            let errorDetails = `Erro ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.log('📊 Corpo do erro (PUT):', errorData);
                errorDetails = errorData.erro || errorDetails;
            } catch (e) {
                console.log('⚠️ Não foi possível ler corpo do erro como JSON');
            }
            
            throw new Error(errorDetails);
        }
        
        const result = await response.json();
        console.log('✅ Resposta do servidor:', result);
        return result;
        
    } catch (error) {
        console.error("❌ Erro ao salvar objeto:", error);
        
        // Verificar se é erro de rede
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        }
        
        throw error;
    }
};

// Configurar evento para mostrar/ocultar campo "Outro Local"
const configurarCampoOutroLocal = () => {
    const localSelect = document.getElementById("local");
    const outroLocalContainer = document.getElementById("outro-local-container");
    
    if (localSelect && outroLocalContainer) {
        localSelect.addEventListener('change', function() {
            if (this.value === "Outro") {
                outroLocalContainer.style.display = "block";
                // Focar no campo de texto
                setTimeout(() => {
                    document.getElementById("outro-local")?.focus();
                }, 100);
            } else {
                outroLocalContainer.style.display = "none";
            }
        });
    }
};

// Configurar Uploadcare (se necessário)
const configurarUploadcare = () => {
    try {
        const ctxProvider = document.querySelector('uc-upload-ctx-provider');
        if (!ctxProvider) {
            console.log('⚠️ Uploadcare não encontrado na página. Continuando sem ele.');
            return;
        }
        
        ctxProvider.addEventListener('common-upload-success', (e) => {
            console.log('📸 Uploadcare: Upload bem-sucedido', e.detail);
            
            if (e.detail.successEntries && e.detail.successEntries.length > 0) {
                const fileName = e.detail.successEntries[0].name;
                imageUrl = e.detail.successEntries[0].cdnUrl;
                
                const imagemPreview = document.getElementById("imagem-preview");
                const selimg = document.getElementById("selimg");
                
                if (imagemPreview) {
                    imagemPreview.src = imageUrl;
                    imagemPreview.style.display = 'block';
                }
                
                if (selimg) {
                    selimg.textContent = fileName;
                }
                
                console.log('✅ Nova imagem enviada:', imageUrl);
            }
        });
        
    } catch (error) {
        console.warn('⚠️ Erro ao configurar Uploadcare:', error);
        // Não impedir o funcionamento da página por causa do Uploadcare
    }
};

// Função para exibir página de erro
const exibirPaginaErro = (mensagem) => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;
    
    mainElement.innerHTML = `
        <div class="error-page" style="text-align: center; padding: 40px 20px;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">😔 Erro ao Carregar Edição</h2>
            <p style="margin-bottom: 15px; font-size: 16px;">${mensagem}</p>
            <p style="margin-bottom: 25px; color: #666;">Verifique se o objeto ainda existe ou tente novamente mais tarde.</p>
            <div class="action-buttons" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="buscar.html" class="btn btn-primary" style="padding: 10px 20px;">← Voltar para a Busca</a>
                <a href="index.html" class="btn btn-secondary" style="padding: 10px 20px;">🏠 Ir para Início</a>
            </div>
        </div>
    `;
};

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Inicializando sistema de edição de objetos...');
        
        const { id } = obterParametrosURL();
        currentObjectId = id;
        
        if (!id) {
            alert('❌ ID do objeto não especificado. Redirecionando para a busca...');
            window.location.href = 'buscar.html';
            return;
        }
        
        console.log(`🎯 Editando objeto ID: ${id}`);
        
        // Configurar campo "Outro Local"
        configurarCampoOutroLocal();
        
        // Carregar dados do objeto
        console.log('📥 Carregando dados do objeto...');
        const objeto = await carregarDadosObjeto(id);
        
        // Preencher formulário com dados do objeto
        console.log('📝 Preenchendo formulário...');
        preencherFormulario(objeto);
        
        // Configurar Uploadcare (se disponível)
        console.log('📸 Configurando Uploadcare...');
        setTimeout(configurarUploadcare, 1000);
        
        // Configurar evento do formulário
        const formulario = document.getElementById("form-edicao");
        const botaoSalvar = document.getElementById("submit");
        
        if (formulario && botaoSalvar) {
            formulario.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                console.log('📤 Enviando formulário...');
                
                // Validar formulário
                if (!validarFormulario()) {
                    return;
                }
                
                // Desabilitar botão durante o processamento
                botaoSalvar.disabled = true;
                botaoSalvar.textContent = '💾 Salvando...';
                
                try {
                    // Obter dados do formulário
                    const dados = obterDadosFormulario();
                    
                    // Salvar objeto
                    console.log('🔄 Enviando dados para o servidor...');
                    const resultado = await salvarObjeto(id, dados);
                    
                    // Exibir mensagem de sucesso
                    alert(`✅ ${resultado.mensagem || 'Objeto atualizado com sucesso!'}`);
                    
                    // Redirecionar para detalhes do objeto
                    console.log('🔄 Redirecionando para detalhes...');
                    window.location.href = `detalhe.html?id=${id}`;
                    
                } catch (error) {
                    console.error('❌ Erro ao salvar objeto:', error);
                    
                    let mensagemErro = error.message;
                    if (error.message.includes('401')) {
                        mensagemErro = 'Palavra-passe incorreta. Por favor, verifique e tente novamente.';
                    } else if (error.message.includes('404')) {
                        mensagemErro = 'Objeto não encontrado. Ele pode ter sido excluído.';
                    } else if (error.message.includes('500')) {
                        mensagemErro = 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
                    }
                    
                    alert(`❌ ${mensagemErro}`);
                } finally {
                    // Reabilitar botão
                    botaoSalvar.disabled = false;
                    botaoSalvar.textContent = '💾 Salvar Alterações';
                }
            });
        } else {
            console.error('❌ Formulário ou botão de salvar não encontrado');
        }
        
        console.log('✅ Sistema de edição de objetos carregado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar edição de objetos:', error);
        
        // Mensagem amigável com base no tipo de erro
        let mensagemErro = error.message;
        
        if (error.message.includes('404')) {
            mensagemErro = 'Objeto não encontrado. Ele pode ter sido excluído ou o ID está incorreto.';
        } else if (error.message.includes('500')) {
            mensagemErro = 'Erro interno do servidor. O servidor pode estar temporariamente indisponível. Por favor, tente novamente mais tarde.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            mensagemErro = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('ID do objeto não especificado')) {
            mensagemErro = 'ID do objeto não especificado na URL.';
        }
        
        exibirPaginaErro(mensagemErro);
    }
});

// Adicionar função global para teste manual
window.testarConexaoObjeto = async () => {
    if (!currentObjectId) {
        alert('⚠️ Nenhum ID de objeto disponível para teste');
        return;
    }
    
    try {
        alert(`🔄 Testando conexão com objeto ID: ${currentObjectId}`);
        const response = await fetch(`${urlBase}/objetos/${currentObjectId}`);
        alert(`✅ Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Dados do objeto:', data);
            alert('✅ Conexão bem-sucedida! Veja os detalhes no console.');
        }
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    }
};