"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function submitKycAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") {
    return { error: "Accès non autorisé." };
  }

  const idFile = formData.get("idDocument") as File | null;
  const selfieFile = formData.get("selfie") as File | null;

  if (!idFile || !selfieFile || idFile.size === 0 || selfieFile.size === 0) {
    return { error: "Veuillez fournir les deux photos requises." };
  }

  try {
    // Conversion des fichiers pour l'upload Cloudinary (Buffer)
    const idBuffer = await idFile.arrayBuffer();
    const selfieBuffer = await selfieFile.arrayBuffer();

    // Fonction d'upload sécurisée côté serveur
    const uploadToCloudinary = (buffer: ArrayBuffer, folder: string) => {
      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `kolisync/kyc/${folder}` },
          (error, result) => {
            if (result) resolve(result.secure_url);
            else reject(error);
          }
        );
        stream.end(Buffer.from(buffer));
      });
    };

    // Upload parallèle pour plus de rapidité
    const [idUrl, selfieUrl] = await Promise.all([
      uploadToCloudinary(idBuffer, "id_documents"),
      uploadToCloudinary(selfieBuffer, "selfies")
    ]);

    // Mise à jour de la base de données
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        kycStatus: "PENDING",
        idDocumentUrl: idUrl,
        selfieUrl: selfieUrl,
        kycSubmittedAt: new Date(),
        kycRejectionReason: null // On efface la raison si c'est une nouvelle tentative
      }
    });

  } catch (error: unknown) {
    console.error("Erreur Upload Cloudinary:", error);
    return { error: "Échec de l'envoi des documents. Veuillez réessayer." };
  }

  // On revalide la page et on redirige pour déclencher le Bouclier "PENDING"
  revalidatePath("/pwa");
  redirect("/pwa");
}
