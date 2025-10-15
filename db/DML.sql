-- DML para inserir dados de exemplo no banco de dados trabalho-final-web

-- Inserir dados na tabela Objeto
INSERT INTO Objeto (titulo, descricao, categoria, local, dataRegistro, dataExpiracao, foto, palavraPasse, contatoInstagram, contatoWhatsapp, denuncia, statusDenuncia) VALUES
('Carteira perdida', 'Carteira preta de couro.', 'Documentos', 'Biblioteca', '2023-09-01', '2025-10-01', 'http://exemplo.com/foto1.jpg', 'senha123', '@usuario1', '11999999999', FALSE, FALSE),
('Chaves de casa', 'Chaveiro de capivara com 3 chaves', 'Chaves', 'Salas de Aula', '2023-09-02', '2025-09-02', 'http://exemplo.com/foto2.jpg', 'senha456', '@usuario2', '11888888888', FALSE, FALSE);

-- Inserir dados na tabela Administrador
INSERT INTO Administrador (username, password) VALUES
('admin1', 'password'),
('admin2', 'password2');
