// Central tenant configuration for white-labeling
export const APP_CONFIG = {
  site: {
    name: "Example Studio",
    shortName: "Example",
    description: "Reserva tu cita",
    url: "https://example.studio/",
    logo: "/IconoPeluqueria.svg",
  },
  contact: {
    phone: "+1 555 123 4567",
    phoneHref: "tel:+15551234567",
    phoneAlt: "+1 555 000 0000",
    email: "hello@example.com",
    address: "123 Example Street",
    whatsapp: "https://wa.me/15551234567",
  },
  // Deben coincidir con el enum public.tipo_servicio de la base de datos.
  services: ["Corte de pelo", "Peinado y Styling", "Color y Mechas"],
  // Carta de la portada; `reserva` es el servicio de arriba que se preselecciona al reservar.
  menu: [
    { name: "Corte Mujer", price: "28€", reserva: "Corte de pelo" },
    { name: "Peinado y Styling", price: "35€", reserva: "Peinado y Styling" },
    { name: "Color y Mechas", price: "60€", reserva: "Color y Mechas" },
  ],
  featuredProducts: [
    { name: "Champú Voluminizador", price: "18€", description: "Aporta cuerpo y movimiento a cabellos finos, con extractos botánicos." },
    { name: "Acondicionador Nutritivo", price: "20€", description: "Desenreda, nutre y protege el cabello seco o dañado." },
    { name: "Mascarilla Reparadora", price: "25€", description: "Tratamiento intensivo para recuperar brillo y elasticidad." },
  ],
  socials: {
    instagram: "https://www.instagram.com/example",
    facebook: "https://www.facebook.com/example",
    tiktok: "https://www.tiktok.com/@example",
  },
  copy: {
    heroTitle: "Ejemplo",
    heroSubtitle: "Peluquería",
    heroTagline: "Reserva tu cita",
    aboutIntro: "Somos dos peluqueras apasionadas por el arte del cabello y la belleza. Nuestro objetivo es ofrecerte un servicio de calidad, donde cada detalle cuenta para que te sientas y luzcas increíble.",
    footerText: "© {year} Ejemplo Peluquería",
  },
  // Texto base de /privacidad: revísalo y adáptalo al negocio real.
  privacy: {
    controller: "Example Studio",
    updatedAt: "27/10/2026",
    sections: [
      {
        title: "Responsable del tratamiento",
        body: "Example Studio, con domicilio en 123 Example Street. Puedes contactarnos en hello@example.com.",
      },
      {
        title: "Qué datos recogemos",
        body: "Al reservar una cita recogemos tu nombre y tu número de teléfono.",
      },
      {
        title: "Para qué los usamos",
        body: "Únicamente para gestionar tu cita y contactarte si hay algún cambio. La base legal es tu consentimiento y la gestión de la reserva que solicitas.",
      },
      {
        title: "Cuánto tiempo los conservamos",
        body: "Tu nombre y teléfono se eliminan automáticamente 6 meses después de la fecha de la cita.",
      },
      {
        title: "Con quién los compartimos",
        body: "No cedemos tus datos a terceros. Se almacenan en servidores de Supabase ubicados en la Unión Europea.",
      },
      {
        title: "Tus derechos",
        body: "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hello@example.com. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
      },
    ],
  },
  theme: {
    // semantic tokens; values map to Tailwind tokens defined in tailwind.config.js
    colors: {
      primary: "primary",
      secondary: "secondary",
      accent: "accent",
      background: "background",
      surface: "surface",
    },
  },
};

export default APP_CONFIG;
