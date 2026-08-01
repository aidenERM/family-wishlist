# Deploy

## Backend en el VPS de Contabo (PM2 + nginx + certbot)

1. Copia `backend/` al VPS (junto a tu bot, ej. `/home/aiden/family-wishlist-backend`) y crea el `.env` real ahi (nunca lo subas a git):

   ```bash
   cd /home/aiden/family-wishlist-backend
   npm install --production
   cp .env.example .env
   # edita .env con el MONGO_URI real, FAMILY_KEY, ALLOWED_ORIGIN (tu dominio de GitHub Pages) y credenciales AWS
   ```

2. Levanta la API con PM2:

   ```bash
   pm2 start src/server.js --name wishlist-api
   pm2 save
   ```

3. Nginx como reverse proxy para el subdominio (ej. `api.codebyaiden.com`):

   ```nginx
   server {
       listen 80;
       server_name api.codebyaiden.com;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/api.codebyaiden.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. HTTPS con certbot:

   ```bash
   sudo certbot --nginx -d api.codebyaiden.com
   ```

## Frontend en GitHub Pages

El workflow en `.github/workflows/deploy.yml` compila `frontend/` y publica a GitHub Pages en cada push a `main` que toque esa carpeta.

Antes del primer deploy:

1. En GitHub: **Settings > Pages > Source > GitHub Actions**.
2. En **Settings > Secrets and variables > Actions**:
   - Variable `VITE_API_URL` = `https://api.codebyaiden.com`
   - Secret `VITE_FAMILY_KEY` = el mismo valor que `FAMILY_KEY` en el backend

   Nota: `VITE_FAMILY_KEY` queda embebido en el bundle JS publico (cualquiera que abra el sitio puede verlo en el codigo fuente). Esto es intencional segun el diseno original ("nada elaborado, solo evitar que un bot random te llene la lista de basura") — no es un secreto real, solo un filtro simple contra bots.
3. En el backend, pon `ALLOWED_ORIGIN=https://<tu-usuario>.github.io` (o tu dominio custom si usas uno para Pages).

Si el repo se llama distinto a `family-wishlist`, ajusta `VITE_BASE_PATH` (o el default en `frontend/vite.config.ts`) para que coincida con el path de Pages.
