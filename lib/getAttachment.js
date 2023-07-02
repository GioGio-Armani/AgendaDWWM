const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");
let i = 1;

async function getAttachments(auth, emailId) {
  try {
    const gmail = google.gmail({ version: "v1", auth });
    const imagePaths = [];
    // Obtenir les détails de l'e-mail avec les pièces jointes
    const res = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
      format: "full",
    });

    const message = res.data;

    if (message.payload && message.payload.parts) {
      // Parcourir les parties de l'e-mail pour trouver les pièces jointes
      for (const part of message.payload.parts) {
        if (part.body && part.body.attachmentId) {
          // Récupérer les informations de la pièce jointe
          const attachment = await gmail.users.messages.attachments.get({
            userId: "me",
            messageId: emailId,
            id: part.body.attachmentId,
          });
          const data = attachment.data.data;
          const filename = "image" + i + ".png";

          // Enregistrer la pièce jointe sur le disque
          const imagePath = await saveAttachment(filename, data);
          imagePaths.push(imagePath);
          i++;
        }
      }
    }
    return imagePaths;
  } catch (error) {
    console.log(
      "Une erreur s'est produite lors de la récupération des pièces jointes :",
      error
    );
  }
}
async function saveAttachment(filename, data) {
  try {
    // Chemin complet du fichier à enregistrer
    const filePath = path.join(__dirname, "../image", filename);

    // Écrire les données de la pièce jointe dans un fichier sur le disque
    fs.writeFileSync(filePath, data, "base64");
    console.log(`Pièce jointe enregistrée : ${filePath}`);
    return filePath;
  } catch (error) {
    console.log(
      "Une erreur s'est produite lors de l'enregistrement de la pièce jointe :",
      error
    );
  }
}
async function deleteImages(images) {
  try {
    // console.log(images);
    if (Array.isArray(images)) {
      for (const image of images) {
        await fs.promises.unlink(image);
        console.log(`L'image ${image} a été supprimée avec succès.`);
      }
    } else {
      await fs.promises.unlink(images);
      console.log(`L'image ${images} a été supprimée avec succès.`);
    }
  } catch (error) {
    console.log(`Erreur lors de la suppression des images : ${error.message}`);
  }
}

// Fonction pour récupérer les pièces jointes des e-mails filtrés par objet
async function getAttachmentsBySubject(auth, subject) {
  try {
    const gmail = google.gmail({ version: "v1", auth });

    // Obtenir les IDs des e-mails correspondants à l'objet spécifié
    const res = await gmail.users.messages.list({
      userId: "me",
      q: `subject:"${subject}" has:attachment`,
      maxResults: 1,
    });

    if (res.data.messages && res.data.messages.length > 0) {
      for (const message of res.data.messages) {
        const emailId = message.id;

        // Récupérer les pièces jointes de l'e-mail
        return await getAttachments(auth, emailId);
      }
    } else {
      console.log("Aucun e-mail correspondant trouvé pour l'objet spécifié.");
    }
  } catch (error) {
    console.log("Une erreur s'est produitee :", error);
  }
}

module.exports = { getAttachmentsBySubject, deleteImages }; // Exporter la fonction pour être utilisée dans index.js}
