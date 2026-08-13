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
