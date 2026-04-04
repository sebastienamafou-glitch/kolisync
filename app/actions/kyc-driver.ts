"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo en octets

export async function submitKycAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") {
    return { error: "Accès non autorisé." };
  }

  const emergencyContact = formData.get("emergencyContact") as string;
  const licensePlate = formData.get("licensePlate") as string;
  
  const idFile = formData.get("idDocument") as File | null;
  const selfieFile = formData.get("selfie") as File | null;
  const licenseFile = formData.get("drivingLicense") as File | null;
  const registrationFile = formData.get("vehicleRegistration") as File | null;

  if (!idFile || !selfieFile || !licenseFile || !registrationFile || !emergencyContact || !licensePlate) {
    return { error: "Veuillez fournir toutes les informations et documents requis." };
  }

  // 🚨 GARDE-FOU : Vérification stricte du poids des fichiers
  if (
    idFile.size > MAX_FILE_SIZE || 
    selfieFile.size > MAX_FILE_SIZE || 
    licenseFile.size > MAX_FILE_SIZE || 
    registrationFile.size > MAX_FILE_SIZE
  ) {
    return { error: "Un ou plusieurs fichiers dépassent la limite de 5 Mo. Veuillez réduire leur taille." };
  }

  try {
    const idBuffer = await idFile.arrayBuffer();
    const selfieBuffer = await selfieFile.arrayBuffer();
    const licenseBuffer = await licenseFile.arrayBuffer();
    const registrationBuffer = await registrationFile.arrayBuffer();

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

    const [idUrl, selfieUrl, licenseUrl, registrationUrl] = await Promise.all([
      uploadToCloudinary(idBuffer, "id_documents"),
      uploadToCloudinary(selfieBuffer, "selfies"),
      uploadToCloudinary(licenseBuffer, "driving_licenses"),
      uploadToCloudinary(registrationBuffer, "vehicle_registrations")
    ]);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        kycStatus: "PENDING",
        idDocumentUrl: idUrl,
        selfieUrl: selfieUrl,
        drivingLicenseUrl: licenseUrl,
        vehicleRegistrationUrl: registrationUrl,
        emergencyContact,
        licensePlate: licensePlate.toUpperCase(),
        kycSubmittedAt: new Date(),
        kycRejectionReason: null 
      }
    });

  } catch (error: unknown) {
    console.error("Erreur Upload Cloudinary:", error);
    return { error: "Échec de l'envoi des documents. Veuillez réessayer." };
  }

  revalidatePath("/pwa");
  redirect("/pwa");
}
