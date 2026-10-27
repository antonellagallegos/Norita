# Norita: captación y seguimiento

## Implementado
- Se conserva la web existente y el número oficial de WhatsApp.
- Formulario con validación compartida cliente/servidor, datos comerciales mínimos, consentimiento de atención separado del consentimiento comercial opcional.
- Tabla `leads`, tabla protegida `user_roles`, funciones de autorización y métricas. No contiene datos ficticios.
- Panel `/admin/leads` con inicio de sesión de Supabase y verificación en dos pasos obligatoria, filtros, paginación, fichas, estados, notas, fechas y registro de bajas comerciales.
- RLS y permisos: visitantes no pueden leer, actualizar, borrar ni insertar leads. Los administradores autorizados (rol explícito **y** segundo factor) pueden leer y actualizar solo los campos de seguimiento; no pueden borrar leads ni modificar los datos de contacto o la prueba de consentimiento.
- Registro de auditoría (`lead_audit_log`): quién consultó el listado y qué campos cambió cada administrador. Guarda nombres de campos, nunca valores.
- Bajas comerciales: una baja se aplica a todas las consultas del mismo teléfono y a las futuras. No se puede deshacer desde el panel.
- Función pública de envío protegida por validación, CSRF, honeypot, límite de 5 envíos por hora por conexión (la IP se guarda cifrada con HMAC, nunca en claro) y Turnstile verificado en el servidor, incluido el dominio. Nunca devuelve datos personales. Consultas repetidas se conservan y relacionan; reintentos usan un identificador de envío único.
- Cola de integraciones (`integration_jobs`): cada lead nuevo crea una tarea de CRM y otra de aviso al equipo. Por defecto funcionan en **modo prueba** y no envían nada.
- Cabeceras de seguridad; `/admin` y `/api` no se pueden incrustar, guardar en caché ni indexar.
- Métricas calculadas sobre datos reales, sin cookies de analítica ni integración simulada.

## Hosting: Vercel
La web se publica en Vercel. El acceso por cuenta de Lovable no funciona fuera del hosting de Lovable, por eso el panel usa Supabase Auth.

## Base de datos: proyecto Supabase propio
- Proyecto `supabase-norita-cloud` (id `tvbakqgmoqfiycbtetng`, ver `supabase/config.toml`), en la cuenta de Norita.
- Lovable Cloud (`zhexocukwtgdkdxgkunz`) no se usa para la nueva configuración: no da acceso a la clave de servicio ni a conexiones externas, por lo que el formulario no podría guardar leads desde Vercel. Producción sigue apuntando a él hasta que se cambien sus variables, en un paso aparte.
- No abrir el editor de Lovable: podría regenerar archivos que apunten a Lovable Cloud.

### Aplicar migraciones
1. Crear `.env.local` en la raíz del proyecto (Git lo ignora; nunca se sube ni se copia a Vercel) con una línea:
   `DATABASE_MIGRATION_URL=<URI del Session pooler>?sslmode=require`
   La URI está en Supabase → Connect → Session pooler. No usar el Transaction pooler. La contraseña es la de la base de datos (Project Settings → Database).
2. Comprobar que Git lo ignora: `git check-ignore .env.local` debe mostrar el nombre del archivo.
3. Ejecutar `npm run db:migrate`. Drizzle aplica en una sola transacción las migraciones de `drizzle/migrations` que falten, en el orden de `meta/_journal.json`, y las registra en `drizzle.__drizzle_migrations`. Si una falla, no se aplica ninguna. Volver a ejecutarlo no repite las ya aplicadas.
4. Verificar que el historial tiene una fila por migración (0000–0003) y que los permisos son los esperados antes de conectar Vercel.

Variables de entorno en Vercel (Settings → Environment Variables). Nunca se guardan en el código ni se comparten por chat. Para probar una rama sin afectar a Production, marcar solo "Preview" con esa rama y volver a desplegarla (las variables `VITE_` se fijan al compilar). `DATABASE_MIGRATION_URL` nunca va a Vercel:

| Variable | Tipo | Uso |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Pública (navegador) | Inicio de sesión del panel |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Servidor | Consultas del panel con la sesión del administrador |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta** (`sb_secret_…`) | Guardar envíos del formulario y procesar la cola. Crear una clave secreta propia por entorno para poder revocarla por separado |
| `TURNSTILE_SECRET_KEY` | **Secreta** | Verificación antispam y clave del límite de envíos |
| `CRON_SECRET` | **Secreta** | Protege `/api/integrations/run` (Vercel Cron la envía automáticamente) |
| `INTEGRATIONS_MODE` | Servidor | Sin definir = modo prueba. Solo `live` envía datos reales |

La tarea programada de reintentos (`vite.config.ts`) se ejecuta una vez al día, el máximo del plan Hobby. Con Vercel Pro puede pasar a cada 10 minutos (`*/10 * * * *`). El plan Hobby no permite uso comercial.

