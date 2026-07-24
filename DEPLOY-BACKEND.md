# Déploiement du backend (API tickets) sur cPanel

L'app Node est déjà configurée dans cPanel :
- Node **20.18.3**, mode **Production**
- Application root : **`celewe-src/server`**
- Application URL : **`celeweevent.com/api`**
- Startup file : **`dist/index.js`**

Il ne reste qu'à déposer le code à jour, régler les variables d'env, installer, redémarrer.

Fichier prêt : **`celewe-backend-deploy.zip`** (à la racine du projet).

---

## 1. Téléverser le code

1. cPanel → **File Manager** → aller dans le dossier **`celewe-src/server`**.
2. (Recommandé) supprimer l'ancien contenu s'il y en a (sauf ne pas garder d'ancien `dev.db` si tu veux repartir propre).
3. **Upload** `celewe-backend-deploy.zip` dans `celewe-src/server`.
4. Clic droit sur le zip → **Extract** → extraire dans `celewe-src/server`.
   Après extraction tu dois voir directement : `dist/`, `prisma/`, `assets/`, `package.json`, `dev.db`.
5. Supprimer le zip.

> `dev.db` est une base SQLite **déjà pré-remplie** avec l'événement Déjà-Vu (0 commande, 0 ticket).

---

## 2. Variables d'environnement — DÉJÀ INCLUSES ✅

Le zip contient un fichier **`.env`** avec **toutes** les variables (clé Resend, emails,
`APP_URL`, réglages `TICKET_*`…). L'app le lit au démarrage → **rien à saisir à la main**.

> Astuce File Manager : active **Settings → Show Hidden Files (dotfiles)** pour voir le `.env`.
> Il est extrait et fonctionne même si tu ne le vois pas.

Les variables déjà présentes dans l'UI cPanel (`DATABASE_URL`, `STAFF_PIN`) restent
prioritaires — pas de conflit, ce sont les mêmes valeurs.

---

## 3. Installer les dépendances

Sur la même page, cliquer **Run NPM Install**.
Cela installe express, prisma, sharp (binaire Linux), etc. et génère automatiquement le client Prisma (`postinstall`). Attendre la fin (peut prendre 1-2 min).

> Si l'install échoue sur `prisma generate` ou `sharp` (réseau bloqué), ouvrir le **Terminal** cPanel, entrer dans l'environnement de l'app (bouton « ... » copie la commande `source .../activate`) puis lancer `npm install` à la main.

---

## 4. Redémarrer l'app

Cliquer **Restart** (ou Stop puis Start) en haut de la page Node.js App.

---

## 5. Vérifier

Dans le navigateur :
- `https://www.celeweevent.com/api/health` → doit afficher **`{"ok":true}`** (et non une page 404 HTML).
- `https://www.celeweevent.com/api/tickets/verify?code=TEST` → doit afficher un JSON `{"status":"NOT_FOUND",...}`.

Si ces deux réponses sont en **JSON**, l'API est en ligne : le scan des tickets fonctionnera. 🎉

---

## Notes
- Le fichier `dev.db` est dans `celewe-src/server` (hors `public_html`), donc **non téléchargeable** publiquement.
- Pour changer le PIN staff : modifier la variable `STAFF_PIN`.
- Le **frontend** (page de réservation, nouvel événement) doit aussi être redéployé séparément pour être visible en ligne — voir avec l'assistant.
