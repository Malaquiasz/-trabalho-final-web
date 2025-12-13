
// Obtém elementos DOM
const botaoTeste = document.getElementById('botaoTeste');
const elAutor = document.getElementById('autor');
const elApi = document.getElementById('api');
const elBd = document.getElementById('bd');

// Adiciona evento de clique no botão
if (botaoTeste) {
    botaoTeste.addEventListener('click', testarConexaoAPI);
}

// URL base do back-end
const urlBase = "https://back-end-tf-web-silk.vercel.app";

// Função para testar a conexão com a API
async function testarConexaoAPI() {
    // Atualiza interface para mostrar que está carregando
    if (elAutor) elAutor.innerText = "Aguarde... Testando conexão com a API";
    if (elApi) elApi.innerText = "";
    if (elBd) elBd.innerText = "";

    try {
        // Faz requisição GET para a raiz da API
        const response = await fetch(urlBase);
        
        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }

        // Converte resposta para JSON
        const data = await response.json();
        
        // Atualiza elementos da página com os dados da API
        if (elAutor) {
            elAutor.innerHTML = `<strong>Autor:</strong> ${data.autor}`;
        }
        if (elApi) {
            elApi.innerHTML = `<strong>API:</strong> ${data.descricao || data.mensagem || 'Sistema Achados e Perdidos'}`;
        }
        if (elBd) {
            elBd.innerHTML = `<strong>Banco de Dados:</strong> ${data.statusBD || data.status_bd || 'Status não informado'}`;
        }

        // Log de sucesso no console
        console.log('✅ Conexão com API estabelecida com sucesso:', data);

    } catch (error) {
        console.error('❌ Erro ao conectar com API:', error);
        
        // Atualiza elementos com mensagem de erro
        if (elAutor) {
            elAutor.innerHTML = `<strong>Erro:</strong> Falha na conexão`;
        }
        if (elApi) {
            elApi.innerHTML = `<strong>Status:</strong> API indisponível`;
        }
        if (elBd) {
            elBd.innerHTML = `<strong>Banco:</strong> Não foi possível conectar`;
        }

        // Mostra alerta para o usuário
        alert(`❌ Erro ao conectar com a API:\n${error.message}\n\nVerifique se o back-end está rodando.`);
    }
}

// Auto-executar teste ao carregar a página (se elementos existirem)
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sistema Achados e Perdidos - Integração API carregado');
    
    // Executa teste automaticamente se os elementos existirem
    if (elAutor && elApi && elBd) {
        // Delay para garantir que os elementos foram renderizados
        setTimeout(testarConexaoAPI, 500);
    }
});
