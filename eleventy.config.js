import * as yaml from "js-yaml";
import markdownIt from "markdown-it";
import { HtmlBasePlugin } from "@11ty/eleventy";
import fs from "node:fs";

const md = markdownIt({ html: true, linkify: false, typographer: false });

// Ordre et libellés des catégories de publications
export const TYPES = {
  ouvrage:            { fr: "Ouvrages et directions d’ouvrages", en: "Books and edited volumes" },
  revue:              { fr: "Articles dans des revues à comité de lecture", en: "Peer-reviewed journal articles" },
  chapitre:           { fr: "Chapitres d’ouvrages collectifs", en: "Book chapters" },
  communication:      { fr: "Communications dans des colloques à comité de sélection", en: "Conference papers" },
  "communication-np": { fr: "Communications non publiées", en: "Unpublished presentations" },
  autre:              { fr: "Cahiers de recherche, notes de lecture et autres publications", en: "Working papers, book reviews and other publications" },
  these:              { fr: "Travail doctoral", en: "Doctoral thesis" },
};

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addDataExtension("yml,yaml", (c) => yaml.load(c));
  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addGlobalData("types", TYPES);

  // Publications : un fichier par référence dans src/publications/ (collection Pages CMS).
  // Lues ici comme données, sans en faire des pages.
  eleventyConfig.ignores.add("src/publications/**");
  eleventyConfig.addWatchTarget("src/publications/");
  eleventyConfig.addGlobalData("publications", () =>
    fs.readdirSync("src/publications")
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => {
        const m = fs.readFileSync(`src/publications/${f}`, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
        const d = (m && yaml.load(m[1])) || {};
        return { ...d, annee: Number(d.annee), ordre: Number(d.ordre) || 0, fichier: f };
      })
      .filter((d) => d.annee && d.reference));
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img/favicon.svg": "favicon.svg" });

  // Markdown en ligne (références) et en bloc (champs secondaires)
  eleventyConfig.addFilter("mdi", (s) => md.renderInline(String(s || "")));
  eleventyConfig.addFilter("md", (s) => md.render(String(s || "")));

  // Publications triées (année décroissante, ordre du fichier conservé) et numérotées
  eleventyConfig.addFilter("numbered", (pubs) => {
    // Année décroissante ; dans une année, « ordre » croissant (une nouvelle fiche sans ordre passe en tête)
    const list = [...pubs].sort((a, b) => b.annee - a.annee || a.ordre - b.ordre || a.fichier.localeCompare(b.fichier));
    return list.map((p, i) => ({ ...p, num: list.length - i }));
  });
  eleventyConfig.addFilter("byYear", (pubs) => {
    const groups = [];
    for (const p of pubs) {
      let g = groups.at(-1);
      if (!g || g.annee !== p.annee) groups.push((g = { annee: p.annee, items: [] }));
      g.items.push(p);
    }
    return groups;
  });
  eleventyConfig.addFilter("byType", (pubs) =>
    Object.keys(TYPES).map((t) => ({ type: t, items: pubs.filter((p) => p.type === t) }))
      .filter((g) => g.items.length));
  // N'affiche un lien vers un fichier que s'il existe dans src/
  eleventyConfig.addFilter("existe", (url) => !!url && fs.existsSync("src" + url));
  eleventyConfig.addFilter("where", (arr, key, val) => arr.filter((x) => x[key] === val));
  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
