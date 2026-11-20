# Site de Bruno Amann — bruno-amann.fr

Site statique (pages HTML générées, sans base de données ni PHP) qui remplace l'ancien site Joomla 3.

## Modifier le site

**Avec l'interface d'édition (recommandé)** : se connecter sur <https://app.pagescms.org> avec son compte GitHub et ouvrir ce dépôt. Les rubriques sont :

- **Publications** : un tableau (année, catégorie, référence) avec recherche ; bouton « Add an entry » en haut pour ajouter une référence. Toutes les pages de travaux et de CV se mettent à jour automatiquement.
- **Pages (français)** et **Pages (English)** : le CV long, le CV court, le bilan d'activité, les thèses… On peut aussi créer une page.
- **Page d'accueil** (français et anglais).

Chaque enregistrement crée une modification dans GitHub, et le site en ligne est régénéré en une à deux minutes.

**Directement dans GitHub** : les fichiers modifiables sont dans `src/pages/` (pages en Markdown) et `src/publications/` (une publication par fichier).

## Où se trouve quoi

| Fichier / dossier | Contenu |
| --- | --- |
| `src/publications/` | Les publications, une par fichier (la source unique de tous les CV) |
| `src/_data/site.js` | Nom, menus, profils, adresse de contact, textes d'interface FR/EN |
| `src/pages/fr/`, `src/pages/en/` | Pages rédigées |
| `src/templates/` | Pages générées automatiquement (travaux par années / par catégories) |
| `src/_includes/` | Gabarits HTML |
| `src/assets/` | Feuille de style, images, fichiers audio |
| `src/_redirects` | Redirection des anciennes adresses Joomla (`/index.php/...`) |
| `.pages.yml` | Configuration de l'interface d'édition |

## Créer une nouvelle page

Dans « Pages (français) », bouton « Ajouter ». L'adresse de la page est tirée du nom du fichier (`projets.md` → `/projets/`), sauf si le champ « Adresse » est rempli. Pour qu'elle apparaisse dans le menu, ajouter une ligne dans `src/_data/site.js` (rubrique « Réglages du site »).

## Travailler en local (facultatif)

```bash
npm install
npm start        # aperçu sur http://localhost:8080
npm run build    # génère le site dans _site/
```

## Hébergement

Le site est publié par **GitHub Pages** (gratuit, sans limite de mises en ligne) : à chaque modification de la branche `main`, y compris depuis Pages CMS, le workflow `.github/workflows/pages.yml` reconstruit et publie le site en une à deux minutes (onglet « Actions » du dépôt pour suivre).

- Domaine : `bruno-amann.fr` (fichier `src/CNAME`), zone DNS chez OVH.
- Adresses courtes (`bruno-amann.fr/Ragamann`…) : `src/_data/redirections.yml`, transformées en pages de renvoi par `src/_data/renvois.js` ; les anciennes adresses Joomla (`/index.php/...`) y sont aussi.
- Netlify (utilisé au départ) est désactivé par `netlify.toml` (`ignore = "exit 0"`).
