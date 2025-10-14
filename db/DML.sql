-- DML para inserir dados de exemplo no banco de dados trabalho-final-web

-- Inserir dados na tabela Denuncia
INSERT INTO Denuncia (fk_Objeto_id, motivo, dataDenuncia, status) VALUES
(1, 'Objeto suspeito', '2023-10-01 10:00:00', 'pendente'),
(2, 'Descrição inadequada', '2023-10-02 11:00:00', 'resolvida');

-- Inserir dados na tabela Objeto
INSERT INTO Objeto (titulo, descricao, categoria, dataRegistro, local, dataExpiracao, foto, palavraPasse, status, contatoInstagram, contatoWhatsapp, fk_Denuncia_id) VALUES
('Carteira perdida', 'Carteira preta de couro.', 'Documentos', '2023-09-01', 'Biblioteca', '2025-10-01', 'http://exemplo.com/foto1.jpg', 'senha123', 'ativo', '@usuario1', '11999999999', 1),
('Chaves de casa', 'Chaveiro de capivara com 3 chaves', 'Chaves', '2023-09-02', 'Salas de Aula', '2025-09-02', 'http://exemplo.com/foto2.jpg', 'senha456', 'pendente', '@usuario2', '11888888888', NULL);

-- Inserir dados na tabela Administrador
INSERT INTO Administrador (username, password) VALUES
('admin1', 'password'),
('admin2', 'password2');
