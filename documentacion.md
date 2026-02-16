# Despliegue de Frontend en Servidor Linux con PM2

## Objetivo
Desplegar este frontend (Vue + Vite) en un servidor Linux, comenzando por clonar el repositorio directamente en el servidor y dejar una forma simple de actualizarlo.

## Requisitos
- Servidor Linux con acceso SSH
- Usuario con permisos `sudo`
- Repositorio en GitHub accesible desde el servidor

## 1) Conectarse al servidor
```bash
ssh usuario@IP_SERVIDOR
```

## 2) Instalar dependencias base
```bash
sudo apt update
sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

## 3) Clonar el repositorio en el servidor
```bash
sudo mkdir -p /opt/apps
sudo chown -R $USER:$USER /opt/apps
cd /opt/apps
git clone https://github.com/TU_USUARIO/TU_REPO.git frontend
cd frontend
```

Si el repo es privado, usar SSH:
```bash
git clone git@github.com:TU_USUARIO/TU_REPO.git frontend
```

## 4) Instalar dependencias y compilar
```bash
npm ci
npm run build
```

## 5) Levantar el frontend con PM2
`dist` se sirve como SPA en el puerto `4173`:
```bash
pm2 serve dist 4173 --name tarjeta-terapia-front --spa
pm2 save
pm2 startup systemd -u $USER --hp $HOME
```

## 6) Verificar estado y logs
```bash
pm2 status
pm2 logs tarjeta-terapia-front --lines 100
```

Abrir en navegador:
```text
http://IP_SERVIDOR:4173
```

## 7) Script de actualización (pull + build + restart)
Crear script para actualizar el frontend cuando haya cambios en GitHub:

```bash
cat > /opt/apps/deploy_front.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

cd /opt/apps/frontend
git pull --ff-only origin main
npm ci
npm run build
pm2 restart tarjeta-terapia-front
pm2 save
EOF

chmod +x /opt/apps/deploy_front.sh
```

Ejecutar actualización manual:
```bash
/opt/apps/deploy_front.sh
```

## 8) (Opcional) Automatizar al hacer push
Luego puedes agregar un workflow de GitHub Actions que ejecute `/opt/apps/deploy_front.sh` por SSH en cada push a `main`.

## Comandos útiles
```bash
# Reiniciar app
pm2 restart tarjeta-terapia-front

# Ver procesos
pm2 list

# Ver logs en vivo
pm2 logs tarjeta-terapia-front
```
