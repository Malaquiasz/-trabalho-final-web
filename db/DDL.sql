-- DDL para o banco de dados trabalho-final-web

-- Tabela Denuncia
CREATE TABLE Denuncia (
    id SERIAL PRIMARY KEY,
    fk_Objeto_id INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    dataDenuncia TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente'
);

-- Tabela Objeto
CREATE TABLE Objeto (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    dataRegistro DATE NOT NULL DEFAULT CURRENT_DATE,
    local VARCHAR(100) NOT NULL,
    dataExpiracao DATE NOT NULL,
    foto VARCHAR(255),  -- Assumindo URL como VARCHAR
    palavraPasse VARCHAR(255) NOT NULL,
    contatoInstagram VARCHAR(50),
    contatoWhatsapp VARCHAR(20),
    fk_Denuncia_id INTEGER
);

-- Tabela Administrador
CREATE TABLE Administrador (
    username VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

-- Foreign Key para Objeto -> Denuncia
ALTER TABLE Objeto ADD CONSTRAINT FK_Objeto_2
    FOREIGN KEY (fk_Denuncia_id)
    REFERENCES Denuncia (id)
    ON DELETE CASCADE;



-- Foreign Key para Denuncia -> Objeto
ALTER TABLE Denuncia ADD CONSTRAINT FK_Denuncia_2
    FOREIGN KEY (fk_Objeto_id)
    REFERENCES Objeto (id);
