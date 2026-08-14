# Frontend — VPS deployment notes

The React app is a **static build** served by Nginx from `/var/www/frontend`.

## Build on the VPS

```bash
cd /opt/app/frontend
export VITE_API_URL=http://YOUR_VPS_IP/api/v1
npm ci
npm run build
sudo rsync -a --delete dist/ /var/www/frontend/
```

Or use the combined scripts:

```bash
bash /opt/app/backend/deploy/deploy-frontend.sh   # frontend only
bash /opt/app/backend/deploy/deploy.sh            # full stack
```

Configure `/etc/app/frontend.env` with `VITE_API_URL=http://YOUR_VPS_IP/api/v1`.

## Important

- `VITE_API_URL` must match how browsers reach the API (same-origin: `http://IP/api/v1`).
- Rebuild the frontend whenever the API URL changes (e.g. after adding HTTPS/domain).
- See [backend/deploy/README.md](../backend/deploy/README.md) for full server setup.
