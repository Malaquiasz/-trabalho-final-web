// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express";      // Requisição do pacote do express
import pkg from "pg";
import dotenv from "dotenv";

// ######
// Local onde as configurações do servidor serão feitas
// ######
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta
dotenv.config();         // Carrega e processa o arquivo .env
const { Pool } = pkg;    // Utiliza a Classe Pool do Postgres

// ######
// Local onde as rotas (endpoints) serão definidas
// ######
app.get("/", async (req, res) => {
  // Rota raiz do servidor
  // Rota GET /
  // Esta rota é chamada quando o usuário acessa a raiz do servidor
  // Ela retorna uma mensagem com informações do projeto

  console.log("Rota GET / solicitada"); // Log no terminal para indicar que a rota foi acessada

  const db = new Pool({
    connectionString: process.env.URL_BD,
  });

  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }

  // Responde com um JSON contendo uma mensagem
  res.json({
		descricao: "API para Achados e Perdidos Local",    // Substitua pelo conteúdo da sua API
    autor: "Equipe Centaurus",     // Substitua pelo seu nome
    statusBD: dbStatus
  });
});

// ######
// Local onde o servidor escutar as requisições que chegam
// ######
app.listen(port, () => {
  console.log(`Serviço rodando na porta:  ${port}`);
});
