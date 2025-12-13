
// URL base do back-end
const urlBase = "https://back-end-tf-web-silk.vercel.app";

// URL para placeholder de imagem
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/cccccc/666666?text=Sem+Imagem";

// Obtém elementos DOM
const elId = document.getElementById("id");
const elTitulo = document.getElementById("titulo");
const elCategoria = document.getElementById("categoria");
const elLocal = document.getElementById("local");
const elDescricao = document.getElementById("descricao");
const elDataRegistro = document.getElementById("data-registro");
const elDataExpiracao = document.getElementById("data-expiracao");
const elStatus = document.getElementById("status");
const elImagem = document.getElementById("imagem-preview");

// Função para obter parâmetros da URL
const obterParametrosURL = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return { id };
};

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

// Função para exibir mensagem de erro
const exibirErro = (mensagem) => {
    const pagina = document.querySelector('.object-detail-page');
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

// Função para configurar contatos
const configurarContatos = (objeto) => {
    console.log('Configurando contatos com objeto:', objeto);
    console.log('WhatsApp:', objeto.contatowhatsapp);
    console.log('Instagram:', objeto.contatoinstagram);
    
    const whatsappOption = document.getElementById('whatsapp-option');
    const instagramOption = document.getElementById('instagram-option');
    const whatsappLink = document.getElementById('whatsapp-link');
    const instagramLink = document.getElementById('instagram-link');

    // WhatsApp
    if (objeto.contatowhatsapp && whatsappOption && whatsappLink) {
        whatsappOption.style.display = 'block';
        const mensagem = encodeURIComponent(
            `Olá! Vi o item "${objeto.titulo}" no Achados e Perdidos Local e acredito que seja meu. ` +
            `Podemos combinar a devolução? Obrigado!`
        );
        whatsappLink.href = `https://wa.me/55${objeto.contatowhatsapp}?text=${mensagem}`;
        console.log('Link WhatsApp configurado:', whatsappLink.href);
    }

    // Instagram
    if (objeto.contatoinstagram && instagramOption && instagramLink) {
        instagramOption.style.display = 'block';
        const instagramUser = objeto.contatoinstagram.replace('@', '');
        instagramLink.href = `https://instagram.com/${instagramUser}`;
        console.log('Link Instagram configurado:', instagramLink.href);
    }
};

// Função para renderizar detalhes do objeto
const renderizarDetalhesObjeto = (objeto) => {
    console.log('Renderizando detalhes do objeto:', objeto);
    console.log('Propriedades do objeto:', Object.keys(objeto));
    
    // Atualizar elementos da página
    if (elId) elId.textContent = objeto.id;
    if (elTitulo) elTitulo.textContent = objeto.titulo;
    if (elCategoria) elCategoria.innerHTML = `<strong>Categoria:</strong> ${objeto.categoria || 'Não especificada'}`;
    if (elLocal) elLocal.innerHTML = `<strong>Local:</strong> ${objeto.local}`;
    if (elDescricao) elDescricao.textContent = objeto.descricao || 'Nenhuma descrição adicional fornecida.';
    
    // Formatar e exibir datas
    const dataRegistroFormatada = formatarData(objeto.dataregistro);
    const dataExpiracaoFormatada = formatarData(objeto.dataexpiracao);
    
    if (elDataRegistro) elDataRegistro.innerHTML = `<strong>Data de Registro:</strong> ${dataRegistroFormatada}`;
    if (elDataExpiracao) elDataExpiracao.innerHTML = `<strong>Data de Expiração:</strong> ${dataExpiracaoFormatada}`;
    
    // Atualizar status
    if (elStatus) {
        const status = objeto.status || 'ativo';
        let statusText = '✅ Ativo';
        let statusClass = 'ativo';
        
        if (status === 'expirado') {
            statusText = '❌ Expirado';
            statusClass = 'expirado';
        } else if (status === 'expirando') {
            statusText = '⚠️ Expirando em breve';
            statusClass = 'expirando';
        }
        
        elStatus.innerHTML = `<strong>Status:</strong> <span class="status ${statusClass}">${statusText}</span>`;
    }
    
    // Atualizar imagem
    if (elImagem) {
        const imagemSrc = objeto.foto || PLACEHOLDER_IMAGE;
        elImagem.src = imagemSrc;
        elImagem.alt = `Foto de ${objeto.titulo}`;
        elImagem.onerror = () => {
            elImagem.src = PLACEHOLDER_IMAGE;
            console.log('❌ Erro ao carregar imagem, usando placeholder');
        };
    }
    
    // Configurar contatos
    configurarContatos(objeto);
};

// Função para carregar dados do objeto
const carregarDadosObjeto = async (id) => {
    // Verificar se o ID é válido
    if (!id) {
        exibirErro('ID do objeto não especificado');
        return;
    }

    // Definir valor inicial como "Carregando..."
    if (elId) {
        elId.value = "Carregando...";
    }

    try {
        // Fazer requisição GET para obter dados do objeto
        const endpoint = `/objetos/${id}`;
        const urlFinal = urlBase + endpoint;
        
        const response = await fetch(urlFinal);
        
        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Objeto não encontrado");
            }
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        // Converter resposta para JSON
        const data = await response.json();
        
        // Verificar se recebemos dados válidos
        if (!data) {
            throw new Error("Dados do objeto não encontrados");
        }
        
        // Renderizar detalhes do objeto
        renderizarDetalhesObjeto(data);
        
        console.log('✅ Dados do objeto carregados:', data);

    } catch (error) {
        console.error('Erro ao carregar objeto:', error);
        exibirErro(`Erro ao carregar objeto: ${error.message}`);
    }
};

