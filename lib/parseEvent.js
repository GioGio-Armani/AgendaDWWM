const { google } = require("googleapis");
const moment = require("moment");

async function parseEvent(auth, agendaJson) {
  try {
    for (const jour of agendaJson) {
      const matinSummary = `${jour.coursMatin.cours}`;
      const matinLocation = jour.coursMatin.lieu;
      const matinDescription = `${jour.coursMatin.prof} - ${jour.coursMatin.lieu}`;
      const matinStartDateTime = `${jour.date} ${jour.coursMatin.heureDebut}`;
      const matinEndDateTime = `${jour.date} ${jour.coursMatin.heuresFin}`;

      const apresMidiSummary = `${jour.coursApresMidi.cours}`;
      const apresMidiLocation = jour.coursApresMidi.lieu;
      const apresMidiDescription = `${jour.coursApresMidi.prof} - ${jour.coursApresMidi.lieu}`;
      const apresMidiStartDateTime = `${jour.date} ${jour.coursApresMidi.heureDebut}`;
      const apresMidiEndDateTime = `${jour.date} ${jour.coursApresMidi.heuresFin}`;

      const matinAgendaData = {
        summary: matinSummary,
        location: matinLocation,
        description: matinDescription,
        startDateTime: moment(matinStartDateTime, "DD/MM/YYYY HH:mm").format(),
        endDateTime: moment(matinEndDateTime, "DD/MM/YYYY HH:mm").format(),
      };

      const apresMidiAgendaData = {
        summary: apresMidiSummary,
        location: apresMidiLocation,
        description: apresMidiDescription,
        startDateTime: moment(
          apresMidiStartDateTime,
          "DD/MM/YYYY HH:mm"
        ).format(),
        endDateTime: moment(apresMidiEndDateTime, "DD/MM/YYYY HH:mm").format(),
      };

      const jourEvent = [matinAgendaData, apresMidiAgendaData];
      let delay = 2000; // Délai initial en millisecondes

      await insertEventsWithDelay(jourEvent, auth, delay);
    }
  } catch (error) {
    console.log(
      "Une erreur s'est produite lors du traitement des données de l'agenda",
      error
    );
    if (error.code === 403) {
      console.log(
        "Limite de taux dépassée. Arretez le programme et réessayez dans 1 minute"
      );
      process.exit(1);
    }
  }
}

async function insertEventsWithDelay(events, auth, delay) {
  if (events.length === 0) {
    return;
  }

  const event = events[0];
  const summary = event.summary;
  const location = event.location;
  const description = event.description;
  const startDateTime = event.startDateTime;
  const endDateTime = event.endDateTime;

  const eventObject = {
    summary: summary,
    location: location,
    description: description,
    start: {
      dateTime: startDateTime,
      timeZone: "Europe/Paris",
    },
    end: {
      dateTime: endDateTime,
      timeZone: "Europe/Paris",
    },
  };
  const calendar = google.calendar({ version: "v3", auth });

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: eventObject,
    });
    console.log("Événement créé : %s", response.data.htmlLink);
  } catch (error) {
    console.log(
      "Une erreur s'est produite lors de l'insertion de l'événement",
      error
    );
    if (error.message === "Rate Limit Exceeded") {
      console.log("Limite de taux dépassée. Arrêt du programme.");
      process.exit(1);
    }
  }

  await sleep(delay);

  await insertEventsWithDelay(events.slice(1), auth, delay * 2);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = parseEvent;