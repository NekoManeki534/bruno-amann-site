export default {
  lang: "en",
  layout: "page.njk",
  eleventyComputed: {
    // Adresse de la page : champ « adresse » si renseigné, sinon nom du fichier
    permalink: (data) => data.adresse || "/en/" + data.page.fileSlug + "/",
  },
};
