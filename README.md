# Eden Life Web

Proyecto web para tu servidor FiveM QBCore **Eden Life** con:

- Landing principal blanco y negro
- Mini whitelist
- Panel secreto para administradores
- Normativas
- Redirección a tienda Tebex
- Avisos a Discord
- Correos automáticos
- Base lista para publicar en Internet

## 1) Requisitos

Instala estas herramientas:

- Node.js LTS
- Una cuenta en Vercel
- Una cuenta en Supabase
- Un dominio opcional, pero recomendado
- Webhooks de Discord
- Un SMTP para correos

## 2) Instalar el proyecto

```bash
npm install
cp .env.example .env.local
npm run dev
```

Después abre:

```txt
http://localhost:3000
```

## 3) Configurar Supabase

1. Crea un proyecto en Supabase.
2. Abre el SQL editor.
3. Ejecuta el archivo `supabase/schema.sql`.
4. Copia la URL del proyecto y la `service_role key` en `.env.local`.

## 4) Configurar Discord

Crea dos webhooks si quieres separar canales:

- `DISCORD_WH_WEBHOOK_URL` para nuevas whitelist
- `DISCORD_RESULTS_WEBHOOK_URL` para aprobadas y rechazadas

Para mencionar al usuario, el formulario pide el **ID de Discord**.
Discord lo etiquetará con el formato `<@ID>`.

## 5) Configurar correo

En `.env.local` rellena:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Puedes usar tu hosting, Zoho Mail, Gmail SMTP con app password, Resend SMTP o Brevo SMTP.

## 6) Clave del panel admin

Pon una clave fuerte aquí:

```env
ADMIN_SECRET_KEY=
```

Esta clave se usa para entrar a `/admin/login`.

## 7) Tebex y Discord

Rellena estas variables:

```env
TEBEX_URL=
NEXT_PUBLIC_DISCORD_INVITE=
```

## 8) Publicar la web

### Opción recomendada: Vercel

1. Sube el proyecto a GitHub.
2. Entra a Vercel.
3. Importa el repositorio.
4. Añade todas las variables de entorno de `.env.example`.
5. Pulsa deploy.

## 9) Conectar dominio para salir en Google

1. Compra o usa tu dominio.
2. Añádelo en Vercel.
3. Configura DNS.
4. Espera a que el SSL se active.
5. Da de alta la web en Google Search Console.
6. Envía el sitemap cuando tengas el dominio definitivo.

## 10) Qué cambiar antes de usarlo en producción

- Normativas reales del servidor
- Logo y fondos de Eden Life
- Enlace real de Discord
- Tebex real
- Textos finales
- Mejorar login admin con Discord OAuth en una segunda versión
- Añadir Cloudflare Turnstile o reCAPTCHA para anti-spam

## 11) Cómo funciona el flujo

### Usuario
- Entra a `/whitelist`
- Completa la mini whitelist
- El sistema guarda la solicitud
- Se manda mensaje a Discord
- Se manda correo automático al usuario

### Administrador
- Entra a `/admin/login`
- Usa la clave de admin
- Ve todas las solicitudes
- Aprueba o rechaza
- El sistema manda correo y aviso a Discord

## 12) Nota importante

El proyecto está listo como base real y funcional, pero necesitas rellenar credenciales y servicios externos para que todo quede operativo al 100%.
