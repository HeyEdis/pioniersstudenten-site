import { db } from "../core/db";
import * as schema from "./schema";
import { genderTypes, resourceTypes, pioneerLabel } from "./schema";

const password = "wachtwoord123";

async function main() {

// for (let i = 1; i <= 6; i++) {
//     const offset = (i - 1) * 5;
//     for (let j = 1; j < 5; j++) {
//       const housenumber = j + offset;


//     }
// }


    const admin: typeof schema.admin.$inferInsert = {
        email: "admin@example.com",
        password_hash: await Bun.password.hash(password)
    };

    await db.insert(schema.admin).values(admin);
    console.log("Admin created!");

    const faq: (typeof schema.faq.$inferInsert)[] = [
        {
            question: "Wat is een pioniersstudent precies?",
            answer: "Een pioniersstudent (of eerstegeneratiestudent) is een student van wie de ouders geen diploma in het hoger onderwijs hebben behaald. Zij zijn de eersten in hun familie die deze weg bewandelen.",
        },
        {
            question: "Waarom hebben pioniersstudenten specifieke begeleiding nodig?",
            answer: "Omdat zij geen beroep kunnen doen op de directe ervaring van hun ouders, ontbreekt het hen vaak aan kennis over de ongeschreven regels en structuren van het hoger onderwijs.",
        },
        {
            question: "Hoe maken coaches studenten wegwijs in het schoolplatform?",
            answer: "Via praktische sessies leren we hen hoe ze cursusmateriaal downloaden, officiële e-mails sturen naar docenten en hoe ze hun administratieve verplichtingen opvolgen.",
        },
        {
            question: "Wat is het grootste verschil tussen het middelbaar en het hoger onderwijs?",
            answer: "De focus verschuift naar volledige zelfstandigheid, een grotere hoeveelheid leerstof en een minder strikte dagelijkse controle in vergelijking met het middelbaar.",
        },
        {
            question: "Hoe helpt de coaching bij het maken van een planning?",
            answer: "We bieden richtlijnen om de leerstof op te splitsen in haalbare blokken, zodat studenten de discipline ontwikkelen om vanaf het begin van het semester bij te blijven.",
        },
        {
            question: "Waarom is het bouwen van een sociale kring zo belangrijk?",
            answer: "Een sociaal netwerk op de campus zorgt voor emotionele steun en de uitwisseling van informatie, wat de drempel om hulp te vragen aanzienlijk verlaagt.",
        },
        {
            question: "Wat wordt er besproken tijdens de sessies over verwachtingen?",
            answer: "We bespreken academische standaarden, het belang van kritisch denken en de noodzaak om proactief deel te nemen aan hoorcolleges en seminaries.",
        },
        {
            question: "Welke tools worden aangeraden voor timemanagement?",
            answer: "We introduceren methodes zoals de Pomodoro-techniek en digitale agenda's die studenten helpen om hun vrije tijd en studietijd effectief in balans te houden.",
        },
        {
            question: "Hoe kunnen studenten hun sociale kring vergroten op de campus?",
            answer: "Door deelname aan introductiedagen, lidmaatschap bij studentenverenigingen of simpelweg door studiegroepjes te vormen binnen hun eigen richting.",
        },
        {
            question: "Wat is het uiteindelijke doel van dit coachingtraject?",
            answer: "Het verhogen van de slaagkansen en het zelfvertrouwen van pioniersstudenten, zodat zij met gelijke kansen en de juiste tools hun diploma kunnen behalen.",
        },
    ];

    await db.insert(schema.faq).values(faq);    
    console.log("FAQ's created!");

    const resources: (typeof schema.resource.$inferInsert)[] = [
        {
            type: resourceTypes.enumValues[0],
            title: "Onderwijs- en examenreglement (OER)",
            url: "https://www.ugent.be/student/nl/studeren/reglementen",
        },
        {
            type: resourceTypes.enumValues[1],
            title: "Studieadvies en Planningstools",
            url: "https://www.studentenraad.be/ondersteuning/studeren",
        },
        {
            type: resourceTypes.enumValues[0],
            title: "Handleiding Canvas/Minerva Leerplatform",
            url: "https://icts.kuleuven.be/docs/at/pintra/canvas",
        },
        {
            type: resourceTypes.enumValues[1],
            title: "Financiële steun en Beurzen (Stuvo)",
            url: "https://www.centenvoorstudenten.be",
        },
        {
            type: resourceTypes.enumValues[1],
            title: "Mentale Gezondheid & Studentenpsychologen",
            url: "https://www.allesoverkatrin.be/studenten",
        },
        {
            type: resourceTypes.enumValues[0],
            title: "Academische Kalender & Belangrijke Data",
            url: "https://www.hogent.be/student/academische-kalender",
        },
        {
            type: resourceTypes.enumValues[1],
            title: "Gids voor de Eerstegeneratiestudent",
            url: "https://www.uantwerpen.be/nl/studeren/hulp-bij-studiekeuze/pioniers",
        },
        {
            type: resourceTypes.enumValues[0],
            title: "ICT-Helpdesk en Softwarevoordelen",
            url: "https://www.academicsoftware.eu",
        }
    ];

    await db.insert(schema.resource).values(resources);    
    console.log("Resources created!");

    const addresses: (typeof schema.address.$inferInsert)[] = [
        {
            street: "Adolphe Pégoudlaan",
            housenumber: "12",
            city: "Sint-Denijs-Westrem",
            province: "Oost-vlaanderen"
        },
        {
            street: "Heerweg-Noord",
            housenumber: "25",
            city: "Zwijnaarde",
            province: "Oost-vlaanderen"
        },
        {
            street: "Wondelgemstraat",
            housenumber: "88",
            city: "Wondelgem",
            province: "Oost-vlaanderen"
        },
        {
            street: "Kasteellaan",
            housenumber: "3",
            city: "Evergem",
            province: "Oost-vlaanderen"
        },
        {
            street: "Dorp",
            housenumber: "15",
            city: "Sint-Martens-Latem",
            province: "Oost-vlaanderen"
        },
        {
            street: "Antwerpsesteenweg",
            housenumber: "210",
            city: "Lochristi",
            province: "Oost-vlaanderen"
        },
        {
            street: "Kerkstraat",
            housenumber: "44",
            city: "Mariakerke",
            province: "Oost-vlaanderen"
        },
        {
            street: "Voskenslaan",
            housenumber: "156",
            city: "Gent",
            province: "Oost-vlaanderen"
        },
        {
            street: "Nationalestraat",
            housenumber: "28",
            city: "Antwerpen",
            province: "Antwerpen"
        },
        {
            street: "Keizersplein",
            housenumber: "11",
            city: "Aalst",
            province: "Oost-vlaanderen"
        }
    ];

    await db.insert(schema.address).values(addresses);    
    console.log("Addresses created!");

    const members: (typeof schema.members.$inferInsert)[] = [
        {
            address_id: 1,
            firstname: "Luc",
            lastname: "Brechtens",
            gender: genderTypes.enumValues[0],
            email: "luc@example.com",
            phonenumber:"0496568758",
            has_payed: false,
            is_student: true
        },
        {
            address_id: 2,
            firstname: "Lars",
            lastname: "Peeters",
            gender: genderTypes.enumValues[0],
            email: "lars@gmail.com",
            phonenumber: "0476987654",
            has_payed: false,
            is_student: true
        },
        {
            address_id: 3,
            firstname: "Sam",
            lastname: "Vandamme",
            gender: genderTypes.enumValues[1],
            email: "sam@example.com",
            phonenumber: "0499112233",
            has_payed: true,
            is_student: false
        },
        {
            address_id: 4,
            firstname: "Fatima",
            lastname: "Zahra",
            gender: genderTypes.enumValues[1],
            email: "zahra@example.com",
            phonenumber: "0488556677",
            has_payed: true,
            is_student: true
        },
        {
            address_id: 5,
            firstname: "Kobe",
            lastname: "Willems",
            gender: genderTypes.enumValues[0],
            email: "kobe@example.com",
            phonenumber: "0470443322",
            has_payed: false,
            is_student: true
        },
        {
            address_id: 6,
            firstname: "Elena",
            lastname: "Popov",
            gender: genderTypes.enumValues[1],
            email: "elena@example.com",
            phonenumber: "0495112244",
            has_payed: true,
            is_student: false
        },
        {
            address_id: 7,
            firstname: "Jean",
            lastname: "Dupont",
            gender: genderTypes.enumValues[0],
            email: "jean@example.com",
            phonenumber: "0484998877",
            has_payed: false,
            is_student: false
        },
        {
            address_id: 8,
            firstname: "Meryem",
            lastname: "Ait",
            gender: genderTypes.enumValues[1],
            email: "m.ait@student.hogent.be",
            phonenumber: "0477123987",
            has_payed: true,
            is_student: true
        },
        {
            address_id: 9,
            firstname: "Alex",
            lastname: "Jansen",
            gender: genderTypes.enumValues[1],
            email: "alex@example.com",
            phonenumber: "0492887766",
            has_payed: true,
            is_student: true
        },
        {
            address_id: 10,
            firstname: "Bram",
            lastname: "De Smet",
            gender: genderTypes.enumValues[0],
            email: "bram.desmet@gmail.com",
            phonenumber: "0471554433",
            has_payed: false,
            is_student: true
        }
    ];

    await db.insert(schema.members).values(members);
    console.log("Members created!");

    const events: (typeof schema.event.$inferInsert)[] = [
        {
            label: pioneerLabel.enumValues[0],
            title: "Infodag: Starten als Eerste in je Familie",
            date: "2026-09-05",
            start_time: "10:00:00",
            end_time: "14:00:00",
            description: "Een algemene introductiedag voor studenten die als eerste in hun gezin aan het hoger onderwijs beginnen. Ontdek de weg naar de campus!",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Workshop: Meester worden van het Leerplatform",
            date: "2026-09-20",
            start_time: "14:00:00",
            end_time: "16:30:00",
            description: "Een diepe duik in Canvas en andere schoolplatformen. Hoe download je cursussen en stuur je professionele e-mails?",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Masterclass: Plannen en Structuur",
            date: "2026-10-02",
            start_time: "18:30:00",
            end_time: "20:30:00",
            description: "Van blok-schema tot dagindeling. Leer hoe je de enorme berg leerstof van het hoger onderwijs overzichtelijk houdt.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Online Q&A: Verwachtingen vs. Realiteit",
            date: "2026-08-15",
            start_time: "19:00:00",
            end_time: "20:00:00",
            description: "Wat verandert er echt na het middelbaar? Stel al je vragen aan ervaren pioniersstudenten uit hogere jaren.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[0],
            title: "Netwerkavond: Bouw je Sociale Kring",
            date: "2026-10-15",
            start_time: "19:30:00",
            end_time: "22:00:00",
            description: "Een informele avond om medestudenten te leren kennen. Je sociale netwerk is je belangrijkste vangnet tijdens je studies.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Focus-sessie: Effectief Studeren",
            date: "2026-11-10",
            start_time: "09:00:00",
            end_time: "12:00:00",
            description: "Samen studeren werkt motiverend. We passen de Pomodoro-techniek toe en wisselen studietips uit.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[0],
            title: "Rondleiding: Navigeren op de Campus",
            date: "2026-09-12",
            start_time: "13:00:00",
            end_time: "15:00:00",
            description: "Waar is de bib? Hoe werkt de resto? We verkennen samen de belangrijkste plekken van de hogeschool/universiteit.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Pre-Exam Stress Relief",
            date: "2026-12-15",
            start_time: "17:00:00",
            end_time: "19:00:00",
            description: "Ontspan voor de blok begint. Sessie over mentale gezondheid, slaaphygiëne en omgaan met faalangst.",
            image: "link"
        }
    ];

    await db.insert(schema.event).values(events);
    console.log("Events created!");

    const eventRegistrations: (typeof schema.eventRegistration.$inferInsert)[] = [];

    for (let i = 1; i <= 8; i++) {
    const eventId = i;
        for (let j = 1; j <= 5; j++) {
            eventRegistrations.push({
                event_id: eventId,
                firstname: `Student_${j}`,
                lastname: `Pionier_${i}`,
                email: `student_${i}_${j}@example.com`, 
                phonenumber: "0488888888",
                label: i % 2 === 0 ? pioneerLabel.enumValues[1] : pioneerLabel.enumValues[0]
            });
        }
    }

    await db.insert(schema.eventRegistration).values(eventRegistrations);
    console.log("Users have been registered to events!");

    const notifications: (typeof schema.notification.$inferInsert)[] = [];

    for (let i = 1; i <= 8; i++){
        const isMember = i % 2 === 0
        notifications.push({
            member_id: isMember ? i : null,
            eventRegistration_id: !isMember ? i : null,
            title:"",
            description: isMember ? "Nieuwe Betaling" : "Nieuwe Inschrijving",
            is_new: i % 2 == 0 ? true : false
        });
    }

    await db.insert(schema.notification).values(notifications);
    console.log("Notifications created!");

}

main();