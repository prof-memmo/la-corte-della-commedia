import { db, doc, getDoc, setDoc } from "./firebase-config.js";
import { collection, getDocs, query, where, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const MOCK_CASES = [
  { 
    id: "paolo_francesca",
    image: "assets/cases/paolo_francesca.png", 
    campaignId: "inferno", 
    characterName: "Paolo e Francesca", 
    canto: "Canto V", 
    cerchio: "Lussuriosi", 
    order: 1, 
    active: true, 
    phases: { 
      facts: "Siamo nel secondo cerchio dell'Inferno, dove la bufera infernal che mai non resta trascina gli spiriti dei lussuriosi, coloro che sottomisero la ragione al talento. Francesca da Polenta, data in sposa per motivi politici a Gianciotto Malatesta (uomo deforme e violento), si innamorò perdutamente del fratello di lui, l'affascinante Paolo.<br><br>Un giorno, mentre i due leggevano per diletto le avventure di Lancillotto e Ginevra, arrivarono al punto in cui l'eroe bacia la regina. In quell'istante, come confessa Francesca stessa:<br><br><span style='display:block; text-align:center; font-style:italic; margin: 15px 0; color: var(--accent-gold);'>&quot;Galeotto fu 'l libro e chi lo scrisse: quel giorno più non vi leggemmo avante.&quot;</span><br>Gianciotto li sorprese in flagrante e, accecato dall'ira e dal disonore, li trafisse entrambi con la sua spada, unendoli nella morte come lo erano stati nell'amore.", 
      accusation: "Onorevole Giudice, questi due spiriti hanno commesso il più vile dei tradimenti contro il sacro vincolo del matrimonio! Hanno permesso che il desiderio carnale prevalesse sulla ragione, principio divino che ci eleva dalle bestie.<br><br>Non lasciatevi ingannare dalle loro lacrime: non vi è pentimento in loro. Hanno infranto le leggi degli uomini e di Dio per soddisfare un capriccio terreno. La loro lussuria ha scatenato sangue e morte, distruggendo l'onore della famiglia Malatesta!", 
      defense: "Vostro Onore, vi prego di guardare non all'atto in sé, ma alla forza sovrumana che l'ha generato. L'Amore è un signore potente e invincibile per i cuori gentili. Come ha detto la mia assistita:<br><br><span style='display:block; font-style:italic; margin: 15px 0; color: #4a2c11; font-weight: bold;'>&quot;Amor, ch'a nullo amato amar perdona, mi prese del costui piacer sì forte, che, come vedi, ancor non m'abbandona.&quot;</span><br>Non è stata una scelta maliziosa e calcolata, ma l'impeto di un sentimento così puro e travolgente da accecare chiunque. Condannerete davvero per l'eternità due anime la cui unica colpa è stata l'aver amato troppo?",
      reflection: "Ai miei tempi, la lussuria era una tempesta fisica. Oggi vedo che il vostro mondo è dominato dagli schermi. Quanti tradimenti nascono non da un libro galeotto, ma da un &quot;mi piace&quot;, da un messaggio nascosto, da una chat segreta? L'illusione dell'Amore virtuale è forse meno colpevole? Che significato ha oggi la fedeltà?"
    } 
  },
  { 
    id: "celestino_v",
    image: "assets/cases/celestino_v.png", 
    campaignId: "inferno", 
    characterName: "Colui che fece il gran rifiuto (Celestino V)", 
    canto: "Canto III", 
    cerchio: "Ignavi", 
    order: 2, 
    active: true, 
    phases: { 
      facts: "Ci troviamo nell'Antinferno, il luogo dove risiedono le anime di coloro che vissero «sanza 'nfamia e sanza lodo». Tra questi spiriti che corrono nudi dietro un'insegna, perseguitati da vespe e mosconi, vi è un'ombra che Dante riconosce come «colui che fece per viltade il gran rifiuto». Si tratta di Pietro da Morrone, l'eremita che divenne Papa col nome di Celestino V, ma che si dimise dopo soli 5 mesi.", 
      accusation: "Vostro Onore, l'accusa contro questo spirito è gravissima: egli ha abbandonato il suo gregge per pura codardia! Essendo stato posto sul trono pontificio, aveva il potere di purificare una Chiesa corrotta. Invece, temendo le macchinazioni politiche o sentendosi inadeguato, si è tirato indietro, permettendo l'elezione di Bonifacio VIII, artefice di rovina. La sua inerzia è peggiore di un peccato attivo: ignorare il male quando si può fermare, vi rende complici!", 
      defense: "Vostro Onore, stiamo parlando di un uomo di estrema santità, un eremita abituato al silenzio delle montagne, trascinato con la forza nelle logiche di potere del Vaticano. Il suo rifiuto non fu codardia, ma il supremo atto di umiltà e coerenza. Riconobbe la propria inadeguatezza a gestire gli intrighi politici senza perdere l'anima. Poteva restare e corrompersi, invece ha preferito abbandonare il potere per salvare la sua purezza. È colpevole chi rifiuta il potere?", 
      reflection: "Nel vostro mondo contemporaneo, l'astensione e il 'non schierarsi' sono molto comuni. Ignorare i problemi complessi, o astenersi dal votare per non sporcarsi le mani, è una forma di colpa? È preferibile sbagliare agendo, oppure restare 'puliti' ma stando fermi a guardare?" 
    } 
  },
  { 
    id: "omero",
    image: "assets/cases/omero.png", 
    campaignId: "inferno", 
    characterName: "Omero", 
    canto: "Canto IV", 
    cerchio: "Limbo", 
    order: 3, 
    active: true, 
    phases: { 
      facts: "Siamo nel Limbo, il primo cerchio dell'Inferno. Qui non vi sono urla o tormenti fisici, ma solo sospiri che fanno tremare l'aria. È il luogo dove risiedono le anime di coloro che non peccarono, ma non ricevettero il Battesimo. Tra un gruppo di poeti altissimi, spicca Omero, il «poeta sovrano» autore dell'Iliade e dell'Odissea. Egli visse molti secoli prima della nascita di Cristo, vivendo una vita retta e virtuosa.", 
      accusation: "Vostro Onore, le regole della Giustizia Divina sono chiare e inequivocabili: senza la grazia del Battesimo e la conoscenza della Vera Fede, nessuna virtù terrena è sufficiente per accedere alla vera Salvezza. Egli pagò semplicemente il prezzo di non aver posseduto la vera luce. Non essendo stato battezzato, non può in alcun modo essergli concesso l'ingresso al Paradiso.", 
      defense: "Vostro Onore, questa è una logica spietata! Come si può condannare all'eterna separazione dalla luce divina un'anima che ha ispirato intere generazioni e cantato i valori più alti dell'umanità? Omero è stato escluso per l'unica colpa di essere nato nell'epoca sbagliata, un dettaglio cronologico totalmente fuori dal suo controllo. Come può la perfetta Giustizia condannare chi non poteva in alcun modo conoscere le regole?", 
      reflection: "Nella vostra società, quante volte la burocrazia o i dogmi inflessibili puniscono persone oneste per mere mancanze formali o tempistiche sbagliate? Le regole devono essere applicate alla lettera, in modo freddo, oppure dovrebbero piegarsi di fronte al valore e all'onestà assoluta di un individuo?" 
    } 
  },
  { 
    id: "ciacco",
    image: "assets/cases/ciacco.png", 
    campaignId: "inferno", 
    characterName: "Ciacco", 
    canto: "Canto VI", 
    cerchio: "Golosi", 
    order: 4, 
    active: true, 
    phases: { 
      facts: "Nel terzo cerchio, i dannati giacciono in una fanghiglia maleodorante, flagellati senza pietà da una pioggia scrosciante, grandine e neve sporca, mentre Cerbero latra sopra di loro. Tra questi vi è Ciacco, un cittadino fiorentino famoso tra i suoi contemporanei per la sua insaziabile gola, ma anche stimato per la sua intelligenza e per i suoi modi cortesi. Qui sconta il vizio bestiale della gola, ridotto lui stesso a una creatura avvolta dal fango.", 
      accusation: "Costui ha ridotto la sua nobile natura umana a quella di una bestia da pascolo! Ha dissipato i beni, l'intelletto e le energie per il solo, egoistico piacere dello stomaco. Diventando schiavo del cibo, ha dimenticato la sua dignità, venerando il pasto come fosse un dio. Una tale debolezza animalesca merita solo il fango in cui ora annega!", 
      defense: "Vostro Onore, Ciacco non ha mai fatto del male a nessuno, se non a se stesso. Il cibo era forse il suo unico rifugio in una Firenze lacerata da continue e sanguinose lotte intestine (che lui stesso profetizza). In vita fu uomo socievole e di acuta intelligenza. È giusto condannare per l'eternità un'anima per una debolezza fisica, un cedimento dei sensi che non portava alcun danno diretto al suo prossimo?", 
      reflection: "Vivete nella società dei consumi, dove il cibo, gli acquisti e lo spreco sono esaltati costantemente. Non siete tutti, in fondo, un po' Ciacco? Il consumismo sfrenato e le dipendenze da cui non riusciamo a liberarci possono essere considerati 'crimini' contro noi stessi e contro il nostro pianeta?" 
    } 
  },
  { 
    id: "papi_avari",
    image: "assets/cases/papi_avari.png", 
    campaignId: "inferno", 
    characterName: "Papi e Cardinali", 
    canto: "Canto VII", 
    cerchio: "Avari", 
    order: 5, 
    active: true, 
    phases: { 
      facts: "Nel quarto cerchio, Avari e Prodighi sono costretti a spingere col petto enormi macigni, scontrandosi al centro del cerchio e rinfacciandosi reciprocamente la colpa. Dante non riesce a riconoscerne nessuno in volto, poiché l'ossessione per il denaro ha cancellato in loro ogni tratto di umanità individuale. Scorge però numerose chieriche: sono Papi, Cardinali ed ecclesiastici che in vita accumularono ricchezze sterminate.", 
      accusation: "Costoro hanno tradito il messaggio di umiltà e povertà che avrebbero dovuto rappresentare e difendere! I vertici della Chiesa hanno trasformato il sacro tempio in un volgare mercato, venerando il Dio denaro invece del Creatore. Hanno usato il loro ruolo spirituale per accumulare potere materiale. La loro avarizia è il tradimento più oscuro della loro missione divina!", 
      defense: "L'amministrazione di un'istituzione vasta come la Chiesa richiedeva fondi immensi, Vostro Onore. Il potere materiale e il denaro erano strumenti purtroppo necessari per proteggere la fede, finanziare le cattedrali e difendersi dalle ingerenze dei sovrani secolari. Il loro ruolo imponeva una gestione amministrativa feroce che, inevitabilmente, poteva sfociare in un attaccamento ai beni. Non si può governare il mondo solo con lo spirito.", 
      reflection: "Oggi il denaro muove il mondo. Ma fino a che punto l'accumulo di ricchezza o di profitti (da parte di aziende, politici, o enti) è uno strumento necessario, e quando diventa un'ossessione cinica che cancella la nostra umanità e ci rende 'irriconoscibili'?" 
    } 
  },
  { 
    id: "filippo_argenti",
    image: "assets/cases/filippo_argenti.png", 
    campaignId: "inferno", 
    characterName: "Filippo Argenti", 
    canto: "Canto VIII", 
    cerchio: "Iracondi", 
    order: 6, 
    active: true, 
    phases: { 
      facts: "Siamo nella palude Stige (quinto cerchio), dove gli iracondi si percuotono e si mordono immersi nel fango bollente. Dante, attraversando la palude sulla barca di Flegias, viene avvicinato da un dannato coperto di fango. È Filippo Argenti, esponente della famiglia degli Adimari, politico fiorentino arrogante e violento, tristemente famoso per il suo carattere irascibile e per aver ferrato il suo cavallo d'argento per pura ostentazione.", 
      accusation: "Un mostro di superbia e ira cieca! In vita ha seminato terrore, calpestato i deboli e goduto nell'umiliare fisicamente i suoi avversari politici. Un uomo la cui sola presenza innescava conflitti e sangue. Una furia senza controllo che non merita alcuna pietà e che giustamente ora affoga, per l'eternità, nella melma della sua stessa aggressività!", 
      defense: "Filippo era figlio di tempi estremamente violenti, una Firenze dove la sopravvivenza della propria fazione dipendeva dalla forza bruta e dall'intimidazione pubblica. La sua ira era forse il prodotto e la reazione necessaria a una società spietata in cui chi mostrava debolezza veniva annientato. Chi siamo noi per giudicare la rabbia di un uomo costretto a combattere ogni giorno per il suo rango e il suo onore?", 
      reflection: "Pensate ai social network moderni, spesso trasformati in paludi Stige piene di 'leoni da tastiera' pronti ad insultare e aggredire. L'ira e l'aggressività sono sempre ingiustificabili, o credete che a volte l'ira sia l'unica reazione spontanea e umana possibile a un'ingiustizia percepita?" 
    } 
  },
  { 
    id: "farinata",
    image: "assets/cases/farinata.png", 
    campaignId: "inferno", 
    characterName: "Farinata degli Uberti", 
    canto: "Canto X", 
    cerchio: "Eretici", 
    order: 7, 
    active: true, 
    phases: { 
      facts: "Nel sesto cerchio (la città di Dite), il paesaggio è un cimitero sterminato di tombe infuocate e scoperchiate. Qui giacciono gli Eretici, in particolare gli epicurei che credettero che «l'anima col corpo morta fa». Tra questi, si erge dal sepolcro Farinata degli Uberti, fiero e maestoso come se «l'inferno avesse a gran dispitto». Grande capo ghibellino, fu avversario politico implacabile ma si oppose, da solo e a viso aperto, alla distruzione di Firenze proposta dai suoi stessi alleati.", 
      accusation: "Vostro Onore, la colpa di Farinata è assoluta: ha negato l'esistenza della vita eterna! Confinando l'esistenza umana alla sola materia, ha corrotto le menti negando la giustizia e l'ordine divino. Il suo orgoglio intellettuale lo ha portato all'eresia massima. Se non c'è premio né castigo dopo la morte, ogni legge morale rischia di crollare!", 
      defense: "Farinata è stato un eroe e un vero patriota! Anche quando la sua fazione vinse e i suoi alleati volevano radere al suolo Firenze, lui fu l'unico ad alzarsi per difenderla, mettendo a rischio se stesso per amore della sua terra. La sua grandezza d'animo, il suo coraggio politico e il suo patriottismo superano immensamente i suoi presunti errori teologici o filosofici.", 
      reflection: "È possibile essere grandi cittadini, persone rette ed esempi virtuosi pur avendo convinzioni o ideologie considerate 'eretiche', sbgliate o non convenzionali dalla maggioranza? Conta di più ciò in cui si crede intimamente, o l'impatto reale e pubblico delle proprie azioni?" 
    } 
  },
  { 
    id: "pier_della_vigna",
    image: "assets/cases/pier_vigna.png", 
    campaignId: "inferno", 
    characterName: "Pier della Vigna", 
    canto: "Canto XIII", 
    cerchio: "Violenti", 
    order: 8, 
    active: true, 
    phases: { 
      facts: "Siamo nel bosco dei suicidi (settimo cerchio, secondo girone), composto da alberi secchi e contorti, straziati dalle Arpie. Pier della Vigna fu il primo ministro, poeta e confidente intimo dell'imperatore Federico II di Svevia («tenni ambo le chiavi del cor di Federigo»). Accusato ingiustamente di tradimento dai cortigiani invidiosi, fu accecato e gettato in prigione, dove scelse di togliersi la vita, fracassandosi la testa, per sfuggire al disonore.", 
      accusation: "Ha commesso il crimine supremo contro la propria vita, che è il dono più sacro fatto da Dio! Arrendendosi alla disperazione in prigione, ha dimostrato totale assenza di fede. Invece di affidarsi alla giustizia divina, ha ceduto al dolore e all'orgoglio, chiudendo per sempre, con le proprie mani, la via al perdono e alla speranza.", 
      defense: "Vostro Onore, provate a immedesimarvi: l'uomo più colto e potente del regno, caduto improvvisamente in disgrazia a causa di false calunnie e invidie di corte. Privato della vista, della libertà e del nome. Ha scelto la morte per non sopportare l'agonia di un disonore ingiusto. Il suo fu un estremo gesto di protesta per riaffermare la sua dignità e dimostrare, fino all'ultimo respiro, l'ingiustizia subita.", 
      reflection: "Il suicidio è sempre da considerare una sconfitta assoluta o può essere letto, in certi casi estremi, come un'estrema e dolorosa rivendicazione di libertà? Come giudicare oggi chi crolla sotto il peso di accuse ingiuste, diffamazioni o del cyberbullismo continuo?" 
    } 
  },
  { 
    id: "ulisse",
    image: "assets/cases/ulisse.png", 
    campaignId: "inferno", 
    characterName: "Ulisse", 
    canto: "Canto XXVI", 
    cerchio: "Fraudolenti", 
    order: 9, 
    active: true, 
    phases: { 
      facts: "Siamo nell'ottava bolgia dell'ottavo cerchio. Qui le anime sono avvolte da fiamme a forma di lingua, simbolo della loro intelligenza usata per ingannare.<br><br>Ulisse, re di Itaca, dopo innumerevoli peripezie e inganni (tra cui il celebre Cavallo di Troia), non volle tornare a casa a godersi la vecchiaia. Radunò i suoi vecchi compagni e li convinse a oltrepassare le Colonne d'Ercole (l'attuale Stretto di Gibilterra), il limite estremo del mondo conosciuto, sfidando i divieti divini per esplorare l'ignoto.<br><br><span style='display:block; text-align:center; font-style:italic; margin: 15px 0; color: var(--accent-gold);'>&quot;Fatti non foste a viver come bruti, ma per seguir virtute e canoscenza.&quot;</span><br>Questo celebre discorso infiammò i compagni. Il loro &quot;folle volo&quot; si concluse in tragedia quando una tempesta, voluta da Dio, fece inabissare la nave davanti alla Montagna del Purgatorio.", 
      accusation: "Costui ha usato la sua astuzia eccezionale non per il bene comune, ma per l'inganno e la rovina degli avversari! Non dimentichiamo le lacrime versate per colpa del Cavallo di Troia. Ma c'è di peggio: l'arroganza estrema. Ha creduto di potersi sostituire a Dio, ignorando i limiti imposti all'umanità. Ha sedotto e manipolato i suoi stessi compagni con un bel discorso, conducendoli consapevolmente verso una morte certa pur di saziare la propria fama.", 
      defense: "Vostro Onore, Ulisse incarna la scintilla più pura, irrazionale e nobile dell'essere umano: l'inestinguibile sete di conoscenza! Se l'umanità non avesse mai osato sfidare i propri limiti o le proprie credenze, vivremmo ancora nelle caverne. Non era un mero ingannatore, ma un pioniere. Ha osato troppo per eccesso di intelligenza. È stata la nobile ambizione a spingerlo oltre le colonne. Era davvero colpevole o semplicemente audace?",
      reflection: "Un individuo supera ogni limite pur di raggiungere un traguardo. Oltrepassa confini, sacrifica tempo e affetti, sfida l'impossibile. È ammirevole coraggio o tossica ambizione? Oggi glorifichiamo scienziati, imprenditori o esploratori che si spingono oltre i limiti (IA, viaggi spaziali). Condividiamo oggi lo stesso 'peccato' di Ulisse?"
    } 
  },
  { 
    id: "ugolino",
    image: "assets/cases/ugolino.png", 
    campaignId: "inferno", 
    characterName: "Conte Ugolino", 
    canto: "Canto XXXIII", 
    cerchio: "Traditori", 
    order: 10, 
    active: true, 
    phases: { 
      facts: "Nel nono cerchio, Cocito (il lago ghiacciato), si puniscono i Traditori. Qui il Conte Ugolino della Gherardesca, traditore politico di Pisa, addenta ferocemente e per l'eternità il cranio dell'Arcivescovo Ruggieri, colui che a sua volta lo tradì. Ruggieri lo fece infatti rinchiudere nella Torre della Muda insieme a due figli e due nipoti innocenti, facendoli tutti morire lentamente di fame in un'agonia disperata.", 
      accusation: "Ugolino ha tradito la sua stessa patria! Ha stretto patti segreti col nemico e ceduto castelli di vitale importanza per mantenere e accrescere il proprio cinico potere politico. Un calcolatore senza scrupoli la cui immensa ambizione personale ha innescato la reazione dei suoi avversari, finendo per trascinare persino l'intera sua stirpe verso un'orrenda fine.", 
      defense: "Nessun uomo, Vostro Onore, per quanto gravemente colpevole di reati politici, merita una tortura così disumana! Veder deperire e morire di inedia i propri figli e nipoti innocenti davanti ai propri occhi imploranti è un dolore che spezza la mente. La crudele punizione terrena infertagli (e l'omicidio dei suoi figli innocenti) ha ampiamente espiato e superato, in atrocità, qualsiasi colpa politica egli avesse mai commesso.", 
      reflection: "Quando una punizione (o la giustizia stessa) è talmente spietata da diventare un crimine atroce che supera il reato originale? E fin dove l'ambizione personale, la carriera o gli affari possono spingere un individuo prima di trascinare, come vittime collaterali, la propria famiglia o i propri cari?" 
    } 
  }
];
const EroiDB = {
    // Cache locale per i dati caricati
    cache: {
        campaigns: [],
        cases: [],
        activities: [],
        userProfile: null
    },

    // --- PROFILO UTENTE ---
    getUserProfile: async function(uid) {
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                this.cache.userProfile = docSnap.data();
                return this.cache.userProfile;
            }
            return null;
        } catch (e) {
            console.error("Errore fetch profilo:", e);
            return null;
        }
    },

    updateXP: async function(uid, amount) {
        if (!this.cache.userProfile) return;
        const newXp = (this.cache.userProfile.xp || 0) + amount;
        try {
            await updateDoc(doc(db, "users", uid), { xp: newXp });
            this.cache.userProfile.xp = newXp;
            return newXp;
        } catch (e) {
            console.error("Errore aggiornamento XP:", e);
        }
    },

    getAllUsers: async function() {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            // --- Aggiunta MOCK DATA ---
            const mockUsers = [
                { id: "mock-teacher", uid: "mock-teacher", email: "prof.memmo@lacorte.it", displayName: "Prof Memmo", role: "teacher" },
                { id: "mock-student", uid: "mock-student", email: "studente.test@lacorte.it", displayName: "Studente Test", role: "student", classId: "TEST-CLASS", level: 1, xp: 0 },
                { id: "mock-external", uid: "mock-external", email: "esterno.test@lacorte.it", displayName: "Visitatore", role: "external" }
            ];
            const existingEmails = users.map(u => u.email);
            for (let mu of mockUsers) {
                if (!existingEmails.includes(mu.email)) users.push(mu);
            }
            // --- FINE MOCK DATA ---
            return users;
        } catch (e) {
            console.error("Errore getAllUsers:", e);
            return [];
        }
    },

    updateUserRole: async function(uid, newRole) {
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
        } catch (e) {
            console.error("Errore updateUserRole:", e);
            throw e;
        }
    },
    
    // --- DOCENTI E CLASSI ---
    saveClass: async function(classData) {
        try {
            await setDoc(doc(db, "classes", classData.id), classData);
            return classData.id;
        } catch (e) {
            console.error("Errore saveClass:", e);
            throw e;
        }
    },

    getClassById: async function(id) {
        try {
            const docSnap = await getDoc(doc(db, "classes", id));
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (e) {
            console.error("Errore getClassById:", e);
            return null;
        }
    },

    getClassByCode: async function(code) {
        try {
            const q = query(collection(db, "classes"), where("code", "==", code.toUpperCase()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            }
            return null;
        } catch (e) {
            console.error("Errore getClassByCode:", e);
            return null;
        }
    },

    getTeacherClasses: async function(teacherEmail) {
        try {
            const q = query(collection(db, "classes"), where("teacher", "==", teacherEmail));
            const querySnapshot = await getDocs(q);
            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push(doc.data());
            });
            // --- MOCK CLASS ---
            if (teacherEmail === "prof.memmo@lacorte.it") {
                if (!classes.find(c => c.id === "TEST-CLASS")) {
                    classes.push({ id: "TEST-CLASS", name: "Classe di Test (3^A)", code: "TEST1234", teacher: "prof.memmo@lacorte.it" });
                }
            }
            // --- FINE MOCK CLASS ---
            return classes;
        } catch (e) {
            console.error("Errore getTeacherClasses:", e);
            return [];
        }
    },

    getStudentsByClass: async function(classId) {
        try {
            const q = query(collection(db, "users"), where("classId", "==", classId), where("role", "==", "student"));
            const querySnapshot = await getDocs(q);
            const students = [];
            querySnapshot.forEach((doc) => {
                students.push(doc.data());
            });
            // --- MOCK STUDENTS ---
            if (classId === "TEST-CLASS") {
                if (!students.find(s => s.email === "studente.test@lacorte.it")) {
                    students.push({ id: "mock-student", uid: "mock-student", email: "studente.test@lacorte.it", displayName: "Studente Test", role: "student", classId: "TEST-CLASS", level: 1, xp: 0 });
                }
            }
            // --- FINE MOCK STUDENTS ---
            return students;
        } catch (e) {
            console.error("Errore getStudentsByClass:", e);
            return [];
        }
    },

    // --- CAMPAGNE E CASI ---
    getCampaigns: async function() {
        if (this.cache.campaigns.length > 0) return this.cache.campaigns;
        
        try {
            const q = query(collection(db, "campaigns"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const campaigns = [];
            querySnapshot.forEach((doc) => {
                campaigns.push({ id: doc.id, ...doc.data() });
            });
            this.cache.campaigns = campaigns;
            return campaigns;
        } catch (e) {
            console.error("Errore fetch campagne:", e);
            return [];
        }
    },

    getCasesByCampaign: async function(campaignId) {
        if (this.cache.cases && this.cache.cases.length > 0) {
            const cachedCases = this.cache.cases.filter(c => c.campaignId === campaignId);
            if (cachedCases.length > 0) return cachedCases;
        }

        try {
            const q = query(collection(db, "cases"), where("campaignId", "==", campaignId));
            const querySnapshot = await getDocs(q);
            const cases = [];
            querySnapshot.forEach((doc) => {
                cases.push({ id: doc.id, ...doc.data() });
            });
            if (cases.length === 0 && campaignId === "inferno") {
                this.cache.cases = this.cache.cases.concat(MOCK_CASES);
                return MOCK_CASES;
            }
            this.cache.cases = this.cache.cases.concat(cases);
            return cases;
        } catch (e) {
            console.error("Errore fetch casi:", e);
            return [];
        }
    },

    // --- VERDETTI E LOGS ---
    saveSentence: async function(sentenceData) {
        try {
            // Un id casuale o generato, qui usiamo push id finto o doc vuoto
            const newDocRef = doc(collection(db, "sentences"));
            await setDoc(newDocRef, sentenceData);
            return newDocRef.id;
        } catch (e) {
            console.error("Errore salvataggio sentenza:", e);
            return null;
        }
    }
};

window.EroiDB = EroiDB;
export default EroiDB;
