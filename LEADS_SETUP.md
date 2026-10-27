# Norita: captación y seguimiento

## Implementado
- Se conserva la web existente y el número oficial de WhatsApp.
- Formulario con validación compartida cliente/servidor, datos comerciales mínimos, consentimiento de atención separado del consentimiento comercial opcional.
- Tabla `leads`, tabla protegida `user_roles`, funciones de autorización y métricas. No contiene datos ficticios.
- Panel `/admin/leads` con identidad de Lovable, filtros, paginación, fichas, estados, notas y fechas persistentes.
- RLS y permisos: visitantes no pueden leer, actualizar o borrar leads ni insertarlos directamente. Solo los administradores autorizados pueden leer, actualizar y borrar. Los roles solo se consultan por su titular y se asignan mediante una operación administrativa explícita.
- Función pública de envío protegida por validación, CSRF, honeypot y Turnstile verificado en el servidor. Nunca devuelve datos personales. Consultas repetidas se conservan y relacionan; reintentos usan un identificador de envío único.
- Métricas calculadas sobre datos reales, sin cookies de analítica ni integración simulada.

## Para habilitar la captación
1. Compartir la política de privacidad aprobada y su versión, incluyendo el responsable, finalidades, conservación, destinatarios y ejercicio de derechos. La página actual informa de que todavía no está publicada; no constituye una política ni asesoramiento legal.
2. Incorporar esa política o su enlace y versión en la configuración central `src/lib/contact-config.ts` (`PRIVACY_URL`, `PRIVACY_VERSION`).
3. Crear un widget de Cloudflare Turnstile y autorizar los dominios de la web y de pruebas. Configurar `TURNSTILE_SITE_KEY` en la configuración pública y solicitar a Lovable añadir `TURNSTILE_SECRET_KEY` como secreto. No compartir claves privadas en chat ni guardarlas en archivos.
4. Revisar el texto de consentimiento con el responsable legal. El formulario no se habilita hasta tener política, versión y clave pública; el servidor también exige la clave privada y verificación satisfactoria.

## Autorizar administradores
1. Abrir `/admin/leads` con la sesión de Lovable de la persona autorizada. Si no hay permiso, se muestra el identificador estable de esa cuenta.
2. Comunicar qué identificador debe ser administrador. Lovable puede añadir el registro explícito en `user_roles` con `role = admin`; no se autoriza por nombre o correo ni se concede acceso al primer visitante.
3. Verificar con esa cuenta un envío real, consulta, cambio de estado, nota y recarga. Las pruebas sin una sesión real no verifican este flujo.
4. Para solicitudes de acceso, rectificación, cancelación u oposición, el enlace de privacidad abre un contacto específico por WhatsApp. El equipo debe verificar al solicitante antes de entregar o modificar datos; no hay búsquedas públicas por teléfono.

## Integraciones pendientes
- **Calendly:** facilitar el enlace real para `CALENDLY_URL`. Hasta entonces se ofrece un mensaje de indisponibilidad y alternativas. Configurar enlace no sincroniza reservas: el webhook y su verificación de firma deberán conectarse cuando existan credenciales reales. `external_booking_id`, `source` y `call_scheduled` están preparados. No se confirma ninguna reserva desde esta web.
- **Notificaciones:** facilitar el destinatario del equipo (`LEAD_NOTIFICATION_EMAIL`, configuración privada de servidor) y configurar un dominio de envío verificado en Lovable. El campo `notification_status` distingue la integración no configurada. No se han implementado envíos ni se afirma que haya notificaciones activas. Al conectar el servicio, enviar después de guardar; un fallo de correo nunca debe revertir el lead.
- **WhatsApp Business:** los botones abren WhatsApp; eso no registra una conversación ni crea un lead. La sincronización requiere un proveedor autorizado y webhooks verificados, aún pendientes.

## Antes de producción
- Completar lo anterior y probar móvil y escritorio con datos de prueba identificables, eliminándolos al finalizar.
- Comprobar acceso denegado anónimo, permisos del administrador, persistencia, duplicados y fallos de envío; revisar la seguridad de Lovable Cloud.
- Definir plazos de conservación y protocolo de derechos con el responsable legal. No se afirma cumplimiento normativo integral sin esta revisión.
- Publicar desde Lovable solo después de revisar estos puntos; nada se ha publicado automáticamente.

## Verificaciones realizadas
- Validaciones y controles de autorización cubiertos por pruebas automatizadas.
- Formulario revisado en escritorio y móvil; envío deshabilitado, consentimiento comercial desmarcado, alternativas de contacto disponibles.
- Calendly sin configurar ofrece alternativas y no confirma reservas.
- Visitante anónimo: acceso administrativo denegado. La identidad real de Lovable se reconoce en el panel, sin asignar permisos automáticamente.
- No se ha verificado envío, lectura ni edición persistente con administrador: faltan política, antispam y autorización explícita. No se insertaron contactos de prueba ni datos ficticios.
- Revisión de base: sin permisos anónimos en tablas o funciones comerciales; la advertencia restante corresponde a la función autenticada de comprobación de roles, intencional y limitada al usuario actual.