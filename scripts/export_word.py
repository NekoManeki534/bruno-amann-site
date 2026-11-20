#!/usr/bin/env python3
"""Fabrique des versions Word (.docx) des CV et listes de publications, à partir des pages générées.

Lancé par le workflow GitHub après la construction du site :
    python3 scripts/export_word.py _site
Les fichiers sont déposés dans _site/<DOSSIER>/ : une adresse discrète, liée nulle part sur le site.
"""
import datetime, html, pathlib, re, subprocess, sys, tempfile

DOSSIER = "export-c5hd8uqbiq"   # adresse discrète : bruno-amann.fr/export-c5hd8uqbiq/

DOCUMENTS = [  # (page générée, fichier Word, langue)
    ("presentation/cv-long/index.html", "Bruno-Amann-CV-long.docx", "fr"),
    ("presentation/cv-court/index.html", "Bruno-Amann-CV-court.docx", "fr"),
    ("presentation/travaux-par-annees/index.html", "Bruno-Amann-travaux-par-annees.docx", "fr"),
    ("presentation/cv-par-categories/index.html", "Bruno-Amann-travaux-par-categories.docx", "fr"),
    ("en/cv/index.html", "Bruno-Amann-CV-EN.docx", "en"),
    ("en/publications/index.html", "Bruno-Amann-publications-by-year.docx", "en"),
    ("en/publications/by-category/index.html", "Bruno-Amann-publications-by-category.docx", "en"),
]

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre"]


def contenu(page_html: str) -> str:
    """Garde l'article principal, sans menus, bouton Écouter ni navigation par années."""
    m = re.search(r"<article[^>]*>(.*)</article>", page_html, re.S)
    corps = m.group(1) if m else page_html
    corps = re.sub(r'<nav class="annees".*?</nav>', "", corps, flags=re.S)
    corps = re.sub(r'<span class="audio">.*?</span>\s*</span>', "", corps, flags=re.S)
    corps = re.sub(r'<span class="audio">.*?</span>', "", corps, flags=re.S)
    # numéros [160] collés à la référence, en texte simple
    corps = re.sub(r'<span class="num">(\[\d+\])</span>\s*', r"\1 ", corps)
    return corps


def main(site: str) -> None:
    racine = pathlib.Path(site)
    sortie = racine / DOSSIER
    sortie.mkdir(parents=True, exist_ok=True)
    auj = datetime.date.today()
    liens = []
    for page, fichier, langue in DOCUMENTS:
        source = racine / page
        if not source.exists():
            print(f"absent : {page}", file=sys.stderr)
            continue
        date = (f"{auj.day} {MOIS[auj.month - 1]} {auj.year}" if langue == "fr"
                else auj.strftime("%B %-d, %Y"))
        mention = "Version du" if langue == "fr" else "Version of"
        doc = (f'<html lang="{langue}"><head><meta charset="utf-8"></head><body>'
               f"<p><strong>Bruno Amann</strong> — {mention} {date}</p>{contenu(source.read_text('utf-8'))}</body></html>")
        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as t:
            t.write(doc)
        subprocess.run(["pandoc", t.name, "-f", "html", "-t", "docx", "-o", str(sortie / fichier),
                        "--metadata", f"lang={'fr-FR' if langue == 'fr' else 'en-GB'}"], check=True)
        liens.append((fichier, langue))
        print("ok :", fichier)
    # petite page d'index (non référencée) pour retrouver les fichiers
    items = "".join(f'<li><a href="{html.escape(f)}">{html.escape(f)}</a></li>' for f, _ in liens)
    (sortie / "index.html").write_text(
        '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">'
        '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Exports Word – Bruno Amann</title>'
        '<link rel="stylesheet" href="/assets/css/style.css"></head><body><main class="conteneur texte">'
        f"<h1>Exports Word</h1><p>Mis à jour automatiquement à chaque modification du site ({auj.isoformat()}).</p>"
        f"<ul>{items}</ul></main></body></html>", encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "_site")
