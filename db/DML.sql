-- DML para inserir dados de exemplo no banco de dados trabalho-final-web

-- Inserir dados na tabela Denuncia
INSERT INTO Denuncia (fk_Objeto_id, motivo, dataDenuncia, status) VALUES
(1, 'Objeto suspeito', '2023-10-01 10:00:00', 'pendente'),
(2, 'Descrição inadequada', '2023-10-02 11:00:00', 'resolvida');

-- Inserir dados na tabela Objeto
INSERT INTO Objeto (titulo, descricao, categoria, dataRegistro, local, dataExpiracao, foto, palavraPasse, status, contatoInstagram, contatoWhatsapp, fk_Denuncia_id) VALUES
('Carteira perdida', 'Carteira preta encontrada na rua', 'Documentos', '2023-09-01', 'Rua A', '2023-12-01', 'http://exemplo.com/foto1.jpg', 'senha123', 'ativo', '@usuario1', '11999999999', 1),
('Chaves de casa', 'Chaveiro com 3 chaves', 'Chaves', '2023-09-02', 'Praça B', '2023-12-02', 'http://exemplo.com/foto2.jpg', 'senha456', 'pendente', '@usuario2', '11888888888', NULL);

-- Inserir dados na tabela Administrador
INSERT INTO Administrador (username, password, fk_Objeto_id) VALUES
('admin1', 'hashedpassword1', 1),
('admin2', 'hashedpassword2', 2);
