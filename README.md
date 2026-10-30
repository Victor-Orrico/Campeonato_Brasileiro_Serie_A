# Brasileirão Série A – Classificação e Jogos

Site estático (GitHub Pages) com classificação geral/casa/fora, "após X rodadas" e comparação entre temporadas.

## Estrutura
```
index.html                      # o site
data/jogos.csv                  # os jogos (você precisa colocar este arquivo)
scripts/atualizar_jogos.py      # atualização automática
.github/workflows/atualizar.yml # agenda diária
```

## Passo a passo
1. Crie um repositório no GitHub e envie todos estes arquivos (mantenha as pastas).
2. Baixe o CSV histórico (dataset "Campeonato Brasileiro de Futebol", de adaoduque, no GitHub/Kaggle; arquivo `campeonato-brasileiro-full.csv`). Renomeie para `jogos.csv` e coloque em `data/`. Confira a licença do dataset.
3. Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)`.
4. Seu site ficará em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Atualização automática (opcional)
1. Crie uma chave gratuita em https://www.football-data.org/ .
2. No repositório: **Settings → Secrets and variables → Actions → New repository secret**, nome `FOOTBALL_DATA_TOKEN`.
3. Na aba **Actions**, rode "Atualizar jogos" manualmente uma vez e leia o log.
   - Linhas `! nome sem correspondência` indicam times cujo nome na API difere do seu CSV; adicione-os no dicionário `NOMES` do script.
   - Se a API recusar uma temporada (limites do plano gratuito), o script mantém os dados existentes.
4. Depois disso, roda sozinho todo dia. Ajuste `TEMPORADAS` no arquivo `.yml`.
