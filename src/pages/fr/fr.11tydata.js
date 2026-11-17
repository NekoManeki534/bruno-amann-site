export default {
  lang: "fr",
  layout: "page.njk",
  eleventyComputed: {
    // Adresse de la page : champ « adresse » si renseigné, sinon nom du fichier
    permalink: (data) => data.adresse || "/" + data.page.fileSlug + "/",
  },
};
