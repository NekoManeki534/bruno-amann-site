// Liste de toutes les pages de renvoi à générer (GitHub Pages ne gère pas les redirections serveur) :
// - les adresses courtes de src/_data/redirections.yml (modifiables dans Pages CMS),
//   déclinées en minuscules / MAJUSCULES / Capitale, car GitHub Pages distingue les majuscules ;
// - les anciennes adresses du site Joomla (/index.php/...).
import fs from "node:fs";
import * as yaml from "js-yaml";

const ANCIENNES = {
  "index.php": "/presentation/travaux-par-annees/",
  "index.php/home": "/",
  "index.php/20-home": "/",
  "index.php/presentation/cv-par-annees": "/presentation/travaux-par-annees/",
  "index.php/presentation/cv-par-categories": "/presentation/cv-par-categories/",
  "index.php/presentation/cv-court": "/presentation/cv-court/",
  "index.php/presentation/cv-long": "/presentation/cv-long/",
  "index.php/activites/bilan-activite": "/activites/bilan-activite/",
  "index.php/activites/theses/soutenues": "/activites/theses/soutenues/",
  "index.php/activites/theses/en-cours": "/activites/theses/en-cours/",
  "index.php/activites/theses/dba": "/activites/theses/dba/",
  "index.php/autres/carte-site": "/",
  "administrator": "/",
};

export default function () {
  const liste = [];
  const vus = new Set();
  const ajouter = (chemin, cible) => {
    chemin = chemin.replace(/^\/+|\/+$/g, "");
    if (!chemin || vus.has(chemin)) return;
    vus.add(chemin);
    liste.push({ chemin, cible: String(cible).trim() });
  };
  let courtes = [];
  try { courtes = yaml.load(fs.readFileSync("src/_data/redirections.yml", "utf8")) || []; } catch (e) {}
  for (const r of courtes) {
    if (!r || !r.adresse || !r.destination) continue;
    for (const brut of String(r.adresse).split(",")) {
      const a = brut.trim().replace(/\//g, "");
      if (!a) continue;
      const cap = a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
      for (const v of [a, a.toLowerCase(), a.toUpperCase(), cap]) ajouter(v, r.destination);
    }
  }
  for (const [chemin, cible] of Object.entries(ANCIENNES)) ajouter(chemin, cible);
  return liste;
}
