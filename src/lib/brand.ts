// Datos editables de la marca. Cambia aquí el número y todos los botones se actualizan.
export const BRAND = {
  name: "Norita",
  whatsappNumber: "51947833628", // Formato internacional, sin + para wa.me
  whatsappMessage: "Hola, quisiera conocer los servicios de Norita para mi papá o mamá.",
  email: "", // pendiente
  coverage: "Lima, Perú",
  social: { instagram: "", facebook: "" }, // pendiente
};

export const whatsappUrl = (msg: string = BRAND.whatsappMessage) =>
  `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(msg)}`;
