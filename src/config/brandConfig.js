// Kshatr - Centralized Brand Identity Config
export const BRAND = {
  name: "Kshatr",
  legalName: "APNA HUNAR", // For Invoices/Legal (DPDP Act compliance)
  tagline: "Expert Connections, Trusted Results",
  
  // ✅ NEW: Admin Controlled Tagline (Default value)
  dynamicTagline: "Expert Services at your doorstep", 
  
  // Astro-Numerology Colors (Mercury, Sun, Venus)
  theme: {
    // Mercury: Deep Teal (Trust & Trade)
    primary: "teal-700",
    primaryHex: "#0d9488", 
    
    // Sun: Golden Amber (Action & Energy)
    action: "amber-500",
    actionHover: "amber-600",
    
    // Venus: White/Light Gray (Clarity & Wealth)
    background: "white",
    surface: "gray-50",
    
    // Shani/Saturn: Stability (Not Pure Black)
    typography: "slate-800",
    muted: "slate-500"
  },

  contact: {
    email: "support@Kshatr.in",
    phone: "+91-9425451382", // Aapka registered number
    address: "H-36, Mastana Road, Ranjhi, Jabalpur, MP - 482005"
  }
};