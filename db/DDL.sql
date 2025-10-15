-- DDL para o banco de dados trabalho-final-web

-- Tabela Objeto
CREATE TABLE Objeto (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    local VARCHAR(100) NOT NULL,
    dataRegistro DATE NOT NULL DEFAULT CURRENT_DATE,
    dataExpiracao DATE NOT NULL,
    foto VARCHAR(255),
    palavraPasse VARCHAR(255) NOT NULL,
    contatoInstagram VARCHAR(50),
    contatoWhatsapp VARCHAR(20),
    denuncia BOOLEAN DEFAULT FALSE,
    statusDenuncia BOOLEAN DEFAULT FALSE
);

-- Tabela Administrador
CREATE TABLE Administrador (
    username VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);
