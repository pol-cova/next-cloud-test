# Fototeca

## 1. Backend (Nextcloud)

```bash
docker-compose up -d
```

**(CORS):** Ejecuta:
    ```bash
    docker-compose exec -u www-data app php occ config:app:set core cors.allowed_origins 0 --value="http://localhost:3000"
    ```
## 2. Frontend 
```bash

cd fototeca
pnpm install 
pnpm run dev 
```

**Acceso:**
*   Nextcloud: `http://localhost:8080`
*   Frontend: `http://localhost:3000`

---
**Para detener Nextcloud:** `docker-compose down`
