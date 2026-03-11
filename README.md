# Sistema de Validação de Equipamentos

Uma aplicação web moderna para gerenciamento e classificação de computadores e smartphones com sistema de grades profissional.

## 🚀 Características

- **Gestão Completa**: Cadastro, busca e gerenciamento de equipamentos
- **Sistema de Grades**: Classificação automática (A+, A, B, C) baseada em critérios físicos e visuais
- **Scanner de Câmera**: Leitura de números de série via câmera (com fallback manual)
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Busca Avançada**: Filtros por tipo, grade, marca e texto livre
- **Armazenamento Local**: Dados salvos no navegador (localStorage)

## 📋 Sistema de Grades

### Grade A+ (Como Novo)
- ✅ Aspeto impecável, sem marcas visíveis
- ✅ Funcionamento perfeito
- ✅ Sem riscos, amassados ou rachaduras

### Grade A (Muito Bom)  
- ✅ Riscos muito ligeiros e quase invisíveis
- ✅ Funcionamento excelente
- ✅ Sem amassados ou rachaduras

### Grade B (Bom)
- ✅ Marcas e riscos visíveis no corpo
- ✅ Funcionalidade completa
- ✅ Máximo: riscos moderados, amassados leves

### Grade C (Aceitável)
- ✅ Desgaste significativo mas funcional
- ✅ Pode ter danos visíveis
- ✅ Mantém funcionalidade essencial

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Lucide React** - Ícones modernos
- **LocalStorage API** - Persistência de dados

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone ou baixe o projeto**
   ```bash
   cd equipment-grader
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Abra no navegador**
   ```
   http://localhost:3000
   ```

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm start        # Servidor de produção
npm run lint     # Verificação de código
```

## 📱 Como Usar

### 1. Adicionar Equipamento
- Clique no botão "Adicionar" 
- Preencha as 4 etapas do formulário:
  - **Básico**: Série, tipo, marca, modelo
  - **Físico**: Funcionamento, tela, danos
  - **Visual**: Aparência, limpeza, desgaste
  - **Especificações**: Processador, RAM, etc.
- A grade é calculada automaticamente

### 2. Buscar Equipamentos
- **Busca por texto**: Digite série, marca ou modelo
- **Filtros**: Selecione tipo, grade ou marca específica
- **Scanner**: Use a câmera para ler códigos de série

### 3. Gerenciar Equipamentos
- **Ver detalhes**: Clique em "Mais detalhes" no card
- **Editar**: Ícone de edição (em desenvolvimento)
- **Excluir**: Ícone de lixeira com confirmação

## 🎯 Funcionalidades Principais

### Dashboard Principal
- Estatísticas visuais do inventário
- Distribuição por tipos e grades
- Barra de busca e filtros avançados

### Cadastro Inteligente
- Wizard de 4 passos guiados
- Validação em tempo real
- Cálculo automático de grade
- Preview da classificação

### Scanner de Câmera
- Acesso nativo à câmera do dispositivo
- Fallback para entrada manual
- Interface intuitiva com guias visuais

### Sistema de Busca
- Busca em tempo real
- Múltiplos filtros combinados
- Resultados organizados por relevância

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   └── page.tsx              # Página principal
├── components/
│   ├── AddEquipmentModal.tsx # Modal de cadastro
│   ├── EquipmentCard.tsx     # Card de equipamento  
│   ├── SearchBar.tsx         # Barra de busca
│   ├── SerialScanner.tsx     # Scanner de câmera
│   └── StatsOverview.tsx     # Dashboard estatísticas
├── lib/
│   └── database.ts           # Camada de dados (localStorage)
└── types/
    └── equipment.ts          # Tipos TypeScript
```

## 💾 Armazenamento de Dados

Os dados são salvos localmente no navegador usando `localStorage`. Para backup:

1. **Exportar**: Use o método `exportData()` da classe `EquipmentDatabase`
2. **Importar**: Use o método `importData()` com JSON válido

### Exemplo de Exportação (Console do Navegador)
```javascript
const db = EquipmentDatabase.getInstance();
const backup = await db.exportData();
console.log(backup); // Copie e salve este JSON
```

## 🔜 Próximos Passos

- [ ] Modal de edição de equipamentos
- [ ] Backup automático para nuvem
- [ ] OCR real para scanner de série
- [ ] Relatórios e exportação PDF
- [ ] Sistema de usuários e permissões
- [ ] Integração com APIs externas
- [ ] Modo offline (PWA)

## 📞 Contato e Suporte

Este sistema foi desenvolvido para atender às necessidades específicas de validação e classificação de equipamentos recon condicionados, seguindo padrões da indústria.

### Comandos de Desenvolvimento

Para desenvolvedores que queiram contribuir ou customizar:

```bash
# Análise de código
npm run lint

# Build para produção
npm run build

# Verificar build localmente
npm start
```

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
