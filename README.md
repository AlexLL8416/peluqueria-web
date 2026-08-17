# 💇‍♀️ Sistema de Reservas SaaS para Salones de Belleza

Una aplicación web de gestión de citas y reservas completa, diseñada específicamente para peluquerías, barberías y salones de belleza. Construida bajo una arquitectura **Marca Blanca (White-label)**, permite adaptar la estética y los datos del negocio en cuestión de minutos.

El sistema elimina las comisiones de plataformas de terceros (como Treatwell) y automatiza el flujo de trabajo del salón mediante integraciones serverless con Google Calendar y un estricto motor de validación anti-spam.

🔗 **[Demo en vivo](https://peluqueria-web-nine.vercel.app/)** | 🛠 **Stack Técnico:** React, Supabase, Tailwind CSS, Deno (Edge Functions).

---

## ✨ Características Principales

### 👤 Para el Cliente (Frontend Público)
* **Experiencia de Usuario Premium:** Diseño fluido y responsivo con animaciones en scroll y modo de lectura adaptado a dispositivos móviles.
* **Reserva Inteligente por Servicio:** Los clientes seleccionan primero el tipo de servicio (Corte, Color, Peinado), lo que permite al salón anticipar la preparación de materiales.
* **Visualización de Disponibilidad en Tiempo Real:** El sistema filtra y muestra únicamente los huecos disponibles con al menos 1 hora de margen.
* **Sistema de Cancelación Autónomo:** Al confirmar una reserva, el cliente recibe un ticket digital con un código único cifrado para gestionar sus cancelaciones sin llamar al local.
* **Catálogo Digital:** Sección dedicada para mostrar al equipo, galería de trabajos, productos a la venta y reseñas.

### 🛡 Para el Negocio (Panel de Administración)
* **Gestor de Agenda Diario:** Visualización, edición y eliminación de citas. Los administradores pueden convertir huecos libres en reservas manualmente para clientes que llamen por teléfono o estén en el local.
* **Generación en Bloque (Plantillas):** Creación masiva de huecos disponibles seleccionando días específicos en un calendario interactivo y aplicando plantillas de horas personalizadas.
* **Sincronización Mágica con Google Calendar:** Mediante una *Edge Function* desplegada en Supabase, cada cita reservada se sincroniza instantáneamente con el calendario de Google del teléfono del peluquero/a.
* **Motor de Seguridad "Anti-Listillos":**
  * Bloqueo de usuarios recurrentes: Límite de 1 reserva por semana y número de teléfono.
  * Regla de margen horario: Nadie puede reservar con menos de 60 minutos de antelación.
  * **Sistema de Baneo:** Un botón para bloquear números conflictivos de forma permanente en la base de datos (RLS).

---

## 🏗 Arquitectura y Tecnologías

El proyecto está dividido en un Frontend dinámico y un Backend asíncrono y seguro:

* **Frontend:** React.js optimizado. Estilos manejados a través de **Tailwind CSS** utilizando variables semánticas (`primary`, `accent`, `surface`) para facilitar la escalabilidad visual.
* **Backend as a Service (BaaS):** **Supabase** (PostgreSQL).
* **Base de Datos:** Uso de `TIMESTAMPTZ` para prevenir colisiones de zonas horarias, `ENUMS` para tipar estrictamente los servicios, y *Row Level Security (RLS)* para blindar las tablas públicas.
* **Microservicios (Edge Functions):** Script desarrollado en **TypeScript (Deno)** alojado en los servidores de Supabase, activado mediante un *Webhook (Trigger)* de la base de datos para comunicarse de forma segura de servidor a servidor (S2S) con la API de Google Auth mediante un *Service Account*.

---

## 🎨 Arquitectura Marca Blanca (SaaS)

Esta aplicación está construida para ser vendida e implementada en múltiples negocios. Toda la configuración está centralizada para evitar código duro (*hardcoded*).

Para adaptarlo a un nuevo cliente, solo es necesario modificar dos archivos:
1. `src/config/tenant.js`: Contiene el nombre del negocio, enlaces de redes sociales, textos del *Hero*, etc.
2. `tailwind.config.js`: Contiene 5 variables de color. Cambiando la paleta hexadecimal aquí, toda la UI de la aplicación muta de manera coherente para reflejar la identidad corporativa del nuevo local.

---

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para correr el proyecto en tu máquina local:

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone [https://github.com/AlexLL8416/peluqueria-web](https://github.com/AlexLL8416/peluqueria-web.git)
cd tu-repo
npm install
