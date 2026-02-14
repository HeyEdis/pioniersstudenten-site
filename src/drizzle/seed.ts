import { db } from "../core/db";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { genderTypes, resourceTypes, pioneerLabel, userRole } from "./schema";
import { fakerNL_BE as faker } from "@faker-js/faker";
import dayjs from "dayjs";
import { getLogger } from "@/core/logging";
import { auth } from "@/core/auth";

const password = "wachtwoord123";

async function main() {
    
    // Clear existing data
    getLogger().info("Cleaning up database.");
    await db.delete(schema.notification);
    await db.delete(schema.registrations);
    await db.delete(schema.members);
    
    await db.delete(schema.event);
    await db.delete(schema.address);

    await db.delete(schema.admin);
    await db.delete(schema.resource);
    await db.delete(schema.faq);

    /** 
     * After deleting all the data the id's don't reset to 1. 
     * To do this this piece of sql code needs to be executed.
     * */ 
    await db.execute(sql`
        TRUNCATE TABLE 
            "notifications", 
            "registrations", 
            "members", 
            "events", 
            "addresses", 
            "admins", 
            "resources", 
            "faq" 
        RESTART IDENTITY CASCADE
    `);
    
    getLogger().info("🌱 Seeding database...");
    
    await auth.api.signUpEmail({
        body: {
		    email: "admin@example.com",
		    password: "password123",
		    name: "Beheerder",
	    },
    })

    getLogger().info("Admin created!");

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
    getLogger().info("FAQ's created!");

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
            url: "https://kuleuven.be/docs/at/pintra/canvas",
        },
        {
            type: resourceTypes.enumValues[1],
            title: "Financiële steun en Beurzen (Stuvo)",
            url: "https://www.centervoorstudenten.be",
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
    getLogger().info("Resources created!");

    /**
     * Address id's get stored so they can be used when generating members.
     * To get the id's we need to use .returning()
     */
    const addressIds: number[] = [];
    for (let i = 0; i < 28; i++){
        const [address] =  await db.insert(schema.address).values({
            street: faker.location.street(),
            housenumber: faker.number.int({min: 1, max: 300}).toString(),
            city: faker.location.city(),
            province: "Oost-vlaanderen"
        })
        .returning();
        addressIds.push(address.id);
    }

    getLogger().info("Addresses created!");

    /**
     * Gets generated in an array and then in bulk it gets inserted into the DB
     * This is done so it does one db operation instead of n
     */
    const allMembers: (typeof schema.members.$inferInsert)[] = [];
    for (const id of addressIds){
        for (let i = 0; i < 2; i++) {
            allMembers.push({
                address_id: id,
                firstname: faker.person.firstName(),
                lastname: faker.person.lastName(),
                gender: id % 2 == 0 ? genderTypes.enumValues[0] : genderTypes.enumValues[1],
                email: faker.internet.email(),
                phonenumber: faker.phone.number({style: "international"}),
                has_payed: id % 2 == 0 ? true : false,
                is_student: id % 2 == 0 ? true : false,
            })
        }
    }

    await db.insert(schema.members).values(allMembers);
    getLogger().info("Members created!");

    const events: (typeof schema.event.$inferInsert)[] = [
        {
            label: pioneerLabel.enumValues[0],
            title: "Infodag: Starten als Eerste in je Familie",
            date: dayjs().add(5, "days").toDate().toDateString(),
            start_time: "10:00:00",
            end_time: "14:00:00",
            description: "Een algemene introductiedag voor studenten die als eerste in hun gezin aan het hoger onderwijs beginnen. Ontdek de weg naar de campus!",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Workshop: Meester worden van het Leerplatform",
            date: dayjs().add(1, "month").add(15, "days").toDate().toDateString(),
            start_time: "14:00:00",
            end_time: "16:30:00",
            description: "Een diepe duik in Canvas en andere schoolplatformen. Hoe download je cursussen en stuur je professionele e-mails?",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Masterclass: Plannen en Structuur",
            date: dayjs().add(2, "month").add(4, "days").toDate().toDateString(),
            start_time: "18:30:00",
            end_time: "20:30:00",
            description: "Van blok-schema tot dagindeling. Leer hoe je de enorme berg leerstof van het hoger onderwijs overzichtelijk houdt.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Online Q&A: Verwachtingen vs. Realiteit",
            date: dayjs().add(2, "month").add(9, "days").toDate().toDateString(),
            start_time: "19:00:00",
            end_time: "20:00:00",
            description: "Wat verandert er echt na het middelbaar? Stel al je vragen aan ervaren pioniersstudenten uit hogere jaren.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[0],
            title: "Netwerkavond: Bouw je Sociale Kring",
            date: dayjs().add(2, "month").add(16, "days").toDate().toDateString(),
            start_time: "19:30:00",
            end_time: "22:00:00",
            description: "Een informele avond om medestudenten te leren kennen. Je sociale netwerk is je belangrijkste vangnet tijdens je studies.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Focus-sessie: Effectief Studeren",
            date: dayjs().add(3, "month").toDate().toDateString(),
            start_time: "09:00:00",
            end_time: "12:00:00",
            description: "Samen studeren werkt motiverend. We passen de Pomodoro-techniek toe en wisselen studietips uit.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[0],
            title: "Rondleiding: Navigeren op de Campus",
            date: dayjs().add(3, "month").add(9, "days").toDate().toDateString(),
            start_time: "13:00:00",
            end_time: "15:00:00",
            description: "Waar is de bib? Hoe werkt de resto? We verkennen samen de belangrijkste plekken van de hogeschool/universiteit.",
            image: "link"
        },
        {
            label: pioneerLabel.enumValues[1],
            title: "Pre-Exam Stress Relief",
            date: dayjs().add(2, "weeks").toDate().toDateString(),
            start_time: "17:00:00",
            end_time: "19:00:00",
            description: "Ontspan voor de blok begint. Sessie over mentale gezondheid, slaaphygiëne en omgaan met faalangst.",
            image: "link"
        }
    ];

    await db.insert(schema.event).values(events);
    getLogger().info("Events created!");

    const registrations: (typeof schema.registrations.$inferInsert)[] = [];

    for (let i = 1; i <= 8; i++) {
        const eventId = i;
        const randomCount = Math.floor(Math.random() * 26);
        for (let j = 1; j <= randomCount; j++) {
            registrations.push({
                event_id: eventId,
                firstname: faker.person.firstName(),
                lastname: faker.person.lastName(),
                email: `student_${i}_${j}@example.com`, 
                phonenumber: faker.phone.number({ style: "international" }),
                label: i % 2 === 0 ? pioneerLabel.enumValues[1] : pioneerLabel.enumValues[0]
            });
        }
    }

    await db.insert(schema.registrations).values(registrations);
    getLogger().info("Users have been registered to events!");

    const notifications: (typeof schema.notification.$inferInsert)[] = [];

    for (let i = 1; i <= 8; i++){
        const isMember = i % 2 === 0
        notifications.push({
            member_id: isMember ? i : null,
            registration_id: !isMember ? i : null,
            title:"",
            description: isMember ? "Nieuwe Betaling" : "Nieuwe Inschrijving",
            is_new: i % 2 == 0 ? true : false
        });
    }

    await db.insert(schema.notification).values(notifications);
    getLogger().info("Notifications created!");
    getLogger().info("✅ Seeding complete!");
}


main().catch(console.error);