// Função global para excluir objeto
window.excluirObjeto = async () => {
    const id = obterParametrosURL().id;
    const titulo = elTitulo?.textContent || 'este objeto';
    
    if (!id) {
        alert('❌ ID do objeto não encontrado.');
        return;
    }
    
    if (confirm(`⚠️ Tem certeza que deseja excluir "${titulo}"?\n\nEsta ação é irreversível!`)) {
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
            window.location.href = 'buscar.html';
            
        } catch (error) {
            console.error('Erro ao excluir objeto:', error);
            alert(`❌ Erro ao excluir objeto: ${error.message}`);
        }
    }
};

// Função autoexecutável para carregar os dados do objeto
(async () => {
    try {
        console.log('🔄 Iniciando carregamento de detalhes do objeto...');
        
        // Obter ID do objeto da URL
        const { id } = obterParametrosURL();
        
        // Carregar dados do objeto
        await carregarDadosObjeto(id);
        
        console.log('✅ Sistema de detalhes de objeto carregado');

    } catch (error) {
        console.error('❌ Erro ao inicializar detalhes do objeto:', error);
        exibirErro('Erro ao carregar a página de detalhes');
    }
    // Adicione estas funções ao final do arquivo verObjeto.js, ANTES do último })();

// Função para mostrar formulário de denúncia
window.mostrarFormularioDenuncia = () => {
    const formDenuncia = document.getElementById('form-denuncia');
    if (formDenuncia) {
        formDenuncia.style.display = 'block';
        // Rolar até o formulário
        formDenuncia.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Configurar evento para mostrar campo "Outro motivo"
    const motivoRadios = document.querySelectorAll('input[name="motivo"]');
    const outroMotivoContainer = document.getElementById('outro-motivo-container');
    
    motivoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'outro') {
                outroMotivoContainer.style.display = 'block';
            } else {
                outroMotivoContainer.style.display = 'none';
            }
        });
    });
};

// Função para cancelar denúncia
window.cancelarDenuncia = () => {
    const formDenuncia = document.getElementById('form-denuncia');
    if (formDenuncia) {
        formDenuncia.style.display = 'none';
        // Limpar campos
        document.querySelectorAll('input[name="motivo"]').forEach(radio => {
            if (radio.value === 'conteudo_inapropriado') radio.checked = true;
        });
        const outroMotivo = document.getElementById('outro-motivo');
        if (outroMotivo) outroMotivo.value = '';
    }
};

// Função para enviar denúncia
window.enviarDenuncia = async () => {
    const id = obterParametrosURL().id;
    const titulo = elTitulo?.textContent || 'este objeto';
    
    if (!id) {
        alert('❌ ID do objeto não encontrado.');
        return;
    }
    
    // Obter motivo selecionado
    const motivoSelecionado = document.querySelector('input[name="motivo"]:checked');
    if (!motivoSelecionado) {
        alert('❌ Por favor, selecione um motivo para a denúncia.');
        return;
    }
    
    let motivo = motivoSelecionado.value;
    
    // Se for "outro", pegar o texto
    if (motivo === 'outro') {
        const outroMotivo = document.getElementById('outro-motivo')?.value.trim();
        if (!outroMotivo) {
            alert('❌ Por favor, descreva o motivo da denúncia.');
            document.getElementById('outro-motivo')?.focus();
            return;
        }
        motivo = `Outro: ${outroMotivo}`;
    }
    
    if (!confirm(`🚨 Você está denunciando o objeto "${titulo}"\n\nMotivo: ${motivo}\n\nConfirmar denúncia?`)) {
        return;
    }
    
    try {
        console.log(`🔄 Enviando denúncia para objeto ${id}: ${motivo}`);
        
        const response = await fetch(`${urlBase}/admin/objetos/${id}/denunciar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao enviar denúncia');
        }
        
        // Mostrar confirmação
        alert('✅ Denúncia enviada com sucesso!\n\nA administração irá analisar o caso em breve.');
        
        // Esconder formulário
        cancelarDenuncia();
        
    } catch (error) {
        console.error('❌ Erro ao enviar denúncia:', error);
        alert(`❌ Erro ao enviar denúncia: ${error.message}`);
    }
};
})();