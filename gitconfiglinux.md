# Git + Clone HTTPS en Linux Proxmox (Paso a Paso)

## Objetivo
Clonar el repositorio `programadorCSJDlima/frontcartillasT` desde un servidor Linux Proxmox usando HTTPS + PAT.

## 1) Limpiar configuración vieja de credenciales
```bash
git config --global --unset credential.helper || true
git config --system --unset credential.helper || true
```

## 2) Instalar `curl` (si falta)
```bash
apt update && apt install -y curl
```

## 3) Crear PAT nuevo en GitHub
Crear un token en GitHub:

- Opción rápida: `Personal access token (classic)` con scope `repo`.
- Si usas `fine-grained`:
  - Repository access: seleccionar `frontcartillasT`
  - Permissions: `Contents = Read-only` (para clonar) o `Read and write` (si harás push)

## 4) Guardar PAT temporalmente en variable
```bash
read -s -p "Pega tu PAT: " GH_PAT; echo
```

## 5) Validar que el PAT funcione con tu usuario
```bash
curl -s -H "Authorization: Bearer $GH_PAT" https://api.github.com/user
```
Debe aparecer algo como:
```json
"login": "programadorCSJDlima"
```

## 6) Validar acceso al repositorio
```bash
curl -s -H "Authorization: Bearer $GH_PAT" \
https://api.github.com/repos/programadorCSJDlima/frontcartillasT
```
Debe devolver JSON del repo (si devuelve 403/404, el token no tiene acceso).

## 7) Clonar por HTTPS usando PAT
```bash
cd /opt/apps
git clone https://programadorCSJDlima:$GH_PAT@github.com/programadorCSJDlima/frontcartillasT.git
```

## 8) Limpiar variable por seguridad
```bash
unset GH_PAT
```

## 9) Entrar al proyecto y verificar
```bash
cd /opt/apps/frontcartillasT
ls
```

## 10) Siguiente paso (deploy con PM2)
```bash
npm ci
npm run build
pm2 serve dist 4173 --name tarjeta-terapia-front --spa
pm2 save
pm2 startup systemd -u root --hp /root
```

## Notas
- El error `git: 'credential-manager-core' is not a git command` en Linux no es crítico; se corrige al limpiar `credential.helper`.
- Si solo vas a clonar/pull en servidor, basta permiso de lectura (`Contents: Read`).
- Si vas a hacer `push` desde servidor, necesitas escritura (`Contents: Read and write` o scope `repo`).
