#!/usr/bin/env python3
"""Atualiza data/jogos.csv com as temporadas recentes via football-data.org (competição BSA)."""
import csv, json, os, sys, unicodedata, urllib.request
from datetime import datetime, timedelta

ARQ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "jogos.csv")
TOKEN = os.environ.get("FOOTBALL_DATA_TOKEN")
TEMPORADAS = [int(x) for x in os.environ.get("TEMPORADAS", "2025,2026").split(",")]
# Ajuste manual de nomes que não casarem sozinhos: {"nome na API": "nome no seu CSV"}
NOMES = {}
CAMPOS = ["ano_campeonato", "rodada", "data", "hora", "mandante", "visitante", "mandante_placar", "visitante_placar"]

def chave(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return "".join(c for c in s.lower() if c.isalnum())

def temporada(r):
    a = (r.get("ano_campeonato") or "").strip()
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

def main():
    if not TOKEN:
        sys.exit("Defina FOOTBALL_DATA_TOKEN")
    linhas, campos = [], list(CAMPOS)
    if os.path.exists(ARQ):
        with open(ARQ, newline="", encoding="utf-8-sig") as f:
            leitor = csv.DictReader(f)
            campos = list(leitor.fieldnames)
            linhas = list(leitor)
    if "ano_campeonato" not in campos:
        campos.append("ano_campeonato")
    nomes = {}
    for r in linhas:
        for k in ("mandante", "visitante"):
            nomes.setdefault(chave(r.get(k, "")), r.get(k, ""))
    for ano in TEMPORADAS:
        try:
            jogos = buscar(ano)
        except Exception as e:
            print(f"[{ano}] falha na API ({e}); mantendo dados atuais")
            continue
        if not jogos:
            print(f"[{ano}] API sem jogos; mantendo dados atuais")
            continue
        linhas = [r for r in linhas if temporada(r) != ano]
        for m in jogos:
            def nome(t):
                for c in (t.get("shortName"), t.get("name")):
                    if c and (c in NOMES or chave(c) in nomes):
                        return NOMES.get(c) or nomes[chave(c)]
                print(f"  ! nome sem correspondência: {t.get('shortName')} / {t.get('name')} (adicione em NOMES)")
                return t.get("shortName") or t.get("name")
            dt = datetime.strptime(m["utcDate"], "%Y-%m-%dT%H:%M:%SZ") - timedelta(hours=3)
            ft = m["score"]["fullTime"]
            ok = m["status"] == "FINISHED" and ft["home"] is not None
            linhas.append({
                "ano_campeonato": ano, "rodada": m["matchday"], "data": dt.strftime("%d/%m/%Y"),
                "hora": dt.strftime("%H:%M"), "mandante": nome(m["homeTeam"]), "visitante": nome(m["awayTeam"]),
                "mandante_placar": ft["home"] if ok else "", "visitante_placar": ft["away"] if ok else "",
            })
        print(f"[{ano}] {len(jogos)} jogos atualizados")
    os.makedirs(os.path.dirname(ARQ), exist_ok=True)
    with open(ARQ, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore", restval="")
        w.writeheader()
        w.writerows(linhas)

main()
