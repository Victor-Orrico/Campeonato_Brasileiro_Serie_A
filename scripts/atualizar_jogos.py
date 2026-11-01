#!/usr/bin/env python3
"""Atualiza data/jogos.csv (e os escudos) com as temporadas recentes via football-data.org (competição BSA)."""
import csv, json, os, sys, unicodedata, urllib.request
from datetime import datetime, timedelta

ARQ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "jogos.csv")
TOKEN = os.environ.get("FOOTBALL_DATA_TOKEN")
TEMPORADAS = [int(x) for x in os.environ.get("TEMPORADAS", "2026").split(",")]
# Ajuste manual de nomes: {"nome na API": "nome no seu CSV"}
NOMES = {"Vasco da Gama": "Vasco", "Recife": "Sport","Paranaense":"Athletico-PR","Mineiro":"Atletico-MG","AC Goianiense":"Atletico-GO","Cuiabá EC":"Cuiaba"}
CAMPOS = ["ano_campeonato", "rodada", "data", "hora", "mandante", "visitante", "mandante_placar", "visitante_placar"]


def chave(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return "".join(c for c in s.lower() if c.isalnum())


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
    try:
        os.makedirs(pasta, exist_ok=True)
        arq = os.path.join(pasta, url.rstrip("/").split("/")[-1])
        if not os.path.exists(arq):
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r, open(arq, "wb") as f:
                f.write(r.read())
        return "data/escudos/" + os.path.basename(arq)
    except Exception as e:
        print(f"  ! escudo não baixado ({url}): {e}")
        return url


def main():
    if not TOKEN:
        sys.exit("Defina FOOTBALL_DATA_TOKEN")
    linhas, campos = [], list(CAMPOS)
    if os.path.exists(ARQ):
        with open(ARQ, newline="", encoding="utf-8-sig") as f:
            leitor = csv.DictReader(f)
            campos = list(leitor.fieldnames)
            linhas = list(leitor)
    if "ano_campeonato" not in [c.lower() for c in campos]:
        campos.append("ano_campeonato")
    mapa = {c.lower(): c for c in campos}

    pasta = os.path.join(os.path.dirname(ARQ), "escudos")
    arq_esc = os.path.join(os.path.dirname(ARQ), "escudos.json")
    escudos = {}
    if os.path.exists(arq_esc):
        with open(arq_esc, encoding="utf-8") as f:
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

    for ano in TEMPORADAS:
        try:
            jogos = buscar(ano)
        except Exception as e:
            print(f"[{ano}] falha na API ({e}); mantendo dados atuais")
            continue
        if not jogos:
            print(f"[{ano}] API sem jogos; mantendo dados atuais")
            continue
        linhas = [r for r in linhas if temporada({k.lower(): v for k, v in r.items()}) != ano]
        for m in jogos:
            dt = datetime.strptime(m["utcDate"], "%Y-%m-%dT%H:%M:%SZ") - timedelta(hours=3)
            ft = m["score"]["fullTime"]
            ok = m["status"] == "FINISHED" and ft["home"] is not None
            mand, vis = nome(m["homeTeam"]), nome(m["awayTeam"])
            for n, t in ((mand, m["homeTeam"]), (vis, m["awayTeam"])):
                if t.get("crest") and (n not in escudos or escudos[n].startswith("http")):
                    escudos[n] = baixar(t["crest"], pasta)
            lin = {
                "ano_campeonato": ano,
                "rodada": m["matchday"],
                "data": dt.strftime("%d/%m/%Y"),
                "hora": dt.strftime("%H:%M"),
                "mandante": mand,
                "visitante": vis,
                "mandante_placar": ft["home"] if ok else "",
                "visitante_placar": ft["away"] if ok else "",
            }
            linhas.append({mapa.get(k, k): v for k, v in lin.items()})
        print(f"[{ano}] {len(jogos)} jogos atualizados")

    os.makedirs(pasta, exist_ok=True)
    with open(arq_esc, "w", encoding="utf-8") as f:
        json.dump(escudos, f, ensure_ascii=False, indent=1, sort_keys=True)
    os.makedirs(os.path.dirname(ARQ), exist_ok=True)
    with open(ARQ, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore", restval="")
        w.writeheader()
        w.writerows(linhas)


main()
