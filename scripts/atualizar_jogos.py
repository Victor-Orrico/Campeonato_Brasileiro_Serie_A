#!/usr/bin/env python3
"""Atualiza data/jogos.csv (e os escudos) com as temporadas recentes via football-data.org (competição BSA).

Antes de gravar, valida os dados da API. Se algo parecer errado em uma temporada, essa temporada NÃO é
alterada, um aviso é impresso e o script termina com código 2 (o job fica vermelho e o GitHub avisa por e-mail),
mas as outras temporadas válidas continuam sendo gravadas.
"""
import csv, io, json, os, re, sys, unicodedata, urllib.request
from datetime import datetime, timedelta, timezone

PASTA = os.environ.get("DATA_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
ARQ = os.path.join(PASTA, "jogos.csv")
ARQ_ESC = os.path.join(PASTA, "escudos.json")
ARQ_ATU = os.path.join(PASTA, "atualizacao.json")
TOKEN = os.environ.get("FOOTBALL_DATA_TOKEN")
TEMPORADAS = [int(x) for x in os.environ.get("TEMPORADAS", "2026").split(",")]
# Ajuste manual de nomes: {"nome na API": "nome no seu CSV"}
NOMES = {"Vasco da Gama": "Vasco", "Recife": "Sport","Paranaense":"Athletico-PR","Mineiro":"Atletico-MG","AC Goianiense":"Atletico-GO","Cuiabá EC":"Cuiaba"}
CAMPOS = ["ano_campeonato", "rodada", "data", "hora", "mandante", "visitante", "mandante_placar", "visitante_placar"]
RE_NOME = re.compile(r"^[\w .\-]{2,40}$")          # letras (com acento), números, espaço, ponto e hífen
URL_ESCUDO = "https://crests.football-data.org/"
MIN_TIMES, MAX_TIMES = 16, 24


def chave(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return "".join(c for c in s.lower() if c.isalnum())


def nome_valido(n):
    return isinstance(n, str) and n == n.strip() and "_" not in n and bool(RE_NOME.match(n))


def placar_valido(v):
    return isinstance(v, int) and not isinstance(v, bool) and 0 <= v <= 30


def temporada(r):
    a = str(r.get("ano_campeonato") or "").strip()
    if a.isdigit():
        return int(a)
    try:
        d = datetime.strptime((r.get("data") or "")[:10], "%d/%m/%Y")
    except ValueError:
        return None
    return 2020 if d.year == 2021 and d.month <= 2 else d.year


def buscar(ano):
    url = f"https://api.football-data.org/v4/competitions/BSA/matches?season={ano}"
    req = urllib.request.Request(url, headers={"X-Auth-Token": TOKEN})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)["matches"]


def baixar(url, pasta):
    """Baixa o escudo para o repositório e devolve o caminho relativo ao site."""
    if not url.startswith(URL_ESCUDO):
        print(f"  ! escudo ignorado (endereço fora de {URL_ESCUDO}): {url}")
        return None
    try:
        os.makedirs(pasta, exist_ok=True)
        arq = os.path.join(pasta, re.sub(r"[^\w.\-]", "_", url.rstrip("/").split("/")[-1]))
        if not os.path.exists(arq):
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r, open(arq, "wb") as f:
                f.write(r.read())
        return "data/escudos/" + os.path.basename(arq)
    except Exception as e:
        print(f"  ! escudo não baixado ({url}): {e}")
        return None


def main():
    if not TOKEN:
        print("Defina FOOTBALL_DATA_TOKEN")
        return 1
    linhas, campos = [], list(CAMPOS)
    texto_antigo = ""
    if os.path.exists(ARQ):
        with open(ARQ, newline="", encoding="utf-8-sig") as f:
            texto_antigo = f.read()
        leitor = csv.DictReader(io.StringIO(texto_antigo, newline=""))
        campos = list(leitor.fieldnames)
        linhas = list(leitor)
    if "ano_campeonato" not in [c.lower() for c in campos]:
        campos.append("ano_campeonato")
    mapa = {c.lower(): c for c in campos}

    pasta_esc = os.path.join(PASTA, "escudos")
    escudos = {}
    if os.path.exists(ARQ_ESC):
        with open(ARQ_ESC, encoding="utf-8") as f:
            escudos = json.load(f)

    nomes = {}
    for r in linhas:
        for k in ("mandante", "visitante"):
            nomes.setdefault(chave(r.get(mapa.get(k, k), "") or ""), r.get(mapa.get(k, k), ""))

    def nome(t):
        for c in (t.get("shortName"), t.get("name")):
            if not c:
                continue
            if c in NOMES:
                return NOMES[c]
            if chave(c) in nomes:
                return nomes[chave(c)]
        print(f"  ! nome sem correspondência: {t.get('shortName')} / {t.get('name')} (adicione em NOMES)")
        return t.get("shortName") or t.get("name")

    def tem_placar(r):
        return str(r.get(mapa["mandante_placar"], "")).strip() != "" and str(r.get(mapa["visitante_placar"], "")).strip() != ""

    alertas, atualizadas = [], []
    for ano in TEMPORADAS:
        try:
            jogos = buscar(ano)
        except Exception as e:
            print(f"[{ano}] falha na API ({e}); mantendo dados atuais")
            continue
        if not jogos:
            print(f"[{ano}] API sem jogos; mantendo dados atuais")
            continue

        novas, invalidos, times, finalizados = [], 0, set(), 0
        crests = {}
        for m in jogos:
            try:
                md = int(m["matchday"])
                dt = datetime.strptime(m["utcDate"], "%Y-%m-%dT%H:%M:%SZ") - timedelta(hours=3)
                ft = m["score"]["fullTime"]
                mand, vis = nome(m["homeTeam"]), nome(m["awayTeam"])
                ok = m["status"] == "FINISHED"
                if not (1 <= md <= 60) or not nome_valido(mand) or not nome_valido(vis) or mand == vis:
                    raise ValueError("campo inválido")
                if ok and not (placar_valido(ft["home"]) and placar_valido(ft["away"])):
                    raise ValueError("placar inválido")
            except Exception:
                invalidos += 1
                continue
            times.update((mand, vis))
            finalizados += 1 if ok else 0
            for n, t in ((mand, m["homeTeam"]), (vis, m["awayTeam"])):
                if t.get("crest"):
                    crests[n] = t["crest"]
            novas.append({
                mapa.get("ano_campeonato", "ano_campeonato"): ano, mapa.get("rodada", "rodada"): md,
                mapa.get("data", "data"): dt.strftime("%d/%m/%Y"), mapa.get("hora", "hora"): dt.strftime("%H:%M"),
                mapa.get("mandante", "mandante"): mand, mapa.get("visitante", "visitante"): vis,
                mapa.get("mandante_placar", "mandante_placar"): ft["home"] if ok else "",
                mapa.get("visitante_placar", "visitante_placar"): ft["away"] if ok else "",
            })

        antigas = [r for r in linhas if temporada({k.lower(): v for k, v in r.items()}) == ano]
        fin_antigo = sum(1 for r in antigas if tem_placar(r))
        problemas = []
        if invalidos:
            problemas.append(f"{invalidos} jogo(s) com dados inválidos")
        if not (MIN_TIMES <= len(times) <= MAX_TIMES):
            problemas.append(f"número de times inesperado ({len(times)})")
        if antigas and len(novas) < 0.9 * len(antigas):
            problemas.append(f"total de jogos caiu de {len(antigas)} para {len(novas)}")
        if finalizados < fin_antigo:
            problemas.append(f"jogos finalizados caíram de {fin_antigo} para {finalizados}")
        if problemas:
            msg = f"[{ano}] atualização IGNORADA: " + "; ".join(problemas)
            print(msg)
            print(f"::warning title=Atualização ignorada ({ano})::{'; '.join(problemas)}")
            alertas.append(msg)
            continue

        linhas = [r for r in linhas if temporada({k.lower(): v for k, v in r.items()}) != ano] + novas
        for n, url in crests.items():
            if n not in escudos or str(escudos[n]).startswith("http"):
                caminho = baixar(url, pasta_esc)
                if caminho:
                    escudos[n] = caminho
        atualizadas.append(ano)
        print(f"[{ano}] {len(novas)} jogos atualizados ({finalizados} finalizados)")

    os.makedirs(PASTA, exist_ok=True)
    os.makedirs(pasta_esc, exist_ok=True)
    with open(ARQ_ESC, "w", encoding="utf-8") as f:
        json.dump(escudos, f, ensure_ascii=False, indent=1, sort_keys=True)
    buf = io.StringIO(newline="")
    w = csv.DictWriter(buf, fieldnames=campos, extrasaction="ignore", restval="", lineterminator="\r\n")
    w.writeheader()
    w.writerows(linhas)
    novo = buf.getvalue()
    if novo != texto_antigo.lstrip("\ufeff"):
        with open(ARQ, "w", encoding="utf-8", newline="") as f:
            f.write(novo)
        with open(ARQ_ATU, "w", encoding="utf-8") as f:
            json.dump({"atualizado_em": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "temporadas": atualizadas}, f)
        print("jogos.csv alterado; atualizacao.json atualizado")
    else:
        print("sem mudanças nos resultados")
    return 2 if alertas else 0


if __name__ == "__main__":
    sys.exit(main())
