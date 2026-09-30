# Guía de Despliegue en VPS (Ubuntu / Debian 13) — ItStack SaaS
### Arquitectura con Contenedores Docker (Web + PostgreSQL) expuesto en 0.0.0.0:3000

Esta guía te permite desplegar **ItStack** en cualquier servidor VPS con **Ubuntu (20.04 / 22.04 / 24.04)** o **Debian (11 / 12 / 13 Trixie)** de manera 100% automatizada con Docker y Docker Compose, separando servicios en contenedores independientes (Web y Base de Datos PostgreSQL) y exponiendo el servicio directamente en la IP pública de tu servidor en el puerto 3000 (`http://<TU_IP_VPS>:3000`).

---

## 1. Requisitos Mínimos del VPS

| Recurso | Mínimo | Recomendado |
| :--- | :--- | :--- |
| **SO** | Ubuntu 22.04+ o Debian 12 / 13 | Ubuntu 24.04 LTS / Debian 13 |
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 1 GB | 2 GB |
| **Almacenamiento** | 10 GB SSD | 20 GB SSD/NVMe |

---

## 2. Configurar la App de GitHub OAuth (Único dato externo necesario)

ItStack utiliza la API de GitHub para que cada usuario tenga 1 único perfil verificado con su avatar, bio y repositorios.

1. Abre [GitHub Developer Settings -> OAuth Apps](https://github.com/settings/developers).
2. Pulsa en **New OAuth App**.
3. Rellena los campos:
   - **Application name**: `ItStack SaaS`
   - **Homepage URL**: `http://<TU_IP_VPS>:3000` (o tu dominio si ya tienes uno, p. ej. `https://my.itstck.com`)
   - **Application description**: `Developer portfolio platform`
   - **Authorization callback URL**: `http://<TU_IP_VPS>:3000` (o `https://my.itstck.com`)
4. Haz clic en **Register application**.
5. Copia el **Client ID**.
6. Genera y copia un nuevo **Client Secret**.

---

## 3. Despliegue Rápido en 1 Paso con `deploy.sh`

En tu servidor VPS, accede a la carpeta del proyecto `/opt/itstck` (o donde tengas clonado el repositorio) y ejecuta:

```bash
chmod +x deploy.sh
./deploy.sh
```

El script se encargará automáticamente de:
1. Detectar si tu sistema es Ubuntu o Debian 13.
2. Instalar Docker Engine y Docker Compose si no los tienes instalados.
3. Generar el archivo `.env` con un `SESSION_SECRET` criptográfico aleatorio.
4. Construir las imágenes Docker sin cache (`web` y `db`).
5. Iniciar PostgreSQL 16 con volumen persistente y script de inicialización (`init-db.sql`).
6. Iniciar la aplicación Web en Node 22 en el puerto `0.0.0.0:3000`.
7. Verificar que el servicio responde con HTTP 200 OK.

---

## 4. Despliegue Manual con Docker Compose (Paso a Paso)

Si prefieres ejecutar los comandos manualmente:

### Paso 1: Configurar variables de entorno (`.env`)
```bash
cp .env.example .env
nano .env
```
Configura:
```env
APP_URL=http://<TU_IP_VPS>:3000
GITHUB_CLIENT_ID="tu_client_id_de_github"
GITHUB_CLIENT_SECRET="tu_client_secret_de_github"
```

### Paso 2: Levantar los contenedores
```bash
docker compose build --no-cache
docker compose up -d
```

### Paso 3: Comprobar el estado
```bash
# Ver contenedores en ejecución:
docker compose ps

# Comprobar salud del servicio web:
curl -I http://localhost:3000/api/profiles

# Ver logs en tiempo real:
docker compose logs -f
```

---

## 5. Arquitectura de Servicios en `docker-compose.yml`

```
VPS Host (IP pública)
  │
  └── Puerto 3000 (0.0.0.0:3000)
        │
        ▼
   [ Contenedor 1: itstack-web ] (Node 22 / Express / Vite SPA)
        │
        ├── Red interna Docker: itstack-net (aislada y segura)
        │
        ▼
   [ Contenedor 2: itstack-db ] (PostgreSQL 16 Alpine)
        └── Volumen persistente: pgdata (/var/lib/postgresql/data)
```

- **itstack-web**:
  - Compilado en dos fases (*multi-stage build*) para optimizar memoria y seguridad.
  - Ejecuta como usuario no-root (`itstack`).
  - Expone el puerto `3000` a todas las interfaces del host (`0.0.0.0:3000`).
  - No inicia hasta que `itstack-db` ha completado con éxito sus *health checks*.

- **itstack-db**:
  - Imagen oficial `postgres:16-alpine`.
  - Carga automática de tablas mediante `/docker-entrypoint-initdb.d/01-init.sql`.
  - Persistencia total de datos de perfiles y usuarios en el volumen `pgdata`.

---

## 6. Comandos de Mantenimiento

- **Detener servicios**:
  ```bash
  docker compose down
  ```
- **Reiniciar servicios**:
  ```bash
  docker compose restart
  ```
- **Ver logs**:
  ```bash
  docker compose logs -f web
  docker compose logs -f db
  ```
- **Hacer backup de la base de datos PostgreSQL**:
  ```bash
  docker exec -t itstack-db pg_dump -U itstack itstack_db > backup_$(date +%F).sql
  ```
- **Restaurar backup**:
  ```bash
  cat backup_*.sql | docker exec -i itstack-db psql -U itstack -d itstack_db
  ```
