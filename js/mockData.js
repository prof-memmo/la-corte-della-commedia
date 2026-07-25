// Dati mock per i processi (quiz) de "La Corte della Commedia"

window.CommediaMockData = {
    trials: {
        "trial_01_paolo_francesca": {
            id: "trial_01_paolo_francesca",
            title: "Processo a Paolo e Francesca",
            description: "Nel Secondo Cerchio dell'Inferno, dove il turbine incessante travolge le anime dei lussuriosi, due spiriti volano uniti, legati da una passione tragica. È giunto il momento di processare Paolo Malatesta e Francesca da Polenta.",
            xpReward: 100,
            fioriniCostPerHint: 15,
            questions: [
                {
                    id: "q1",
                    text: "Qual è la pena assegnata (il contrappasso) alle anime in questo cerchio?",
                    options: [
                        "Essere immersi nel fango bollente.",
                        "Essere trascinati per l'eternità da una bufera infernale.",
                        "Ghiacciare nel lago di Cocito.",
                        "Correre nudi sotto una pioggia di fuoco."
                    ],
                    correctIndex: 1,
                    hint: "La loro pena riflette il peccato: in vita furono travolti dalla tempesta dei sensi, ora da quella del vento."
                },
                {
                    id: "q2",
                    text: "Secondo il racconto di Francesca, quale libro stavano leggendo quando è scoccato il primo bacio?",
                    options: [
                        "Le avventure di Tristano e Isotta",
                        "La storia di Lancillotto e Ginevra",
                        "Le Metamorfosi di Ovidio",
                        "L'Eneide di Virgilio"
                    ],
                    correctIndex: 1,
                    hint: "Il famoso verso cita un 'Galeotto' che scrisse di un celebre cavaliere della Tavola Rotonda."
                },
                {
                    id: "q3",
                    text: "Cosa prova Dante dopo aver ascoltato la storia di Francesca?",
                    options: [
                        "Disprezzo e sdegno profondo.",
                        "Indifferenza, essendo lui vivo.",
                        "Pietà al punto da svenire.",
                        "Rabbia verso il marito omicida."
                    ],
                    correctIndex: 2,
                    hint: "E caddi come corpo morto cade..."
                }
            ],
            dossierHtml: `
                <h4><i class="fa-solid fa-file-pdf"></i> Estratto del Canto V</h4>
                <p>Amor, ch'a nullo amato amar perdona,<br>mi prese del costui piacer sì forte,<br>che, come vedi, ancor non m'abbandona.</p>
                <p>Galeotto fu 'l libro e chi lo scrisse:<br>quel giorno più non vi leggemmo avante.</p>
                <hr>
                <p><strong>Spunto per il Docente:</strong> Far riflettere gli studenti sul concetto di amore cortese e su come la letteratura possa influenzare (Galeotto) le azioni umane, portando fino alla dannazione.</p>
            `
        }
    }
};
