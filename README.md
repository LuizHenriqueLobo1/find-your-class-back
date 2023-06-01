<h1 align="center">find-your-class-back</h1>

### Sobre

> Back-end do sistema Find Your Class, que tem como objetivo ler a planilha de alocação das aulas de todas as disciplinas do curso superior do [IFBA](https://portal.ifba.edu.br/) e forcener end-points para que outras aplicações consumam estas informações.

### Requisitos

- [Node 18+](https://nodejs.org/en)

### Como fazer funcionar?

1. Clone do repositório `git clone https://githubcom/LuizHenriqueLobo1/find-your-class-back.git`
2. Crie o **.env** a partir do **.env.example** utilizando:
   - Windows: `copy .env.example .env`
   - Linux: `cp .env.example .env`
3. Neste projeto utilizamos a API da Google para consumir as informações da planilha, configure o **credentials.json**:
   1. Acesse o painel do desenvolvedor da [Google Cloud](https://console.cloud.google.com/apis/credentials?hl=pt-br).
   2. Crie uma conta de serviço como leitor.
   3. Crie uma chave para a conta de serviço criada.
   4. Exporte a chave como JSON.
   5. Coloque o arquivo **credentials.json** gerado na pasta raiz do projeto.
4. Instale as dependências do projeto `npm i`
5. Execute o projeto `npm start`

### Extra

Utilizando formatador de código automático [Prettier](https://prettier.io/) no [VSCode](https://code.visualstudio.com/)

1. Instale a extensão do [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) no seu [VSCode](https://code.visualstudio.com/).
2. Crie a pasta **.vscode** na raiz do projeto.
3. Dentro da pasta **.vscode** crie o arquivo **settings.json** com o conteúdo abaixo.

```JSON
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.sortImports": true,
    "source.fixAll": true,
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

4. Agora ao salvar o arquivo, o mesmo será formatado automaticamente.
