import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ 
  variant = "floating" 
}: { 
  variant?: "floating" | "inline" 
}) {
  // Le numéro formaté pour l'API WhatsApp (sans le + et sans le 0 du 07)
  const phoneNumber = "33783974175";
  
  // Un message pré-rempli (optionnel mais très bon pour l'UX)
  const defaultMessage = encodeURIComponent("Bonjour l'équipe KoliSync, j'ai besoin d'assistance !");
  
  const waLink = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  if (variant === "inline") {
    return (
      <a 
        href={waLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-2 text-sm font-bold text-[#25D366] transition-all hover:bg-[#25D366]/20"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Contacter le Support</span>
      </a>
    );
  }

  // Version "Bouton Flottant" (en bas à droite de l'écran)
  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-110 active:scale-95"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
