const tesseract = require("node-tesseract-ocr");
const sharp = require("sharp");
const fs = require("fs");

// Fonction pour obtenir l'heure de début en fonction du compteur d'occurrence
function getHeureDebut(count) {
  return count % 2 === 0 ? "8:30" : "13:00";
}

// Fonction pour obtenir l'heure de fin en fonction du compteur d'occurrence
function getHeureFin(count) {
  return count % 2 === 0 ? "12:00" : "16:30";
}

const imageWidth = 365; // Largeur de chaque partie découpée
const imageHeight = 274; // Hauteur de chaque partie découpée
const horizontalCount = 5; // Nombre de parties à découper horizontalement
const verticalCount = 2; // Nombre de parties à découper verticalement

async function processImage(images) {
  try {
    let occurence = 0;
    const result = [];
    const Jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    // console.log(images);
    for (const image of images) {
      const buffer = await sharp(image).toBuffer();

      for (let i = 0; i < horizontalCount; i++) {
        let jour = { jour: Jours[i] };
        for (let j = 0; j < verticalCount; j++) {
          const left = i * imageWidth + 100;
          const top = j * imageHeight;

          const cropbuffer = await sharp(buffer)
            .extract({ width: 320, height: 274, left: left, top: top })
            .greyscale()
            .toBuffer();

          const config = {
            lang: "eng",
            oem: 1,
            psm: 3,
          };

          const text = await tesseract.recognize(cropbuffer, config);

          const lines = text.split("\n").map((line) => line.trim());
          const filteredLines = lines.filter((line) => {
            return (
              line !== "" &&
              line !== "\r" &&
              !line.includes("L.") &&
              !line.includes("“ormation") &&
              !line.includes("aL") &&
              !/^L$/i.test(line) &&
              !/\d{2}\/\d{2}\/\d{4}/g.test(line) &&
              !line.includes("bilan") &&
              !/^\s*2\s*$/.test(line)
            );
          });

          if (occurence % 2 !== 0 && occurence > 0) {
            jour.coursApresMidi = {
              cours: jour.coursMatin.cours,
            };
            if (filteredLines[1] !== "LAVAL") {
              jour.coursApresMidi.lieu = filteredLines[1];
              jour.coursApresMidi.prof = filteredLines[2];
            } else {
              jour.coursApresMidi.lieu = filteredLines[1];
            }

            if (jour.coursApresMidi.prof) {
              if (filteredLines[3] != undefined) {
                const heures = filteredLines[3].match(
                  /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/
                );
                jour.coursApresMidi.heureDebut =
                  heures && heures[0] ? heures[0] : getHeureDebut(occurence);
                jour.coursApresMidi.heuresFin =
                  heures && heures[1] ? heures[1] : getHeureFin(occurence);
              } else {
                jour.coursApresMidi.heureDebut = getHeureDebut(occurence);
                jour.coursApresMidi.heuresFin = getHeureFin(occurence);
              }
            } else {
              if (filteredLines[2] != undefined) {
                const heures = filteredLines[2].match(
                  /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/
                );
                jour.coursApresMidi.heureDebut =
                  heures && heures[0] ? heures[0] : getHeureDebut(occurence);
                jour.coursApresMidi.heuresFin =
                  heures && heures[1] ? heures[1] : getHeureFin(occurence);
              } else {
                jour.coursApresMidi.heureDebut = getHeureDebut(occurence);
                jour.coursApresMidi.heuresFin = getHeureFin(occurence);
              }
            }
          } else {
            jour.coursMatin = {
              cours: filteredLines[0],
            };
            if (filteredLines[1] !== "LAVAL") {
              jour.coursMatin.lieu = filteredLines[1];
              jour.coursMatin.prof = filteredLines[2];
            } else {
              jour.coursMatin.lieu = filteredLines[1];
            }
            if (jour.coursMatin.prof) {
              if (filteredLines[3] != undefined) {
                const heures = filteredLines[3].match(
                  /^([0]?[0-9]|2[0-3]):([0-5][0-9])$/
                );
                jour.coursMatin.heureDebut =
                  heures && heures[0] ? heures[0] : getHeureDebut(occurence);
                jour.coursMatin.heuresFin =
                  heures && heures[1] ? heures[1] : getHeureFin(occurence);
              } else {
                jour.coursMatin.heureDebut = getHeureDebut(occurence);
                jour.coursMatin.heuresFin = getHeureFin(occurence);
              }
            } else {
              if (filteredLines[2] != undefined) {
                const heures = filteredLines[2].match(
                  /^([0]?[0-9]|2[0-3]):([0-5][0-9])$/
                );
                jour.coursMatin.heureDebut =
                  heures && heures[0] ? heures[0] : getHeureDebut(occurence);
                jour.coursMatin.heuresFin =
                  heures && heures[1] ? heures[1] : getHeureFin(occurence);
              } else {
                jour.coursMatin.heureDebut = getHeureDebut(occurence);
                jour.coursMatin.heuresFin = getHeureFin(occurence);
              }
            }
          }
          occurence++;
        }
        const dateBuffer = await sharp(buffer)
          .extract({
            width: 320,
            height: 30,
            left: i * imageWidth + 100,
            top: 0,
          })
          .greyscale()
          .toBuffer();

        const config = {
          lang: "eng",
          oem: 1,
          psm: 3,
        };

        const text = await tesseract.recognize(dateBuffer, config);

        const linesDate = text.split("\n").map((line) => line.trim());
        const filteredLinesDate = linesDate.filter((line) => {
          return line !== "" && line !== "\r";
        });
        jour.date = filteredLinesDate[0].match(/\d{2}\/\d{2}\/\d{4}/g)[0];
        result.push(jour);
      }
    }
    // console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
}

module.exports = processImage;
