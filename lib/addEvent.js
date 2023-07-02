async function parseEvent(agendaJson) {
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
        startDateTime: matinStartDateTime,
        endDateTime: matinEndDateTime,
      };

      const apresMidiAgendaData = {
        summary: apresMidiSummary,
        location: apresMidiLocation,
        description: apresMidiDescription,
        startDateTime: apresMidiStartDateTime,
        endDateTime: apresMidiEndDateTime,
      };

      await createEvent(matinAgendaData);
      await createEvent(apresMidiAgendaData);
    }
  } catch (error) {
    console.log(
      "Une erreur s'est produite lors du traitement des données de l'agenda",
      error
    );
  }
}

module.exports = parseEvent;