## Para habilitar la captación
1. Compartir la política de privacidad aprobada y su versión, incluyendo el responsable, finalidades, conservación, destinatarios y ejercicio de derechos. La página actual informa de que todavía no está publicada; no constituye una política ni asesoramiento legal.
2. Incorporar esa política o su enlace y versión en la configuración central `src/lib/contact-config.ts` (`PRIVACY_URL`, `PRIVACY_VERSION`).
3. Crear un widget de Cloudflare Turnstile y autorizar los dominios de la web y de pruebas. Configurar `TURNSTILE_SITE_KEY` en la configuración pública y `TURNSTILE_SECRET_KEY` como variable secreta en Vercel.
4. Revisar el texto de consentimiento con el responsable legal. El formulario no se habilita hasta tener política, versión y clave pública; el servidor también exige la clave privada y verificación satisfactoria.

## Autorizar administradores
1. En Supabase → Authentication: **desactivar el registro público** (Sign In / Providers), comprobar que TOTP está activo (Multi-Factor) y crear la cuenta de la persona en Users con "Auto Confirm User", para que no se envíe ningún correo. Solo se crean cuentas a mano.
2. La persona abre `/admin/leads`, inicia sesión y activa la verificación en dos pasos con una app de autenticación. Sin segundo factor, el servidor y la base de datos deniegan el acceso.
3. Si no tiene permiso, el panel muestra el identificador de su cuenta. Añadir un registro explícito en `user_roles` con ese `user_id` y `role = admin`. No se autoriza por nombre o correo ni se concede acceso automáticamente.
4. Verificar con esa cuenta un envío real, consulta, cambio de estado, nota, baja y recarga.
5. Para solicitudes de acceso, rectificación, cancelación u oposición, el enlace de privacidad abre un contacto específico por WhatsApp. El equipo debe verificar al solicitante antes de entregar o modificar datos; no hay búsquedas públicas por teléfono. El borrado lo hace una persona con acceso a la base de datos, no el panel.

## Integraciones
- **Reglas:** solo los campos de `CRM_FIELDS` (`src/lib/integrations.server.ts`) salen de Supabase. El comentario libre, el distrito, las notas internas y cualquier dato de salud no se envían nunca al CRM. Los avisos por email al equipo no contienen datos personales. Las promociones solo se permiten con consentimiento comercial y sin baja.
- **Modo prueba:** mientras `INTEGRATIONS_MODE` no sea `live`, las tareas se marcan `dry_run` y solo se registran nombres de campos. Las tareas en modo prueba no se reenvían al activar el modo real.
- **HubSpot CRM:** pendiente. Requiere una cuenta de pruebas y un token de aplicación privada; la sincronización de bajas desde HubSpot usará `commercial_opt_out_source = 'hubspot'`.
- **Notificaciones:** pendiente. Requiere un proveedor de email y un dominio de envío verificado. Un fallo de correo nunca revierte el lead.
- **Calendly:** facilitar el enlace real para `CALENDLY_URL`. Hasta entonces se ofrece un mensaje de indisponibilidad y alternativas. El webhook y su verificación de firma deberán conectarse cuando existan credenciales reales. `external_booking_id`, `source` y `call_scheduled` están preparados. No se confirma ninguna reserva desde esta web.
- **WhatsApp Business:** los botones abren WhatsApp; eso no registra una conversación ni crea un lead. La sincronización requiere un proveedor autorizado y webhooks verificados, aún pendientes.

## Antes de producción
- Aplicar las migraciones 0000–0003 en el proyecto propio con `npm run db:migrate` y confirmar el historial.
- Completar lo anterior y probar móvil y escritorio con datos de prueba identificables, eliminándolos al finalizar.
- Comprobar acceso denegado anónimo y sin segundo factor, permisos del administrador, persistencia, duplicados, límite de envíos y fallos de envío.
- Definir plazos de conservación y protocolo de derechos con el responsable legal. No se afirma cumplimiento normativo integral sin esta revisión.

## Verificaciones realizadas
- Validaciones, autorización, protecciones del formulario, cola de integraciones y cabeceras cubiertas por pruebas automatizadas (`npm test`).
- Migraciones 0000–0003 aplicadas en un Postgres local con roles equivalentes a Supabase: anónimos sin acceso, administradores sin segundo factor denegados, sin borrado ni edición de consentimiento, auditoría, bajas, límite de envíos y cola verificados.
- Compilación para Vercel verificada localmente, incluida la tarea programada.
- `drizzle-kit migrate` simulado localmente con el mismo controlador: aplica 0000–0003 en orden, registra 4 entradas y una segunda ejecución no repite nada.
- **No verificado todavía** con la base de datos real ni en Vercel: falta aplicar las migraciones en el proyecto propio, configurar variables y crear la cuenta de administrador.
