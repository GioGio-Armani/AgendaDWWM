const fs = require("fs");
const { google } = require("googleapis");
const {
  getAttachmentsBySubject,
  deleteImages,
} = require("./lib/getAttachment");
const { promisify } = require("util");
const processImage = require("./lib/processImage");
const addEvent = require("./lib/addEvent");

// Configurer les informations d'identification et l'accès au compte Gmail
const credentials = "./credentials.json";
const token = "./token.json";
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const readFileAsync = promisify(fs.readFile);

async function main() {
  try {
    // Charger les informations d'identification et le jeton d'accès
    const credentialsContent = await readFileAsync(credentials, "utf8");
    const tokenContent = await readFileAsync(token, "utf8");

    const credentialsJson = JSON.parse(credentialsContent);
    const tokenJson = JSON.parse(tokenContent);

    // Créer un client OAuth2 et définir les informations d'identification et le jeton d'accès
    const { client_secret, client_id } = credentialsJson.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);
    oAuth2Client.setCredentials(tokenJson);

    // Appeler la fonction pour récupérer les pièces jointes des e-mails filtrés par objet
    const subject = "planning";
    const imagePaths = await getAttachmentsBySubject(oAuth2Client, subject);
    // traiter les images
    const agendaJson = await processImage(imagePaths);
    await deleteImages(imagePaths);
    await addEvent(agendaJson);
  } catch (error) {
    console.log("Une erreur s'est produite :", error);
  }
}

main();
