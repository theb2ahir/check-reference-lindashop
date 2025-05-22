const { exec } = require("child_process");
const readline = require("readline");
// Utilitaire pour convertir les timestamps en date lisible
function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
}

// Interface pour lire l'entrée utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Entrez la référence à rechercher : ", (inputRef) => {
    exec(
        `adb shell content query --uri content://sms/inbox --projection address:body:date`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur : ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Erreur stderr : ${stderr}`);
                return;
            }

            const messages = stdout.split("Row: ").slice(1);
            let found = false;

            console.log(`\n🔍 Résultat de la recherche pour la référence : ${inputRef}\n`);

            messages.forEach((msg) => {
                const addressMatch = msg.match(/address=(.*?),/);
                const bodyMatch = msg.match(/body=(.*?),/);
                const dateMatch = msg.match(/date=(\d+)/);

                const address = addressMatch ? addressMatch[1].trim() : "Inconnu";
                const body = bodyMatch ? bodyMatch[1].trim() : "";
                const date = dateMatch ? formatDate(dateMatch[1]) : "Inconnue";

                const refMatch = body.match(/Ref\s+([A-Z0-9]+)/i);
                if (refMatch) {
                    const ref = refMatch[1];
                    if (ref === inputRef) {
                        found = true;
                        console.log("🚨 Référence TROUVÉE !");
                        console.log(`• Adresse : ${address}`);
                        console.log(`• Référence : ${ref}`);
                        console.log(`• Date : ${date}`);
                        console.log(`• SMS : ${body}\n`);

                    }
                }
            });

            if (!found) {
                console.log("❌ Aucune correspondance trouvée pour cette référence.");
            }

            rl.close();
        }
    );
});
