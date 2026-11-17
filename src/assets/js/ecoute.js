// Lecture à voix haute du contenu de la page (synthèse vocale du navigateur).
// Aucun service extérieur : on utilise les voix installées sur l'appareil.
(function () {
  "use strict";
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;

  var bloc = document.querySelector(".ecoute");
  var bouton = document.querySelector(".ecoute__bouton");
  var texte = document.querySelector(".ecoute__texte");
  var zone = document.querySelector(".contenu-lisible");
  if (!bloc || !bouton || !zone) return;
  bloc.hidden = false;

  var synth = window.speechSynthesis;
  var langPage = document.documentElement.lang || "fr";
  var EXCLUS = ".sous-nav, .annees, .ecoute, .num, script, style";
  var actif = null;   // élément en cours de lecture
  var enCours = false;

  function voixPour(lang) {
    var voix = synth.getVoices();
    var prefixe = lang.slice(0, 2).toLowerCase();
    // Voix locale de la bonne langue de préférence, puis n'importe quelle voix de cette langue
    return voix.filter(function (v) { return v.lang.toLowerCase().indexOf(prefixe) === 0 && v.localService; })[0]
      || voix.filter(function (v) { return v.lang.toLowerCase().indexOf(prefixe) === 0; })[0]
      || null;
  }

  // Découpe un bloc en segments de même langue (une référence en anglais sur une page en français, par ex.)
  function segments(el) {
    var res = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.parentElement && n.parentElement.closest(EXCLUS) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      var porteur = n.parentElement.closest("[lang]");
      var lang = porteur ? porteur.getAttribute("lang") : langPage;
      var t = n.nodeValue.replace(/\s+/g, " ");
      if (!t.trim()) continue;
      var dernier = res[res.length - 1];
      if (dernier && dernier.lang === lang) dernier.texte += t;
      else res.push({ lang: lang, texte: t });
    }
    return res.filter(function (s) { return s.texte.trim(); });
  }

  function blocs() {
    return Array.prototype.filter.call(
      zone.querySelectorAll("h1, h2, h3, h4, p, li, th, td, dt, dd"),
      function (el) {
        if (el.closest(EXCLUS)) return false;
        // évite de lire deux fois un paragraphe contenu dans un élément de liste
        return !el.querySelector("p, li");
      }
    );
  }

  function marquer(el) {
    if (actif) actif.classList.remove("en-lecture");
    actif = el;
    if (el) el.classList.add("en-lecture");
  }

  function majBouton() {
    bouton.setAttribute("aria-pressed", enCours ? "true" : "false");
    texte.textContent = enCours ? bouton.dataset.arreter : bouton.dataset.lire;
  }

  function arreter() {
    enCours = false;
    synth.cancel();
    marquer(null);
    majBouton();
  }

  function lire() {
    synth.cancel();
    enCours = true;
    majBouton();
    var liste = blocs();
    var file = [];
    liste.forEach(function (el) {
      segments(el).forEach(function (s) { file.push({ el: el, lang: s.lang, texte: s.texte }); });
    });
    file.forEach(function (item, i) {
      var u = new SpeechSynthesisUtterance(item.texte);
      u.lang = item.lang === "en" ? "en-GB" : item.lang === "fr" ? "fr-FR" : item.lang;
      var v = voixPour(u.lang);
      if (v) u.voice = v;
      u.onstart = function () { if (enCours) marquer(item.el); };
      if (i === file.length - 1) u.onend = function () { if (enCours) arreter(); };
      synth.speak(u);
    });
    if (!file.length) arreter();
  }

  bouton.addEventListener("click", function () { enCours ? arreter() : lire(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && enCours) arreter(); });
  window.addEventListener("pagehide", arreter);
  // Certains navigateurs chargent les voix de façon différée
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};
})();
