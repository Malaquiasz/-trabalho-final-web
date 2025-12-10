
# TODO: Remover Animações e Efeitos Exagerados

## Tarefa Principal
- Remover todas as animações e efeitos exagerados do CSS, deixando apenas 1 efeito sutil por elemento para destacá-lo.

## Passos Detalhados
- [x] Analisar keyframes existentes e remover a maioria, mantendo apenas básicos se necessário
- [x] Simplificar efeitos de hover para apenas uma transição sutil (ex: mudança de cor ou opacidade)
- [x] Remover animações múltiplas por elemento (ex: logo com spin, hover, active)
- [x] Remover efeitos exagerados como scale, rotate, glow, pulse, bounce
- [x] Manter transições básicas mas simplificadas
- [x] Testar o site após mudanças para garantir funcionalidade

## Plano de Implementação Aprovado
- [x] Remover o container 3D do logo e efeitos de spin, simplificando para um logo básico
- [x] Remover a animação do pulse-ring
- [x] Remover todos os transforms de hover (translateY, scale, etc.) e manter apenas um efeito sutil por elemento (ex: mudança de cor ou opacidade)
- [x] Remover propriedades 'will-change: transform'
- [x] Simplificar transições para básicas apenas para efeitos sutis
- [x] Garantir apenas um efeito sutil por elemento (ex: mudança de border-color no hover)
- [x] Testar o site após mudanças para garantir funcionalidade

## Arquivos Editados
- css/estilo.css: Principal arquivo de estilos com animações

## Alterações Realizadas
### Efeitos Removidos/Simplificados:
- ✅ Removido `pulse-ring` (elemento sem animação)
- ✅ Removido todas as propriedades `will-change: transform`
- ✅ Simplificado `transicao-padrao` para apenas `border-color` e `box-shadow`
- ✅ Removido `transform: translateX(-50%)` do título de categorias
- ✅ Removido `transform: translateY(-2px)` dos elementos de contato
- ✅ Removido `filter: drop-shadow()` do ícone de busca
- ✅ Removido `text-shadow` do título principal
- ✅ Removido `backdrop-filter: blur()` do header
- ✅ Removido `background-image` com múltiplos radial-gradients do body
- ✅ Removido `will-change` dos números de step e feature-cards
- ✅ Removido `transform: scale(1.05)` dos links do footer
- ✅ Removido seção vazia `.pulse-animation`
- ✅ Simplificado sombras (ex: `box-shadow: 0 8px 30px` → `0 2px 10px`)

### Efeitos Mantidos (Sutis):
- ✅ Mudança de `border-color` no hover
- ✅ Transições básicas de 0.3s ease
- ✅ Sombras sutis em cards e botões
- ✅ Gradientes simples para fundos e elementos decorativos

## Status
- ✅ **CONCLUÍDO** - Todos os efeitos exagerados foram removidos ou simplificados
