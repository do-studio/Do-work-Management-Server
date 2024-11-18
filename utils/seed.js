import headerHelpers from "../helpers/headerHelpers.js";
import priorityHelpers from "../helpers/priorityHelpers.js";
import statusHelpers from "../helpers/statusHelpers.js";
import bannerHelpers from "../helpers/bannerHelpers.js";


export const seedInitialData = async () => {
    try {
        const defaultHeaders = [
            { name: "task", key: "task", order: 1 },
            { name: "status", key: "status", order: 2 },
            { name: "due date", key: "dueDate", order: 3 },
            { name: "priority", key: "priority", order: 4 },
            { name: "notes", key: "notes", order: 5 },
            { name: "people", key: "people", order: 6 }
        ];

        const seedCheckArray = [
            headerHelpers.headerExists(),
            statusHelpers.statusExists(),
            priorityHelpers.priorityExists(),
            bannerHelpers.bannerExists()
        ];

        // Run checks in parallel
        const seedCheckResults = await Promise.all(seedCheckArray);

        for (let index = 0; index < seedCheckResults.length; index++) {
            if (!seedCheckResults[index]) {
                switch (index) {
                    case 0:
                        await headerHelpers.seedAllHeaders(defaultHeaders)
                        break;
                    case 1:
                        await statusHelpers.addOption({ option: "not started", color: "#797171" })
                        break;
                    case 2:
                        await priorityHelpers.addOption({ option: "normal", color: "#3c53ec" })
                        break;
                    case 3:
                        await bannerHelpers.addBanner({ bannerURL: "https://img.freepik.com/premium-photo/groovy-psychedelic-abstract-wavy-decorative-funky-background-hippie-trendy-design-digital-art_598586-601.jpg?w=1060", currentBanner: true })
                        break;
                    default:
                        break;
                }
            }
        }

    } catch (error) {
        console.error(`Error seeding initial data: ${error}`);
    }
};
