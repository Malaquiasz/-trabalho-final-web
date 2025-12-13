# Plano de Integração Front-End com Back-End - Achados e Perdidos

## Objetivos
- Remover localStorage e integrar com back-end
- Implementar CRUD completo para objetos
- Usar Uploadcare para imagens
- Seguir atividades #20-26 adaptadas para Achados e Perdidos

## Estrutura de Arquivos a Criar

```
js/
├── main.js           # Página inicial (atividade #20)
├── objetos.js        # Listar objetos (atividade #22)
├── verObjeto.js      # Ver detalhes do objeto (atividade #23)
├── inserirObjeto.js  # Inserir objeto (atividade #25)
└── editarObjeto.js   # Editar objeto (atividade #26)
```

## Back-end Info
- URL: https://back-end-tf-web-silk.vercel.app
- Uploadcare Key: f9f207f0bc99dda36d16

## Passos do Plano


### 1. Atividade #20 - Front-End para API
- [x] Criar js/main.js com integração básica
- [x] Atualizar index.html se necessário
- [x] Atualizar script.js se necessário 

### 2. Atividade #22 - [GET] /objetos
- [x] Criar js/objetos.js
- [x] Buscar e listar objetos do back-end
- [x] Implementar filtros de busca

### 3. Atividade #23 - [GET] /objetos/:id
- [x] Criar js/verObjeto.js
- [x] Visualizar detalhes de um objeto específico (usando detalhe.html)
- [x] Gerenciar contatos (WhatsApp/Instagram)


### 4. Atividade #24 - [DELETE] /objetos/:id
- [x] Implementar exclusão de objetos integrada nos outros arquivos
- [x] Validar palavra-passe
- [x] Remover arquivo excluirObjeto.js desnecessário

### 5. Atividade #25 - [POST] /objetos
- [x] Criar js/inserirObjeto.js
- [x] Uploadcare para imagens (registrar.html já configurado)
- [x] Formulário de registro de objetos

### 6. Atividade #26 - [PUT] /objetos/:id
- [x] Criar js/editarObjeto.js
- [x] Editar objetos existentes
- [x] Validar palavra-passe


### 7. Páginas HTML Necessárias
- [x] Remover ver-objeto.html (usar apenas detalhe.html)
- [x] Criar editar-objeto.html (edição)
- [x] Atualizar registrar.html para usar Uploadcare


### 8. CSS e Estilo
- [x] Manter estilo atual
- [x] Adicionar estilos para Uploadcare
- [x] Responsividade

### 9. Testes e Validação
- [x] Testar todas as funcionalidades CRUD
- [x] Verificar integração com back-end
- [x] Validar Uploadcare
- [x] Testar responsividade

## ✅ Sistema Completo Integrado

**Status**: Todas as atividades #20-#26 implementadas com sucesso!
- ✅ API Base: `https://back-end-tf-web-silk.vercel.app`
- ✅ Uploadcare Key: `f9f207f0bc99dda36d16`
- ✅ Front-end totalmente integrado com back-end
- ✅ LocalStorage removido
- ✅ CRUD completo implementado
- ✅ Uploadcare configurado
- ✅ Páginas HTML atualizadas

## APIs do Back-end
- GET /objetos - Listar todos os objetos
- GET /objetos/:id - Obter detalhes de um objeto
- POST /objetos - Criar novo objeto
- PUT /objetos/:id - Atualizar objeto
- DELETE /objetos/:id - Excluir objeto
- POST /objetos/:id/validar - Validar palavra-passe
