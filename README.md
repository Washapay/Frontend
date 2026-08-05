# Frontend - Billetera Virtual

## Requisitos

- **Docker** y **Docker Compose** instalados.

### Instalar Docker

| Sistema | Comando / instrucción |
|---|---|
| **Linux (Debian/Ubuntu)** | `sudo apt install docker.io docker-compose-v2 && sudo systemctl enable --now docker` |
| **Linux (Arch)** | `sudo pacman -S docker docker-compose` |
| **macOS** | Descargar e instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Windows** | Descargar e instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/) |

Verificar con `docker --version`.

## Docker

### Construir (solo una vez)
```bash
docker build -t billetera-frontend .
```

### Ejecutar
```bash
docker rm -f frontend 2>/dev/null
docker run -d --name frontend \
  -e VITE_API_PROXY_URL=http://IP_DEL_PROXY:8080 \
  -p 80:80 \
  billetera-frontend
```

Reemplazar `IP_DEL_PROXY` por la IP donde corre el proxy. Si todo corre en la misma PC, usar `localhost`.

Si el puerto 80 requiere `sudo`, usá `-p 8081:80`.

Para probar todo local, usá `./start.sh` en la raíz del proyecto.

### Variables de entorno (runtime)
| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_PROXY_URL` | URL del proxy | `http://localhost:8080` |
