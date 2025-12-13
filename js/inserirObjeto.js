
// URL base do back-end
const urlBase = "https://back-end-tf-web-silk.vercel.app";

// Configuração Uploadcare
const UPLOADCARE_PUBLIC_KEY = "f9f207f0bc99dda36d16";

// Variáveis globais
let imageUrl = null;
let fileName = "";

// Função para carregar Uploadcare
const carregarUploadcare = async () => {
    try {
        // Importa o módulo do Uploadcare
        const UC = await import("https://cdn.jsdelivr.net/npm/@uploadcare/file-uploader@1/web/uc-file-uploader-regular.min.js");
        
        // Define os componentes do Uploadcare
        UC.defineComponents(UC);
        
        // Seleciona o componente de upload do Uploadcare
        const ctxProvider = document.querySelector("uc-upload-ctx-provider");
        
        if (ctxProvider) {
            // Adiciona listener para capturar o evento de sucesso no upload
            ctxProvider.addEventListener("common-upload-success", (e) => {
                e.preventDefault();
                
                // Atualiza o nome da imagem selecionada e a URL da imagem
                fileName = e.detail.successEntries[0].name;
                imageUrl = e.detail.successEntries[0].cdnUrl;
                
                // Atualiza preview da imagem
                const selimg = document.getElementById("selimg");
                if (selimg) {
                    selimg.textContent = fileName;
                }
                
                // Atualiza preview da imagem
                const imagemPreview = document.getElementById("imagem-preview");
                if (imagemPreview) {
                    imagemPreview.src = imageUrl;
                }
                
                console.log('✅ Imagem enviada:', { fileName, imageUrl });
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar Uploadcare:', error);
    }
};

// Função para validar formulário
const validarFormulario = () => {
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
    
    // Validar pelo menos um método de contato
    if (!contato && !instagram) {
        alert("❌ Pelo menos um método de contato é obrigatório (WhatsApp ou Instagram)");
        document.getElementById("contato")?.focus();
        return false;
    }
    
    if (!palavraPasse) {
        alert("❌ Palavra-passe é obrigatória");
        document.getElementById("palavra_passe")?.focus();
        return false;
    }
    
    if (palavraPasse.length < 4) {
        alert("❌ A palavra-passe deve ter pelo menos 4 caracteres");
        document.getElementById("palavra_passe")?.focus();
        return false;
    }
    
    return true;
};

// Função para obter dados do formulário
const obterDadosFormulario = () => {
    const titulo = document.getElementById("titulo").value.trim();
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao")?.value.trim();
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
    
    return {
        titulo,
        categoria,
        descricao,
        local: localFinal,
        contato: contato ? contato.replace(/\D/g, '') : null,
        instagram: instagram ? instagram.replace('@', '') : null,
        palavraPasse,
        imagem: imageUrl
    };
};

// Função para inserir objeto
const inserirObjeto = async (dados) => {
    try {
        const endpoint = "/objetos/";
        const urlFinal = urlBase + endpoint;
        
        const response = await fetch(urlFinal, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || "Erro na requisição: " + response.status);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error("Erro ao inserir objeto:", error);
        throw error;
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🔄 Inicializando sistema de inserção de objetos...');
        
        // Configurar Uploadcare
        await carregarUploadcare();
        
        // Configurar evento do formulário
        const formulario = document.getElementById("form-registro");
        const botaoSalvar = document.getElementById("submit");
        
        if (formulario && botaoSalvar) {
            formulario.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Validar formulário
                if (!validarFormulario()) {
                    return;
                }
                
                // Desabilitar botão durante o processamento
                botaoSalvar.disabled = true;
                botaoSalvar.textContent = '📝 Registrando...';
                
                try {
                    // Obter dados do formulário
                    const dados = obterDadosFormulario();
                    
                    // Inserir objeto
                    const resultado = await inserirObjeto(dados);
                    
                    // Exibir mensagem de sucesso
                    alert(`✅ ${resultado.mensagem || 'Objeto registrado com sucesso!'}`);
                    
                    // Redirecionar para busca
                    window.location.href = 'buscar.html';
                    
                } catch (error) {
                    console.error('Erro ao registrar objeto:', error);
                    alert(`❌ Erro ao registrar objeto: ${error.message}`);
                } finally {
                    // Reabilitar botão
                    botaoSalvar.disabled = false;
                    botaoSalvar.textContent = '📝 Registrar Objeto Encontrado';
                }
            });
        }
        
        console.log('✅ Sistema de inserção de objetos carregado');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar inserção de objetos:', error);
    }
});
