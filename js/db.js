import { db, doc, getDoc, setDoc } from "./firebase-config.js";
import { collection, getDocs, query, where, orderBy, updateDoc, or, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getUserProfile, updateXP, getAllUsers, updateUserRole } from './services/users.js';\nimport { saveClass, getClassById, getClassByCode, getTeacherClasses, joinClassAsCollaborator, getStudentsByClass } from './services/classes.js';\nimport { getCampaigns, getCasesByCampaign, saveSentence, getCaseStats, getUserSentences, getRawVerdicts } from './services/progress.js';\n\n
const MOCK_CASES = [
  {
    "id": "paolo_francesca",
    "image": "assets/cases/paolo_francesca.png",
    "campaignId": "inferno",
    "characterName": "Paolo e Francesca",
    "canto": "Canto V",
    "cerchio": "Lussuriosi",
    "order": 1,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Nel Secondo Cerchio dell'Inferno, dove il turbine incessante travolge le anime, due spiriti volano uniti, legati da una passione tragica. Sono Paolo Malatesta e Francesca da Polenta.",
      "obiettivo": "Analizzare la differenza tra amore e lussuria, e comprendere quanto il cedere alla passione possa giustificare la trasgressione delle regole sacre.",
      "facts": "Francesca da Polenta, data in sposa per motivi politici a Gianciotto Malatesta (uomo deforme e violento), si innamor\u00f2 perdutamente del fratello di lui, l'affascinante Paolo.",
      "tragedia": "Un giorno, mentre i due leggevano per diletto le avventure di Lancillotto e Ginevra, arrivarono al punto in cui l'eroe bacia la regina. In quell'istante si baciarono. Gianciotto li sorprese in flagrante e li trafisse entrambi con la sua spada.",
      "accusation": "Questi due spiriti hanno commesso il pi\u00f9 vile dei tradimenti contro il sacro vincolo del matrimonio! Hanno permesso che il desiderio carnale prevalesse sulla ragione, principio divino che ci eleva dalle bestie.",
      "citazione": "\"Galeotto fu 'l libro e chi lo scrisse:\\nquel giorno pi\u00f9 non vi leggemmo avante.\"",
      "contrappasso": "Come in vita furono travolti e trascinati senza controllo dalla tempesta della passione e dei sensi, ora sono trascinati per l'eternit\u00e0 da una bufera infernale che mai non si ferma.",
      "defense": "Vostro Onore, l'Amore \u00e8 un signore potente e invincibile per i cuori gentili. Non \u00e8 stata una scelta maliziosa e calcolata, ma l'impeto di un sentimento cos\u00ec puro e travolgente da accecare chiunque. Condannerete davvero per l'eternit\u00e0 due anime la cui unica colpa \u00e8 stata l'aver amato troppo?",
      "crossExamination": [
        {
          "question": "Qual \u00e8 il principio chiave su cui si basa l'accusa di Dante contro i due amanti?",
          "options": [
            "Hanno letto un libro proibito.",
            "Hanno sottomesso la ragione al desiderio (talento).",
            "Hanno sfidato l'autorit\u00e0 di Gianciotto."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Per Dante, il peccato di lussuria consiste nel permettere all'istinto carnale di vincere sul raziocinio."
        },
        {
          "question": "Nella sua difesa, Francesca cita l'Amore. Come lo descrive in relazione ai 'cuori gentili'?",
          "options": [
            "Come un demone ingannatore.",
            "Come una forza che obbliga chi \u00e8 amato a riamare.",
            "Come un sentimento passeggero e illusorio."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! 'Amor, ch'a nullo amato amar perdona'. Francesca si giustifica dicendo che l'Amore stesso l'ha costretta a cedere."
        },
        {
          "question": "Se accettassimo la difesa di Francesca, quale sarebbe la conseguenza logica per la Giustizia Universale?",
          "options": [
            "Che i libri andrebbero censurati.",
            "Che nessuno sarebbe responsabile delle proprie azioni se mosso da forte passione.",
            "Che il matrimonio combinato dovrebbe essere abolito."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Se l'Amore \u00e8 una forza irresistibile, allora viene meno il Libero Arbitrio e nessuno pu\u00f2 essere colpevole dei delitti passionali."
        }
      ],
      "reflection": "Ai miei tempi, la lussuria era una tempesta fisica. Oggi vedo che il vostro mondo \u00e8 dominato dagli schermi. L'illusione dell'Amore virtuale \u00e8 forse meno colpevole? Che significato ha oggi la fedelt\u00e0?",
      "sealPuzzle": {
        "riddle": "Francesca pronuncia tre versi famosi che iniziano tutti con la stessa potente parola, indicandola come causa assoluta del suo destino. Qual \u00e8 questa parola? (4 lettere)",
        "answer": "AMOR"
      }
    }
  },
  {
    "id": "celestino_v",
    "image": "assets/cases/celestino_v.png",
    "campaignId": "inferno",
    "characterName": "Celestino V",
    "canto": "Canto III",
    "cerchio": "Antinferno",
    "order": 2,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Sei nell'Antinferno, dove risiedono le anime di coloro che vissero 'sanza 'nfamia e sanza lodo'. Davanti a te c'\u00e8 l'ombra di colui che fece 'per viltade il gran rifiuto'.",
      "obiettivo": "Giudicare se la rinuncia al papato sia stato un atto di vilt\u00e0 o di suprema umilt\u00e0, e se la pena dell'Antinferno sia giusta.",
      "facts": "Pietro da Morrone, un eremita pio e isolato, fu eletto Papa nel 1294 con il nome di Celestino V. Sentendosi inadeguato al ruolo e alle macchinazioni politiche della Chiesa, abdic\u00f2 dopo soli cinque mesi.",
      "tragedia": "Il suo successore, Bonifacio VIII, lo fece imprigionare per evitare scismi. Dante lo colloca tra gli Ignavi, costretto a correre perennemente dietro un'insegna, punto da vespe e mosconi.",
      "accusation": "L'accusa mossa \u00e8 di vilt\u00e0. Avendo rinunciato al sommo pontificato, ha permesso a un papa corrotto (Bonifacio VIII) di prendere il potere e rovinare la Chiesa e Firenze.",
      "citazione": "\"Poscia ch'io v'ebbi alcun riconosciuto,\\nvidi e conobbi l'ombra di colui\\nche fece per viltade il gran rifiuto.\"",
      "contrappasso": "Poich\u00e9 in vita non presero mai una posizione n\u00e9 seguirono un ideale, ora sono costretti a correre nudi dietro un'insegna senza significato, mentre insetti succhiano il loro sangue.",
      "defense": "La difesa sostiene che Celestino V non fu mosso da vilt\u00e0, ma da profonda umilt\u00e0 e consapevolezza dei propri limiti. Prefer\u00ec la purezza spirituale al potere corrotto.",
      "crossExamination": [
        {
          "question": "Perch\u00e9 la rinuncia di Celestino V ha causato la furia personale di Dante?",
          "options": [
            "Perch\u00e9 permise l'ascesa di Bonifacio VIII, artefice dell'esilio di Dante.",
            "Perch\u00e9 Dante odiava gli eremiti.",
            "Perch\u00e9 Celestino si rifiut\u00f2 di battezzare Dante."
          ],
          "correctIndex": 0,
          "explanation": "Esatto! L'abdicazione di Celestino apr\u00ec la strada a Papa Bonifacio VIII, che successivamente si alle\u00f2 con i Neri e caus\u00f2 l'esilio di Dante da Firenze."
        },
        {
          "question": "La pena del contrappasso per gli Ignavi prevede di essere punti da vespe e mosconi. Che significato allegorico ha?",
          "options": [
            "Sono le malattie dell'epoca.",
            "Rappresentano gli stimoli che non hanno mai avuto in vita per agire.",
            "Simboleggiano i peccati della Chiesa."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! In vita non furono mai 'punti' o stimolati da alcun ideale; ora nell'aldil\u00e0 sono stimolati fisicamente in eterno da fastidiosi insetti."
        },
        {
          "question": "La difesa descrive Celestino come un eremita inadeguato al potere politico. Se fosse vero, rifiutare il potere diventa...",
          "options": [
            "...un peccato di superbia.",
            "...un atto di profonda umilt\u00e0 e realismo.",
            "...un crimine di lesa maest\u00e0."
          ],
          "correctIndex": 1,
          "explanation": "Giusto. La difesa sostiene che riconoscere i propri limiti per non corrompere la propria anima sia la vera santit\u00e0, al contrario dell'accusa che lo vede come pura codardia."
        }
      ],
      "reflection": "Oggi, ritirarsi da un ruolo di grande responsabilit\u00e0 perch\u00e9 si ritiene di non essere all'altezza \u00e8 un segno di debolezza (vilt\u00e0) o di grande coraggio e consapevolezza di s\u00e9?",
      "sealPuzzle": {
        "riddle": "Dante lo condanna per 'viltade', ma la Chiesa lo canonizz\u00f2 (divenne Santo) per un'altra virt\u00f9, legata al sapersi fare piccoli. Qual \u00e8? (6 lettere)",
        "answer": "UMILTA"
      }
    }
  },
  {
    "id": "ciacco",
    "image": "assets/cases/ciacco.png",
    "campaignId": "inferno",
    "characterName": "Ciacco",
    "canto": "Canto VI",
    "cerchio": "Golosi",
    "order": 4,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Nel terzo cerchio i dannati giacciono nel fango, flagellati da una pioggia gelida mentre Cerbero latra. Tra questi vi \u00e8 Ciacco, famoso cittadino fiorentino.",
      "obiettivo": "Stabilire se l'ingordigia e l'asservimento ai piaceri materiali costituiscano un peccato contro la dignit\u00e0 umana o una semplice debolezza personale.",
      "facts": "Ciacco era un cittadino fiorentino famoso tra i suoi contemporanei per la sua insaziabile gola, ma anche stimato per la sua intelligenza e per i suoi modi cortesi.",
      "tragedia": "Qui sconta il vizio bestiale della gola, ridotto lui stesso a una creatura avvolta dal fango, perdendo ogni tratto della sua nobilt\u00e0 e cortesia fiorentina.",
      "accusation": "Costui ha ridotto la sua nobile natura umana a quella di una bestia da pascolo! Ha dissipato i beni e l'intelletto per il solo, egoistico piacere dello stomaco. Diventando schiavo del cibo, ha venerato il pasto come fosse un dio.",
      "citazione": "\"Voi cittadini mi chiamaste Ciacco:\\nper la dannosa colpa de la gola,\\ncome tu vedi, a la pioggia mi fiacco.\"",
      "contrappasso": "Come in vita cercarono raffinatezze culinarie e si riempirono lo stomaco, ora giacciono come maiali nel fango puzzolente, colpiti da grandine e morsi da Cerbero.",
      "defense": "Vostro Onore, Ciacco non ha mai fatto del male a nessuno se non a se stesso. In vita fu uomo socievole e di acuta intelligenza. \u00c8 giusto condannare per l'eternit\u00e0 un'anima per una debolezza fisica che non danneggiava il prossimo?",
      "crossExamination": [
        {
          "question": "Quale elemento del contrappasso punisce specificamente la ricerca di 'cibi prelibati e raffinati' dei Golosi?",
          "options": [
            "Essere divorati da Cerbero.",
            "Essere sdraiati nel fango maleodorante (lordura) sotto una pioggia sporca.",
            "Essere costretti a digiunare."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Avendo cercato piaceri raffinati (gusto e olfatto), ora sono condannati a un ambiente viscido, puzzolente e disgustoso."
        },
        {
          "question": "Durante l'incontro, Ciacco non parla solo di cibo. Cosa rivela a Dante?",
          "options": [
            "La ricetta del panforte.",
            "Una profezia sulle sanguinose lotte politiche di Firenze.",
            "Il modo per fuggire dall'Inferno."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Ciacco dimostra grande lucidit\u00e0 profetizzando la futura divisione politica di Firenze, smentendo l'idea che fosse solo un bruto senza intelletto."
        },
        {
          "question": "Su cosa punta maggiormente l'Arringa della Difesa per chiedere clemenza?",
          "options": [
            "Sul fatto che il cibo inondava Firenze e non si poteva resistere.",
            "Sul fatto che la gola \u00e8 un peccato 'contro se stessi' e non danneggia il prossimo in modo violento.",
            "Sul fatto che Ciacco aveva problemi di metabolismo."
          ],
          "correctIndex": 1,
          "explanation": "Giusto! La difesa argomenta che l'ingordigia non arreca danni diretti agli altri, a differenza di tradimento o violenza, e chiede clemenza per questa debolezza umana."
        }
      ],
      "reflection": "Vivete nella societ\u00e0 dei consumi, dove il cibo e lo spreco sono esaltati. Il consumismo sfrenato e le dipendenze possono essere considerati 'crimini' contro noi stessi e contro il nostro pianeta?",
      "sealPuzzle": {
        "riddle": "Infiamma le nostre gole moderne. Nella societ\u00e0 dei consumi, comprare ossessivamente cibo e merci crea enormi montagne di... (7 lettere, plurale)",
        "answer": "RIFIUTI"
      }
    }
  },
  {
    "id": "papi_avari",
    "image": "assets/cases/papi_avari.png",
    "campaignId": "inferno",
    "characterName": "Papi Avari (Niccol\u00f2 III)",
    "canto": "Canto XIX",
    "cerchio": "Fraudolenti",
    "order": 5,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Nella terza bolgia si trovano buchi nella roccia da cui spuntano le gambe scalcianti di anime. Dante parla con Papa Niccol\u00f2 III, punito per aver venduto le cose sacre.",
      "obiettivo": "Giudicare l'uso del potere spirituale e istituzionale per il mero arricchimento personale e familiare.",
      "facts": "Niccol\u00f2 III (della famiglia Orsini) us\u00f2 il suo papato per arricchire spudoratamente i propri parenti vendendo cariche ecclesiastiche e favori.",
      "tragedia": "Ha trasformato la Chiesa in una 'puttana' che si concede per oro. Crede che anche i suoi successori (Bonifacio VIII) siano gi\u00e0 destinati a spingerlo pi\u00f9 gi\u00f9 nello stesso buco.",
      "accusation": "L'accusa \u00e8 la Simonia: l'uso delle posizioni di potere, destinate al bene pubblico o spirituale, per trarre enormi profitti economici e favorire raccomandati.",
      "citazione": "\"Fatto v'avete dio d'oro e d'argento;\\ne che altro \u00e8 da voi a l'idolatre,\\nse non ch'elli uno, e voi ne orate cento?\"",
      "contrappasso": "Essendo stati avidi di beni terreni e avendo capovolto i valori della Chiesa, ora sono conficcati a testa in gi\u00f9, con i piedi lambiti da fiamme (parodia dello Spirito Santo).",
      "defense": "L'unica debole difesa storica \u00e8 la natura sistemica del potere. La politica medievale richiedeva alleanze familiari forti e fondi economici enormi per sopravvivere e mantenere l'indipendenza.",
      "crossExamination": [
        {
          "question": "Il peccato di cui \u00e8 accusato Niccol\u00f2 III \u00e8 la 'Simonia'. Da cosa deriva questo termine?",
          "options": [
            "Dal profeta Simone che fond\u00f2 la Banca del Vaticano.",
            "Da Simon Mago, che tent\u00f2 di comprare i poteri dello Spirito Santo da San Pietro.",
            "Dal latino 'Simon', che significa 'Moneta d'oro'."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Prende il nome da Simon Mago (Atti degli Apostoli), che cerc\u00f2 di acquistare il potere di fare miracoli con il denaro."
        },
        {
          "question": "Perch\u00e9 Dante afferma 'Fatto v'avete dio d'oro e d'argento'?",
          "options": [
            "Perch\u00e9 il Papa aveva fatto fondere statue d'oro di se stesso.",
            "Perch\u00e9 hanno sostituito la venerazione di Dio con l'ossessione per il denaro e la ricchezza.",
            "Perch\u00e9 usavano monete d'oro per l'eucaristia."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! \u00c8 una forte accusa di idolatria: i papi simoniaci venerano la ricchezza materiale (il dio denaro) al posto del vero Dio spirituale."
        },
        {
          "question": "Come risponde la difesa alla pesante accusa di nepotismo?",
          "options": [
            "Giustificandolo come un 'male necessario' della politica feudale e delle alleanze di potere.",
            "Negando categoricamente che i parenti di Niccol\u00f2 III si siano arricchiti.",
            "Sostenendo che i parenti del Papa fossero tutti dei santi uomini."
          ],
          "correctIndex": 0,
          "explanation": "Giusto! La difesa prova a storicizzare il problema: nel Medioevo, senza l'appoggio economico e politico dei propri parenti, un Papa non poteva sopravvivere alle lotte di potere (un classico 'lo facevano tutti')."
        }
      ],
      "reflection": "Oggi, usare la propria posizione di potere per avvantaggiare amici e parenti (raccomandazioni, appalti) \u00e8 un crimine grave contro la societ\u00e0 o un 'male necessario' ormai normalizzato?",
      "sealPuzzle": {
        "riddle": "Come si chiama l'azione illegale di favorire i propri parenti concedendo loro incarichi di potere, inventata proprio dai Papi medievali? (10 lettere)",
        "answer": "NEPOTISMO"
      }
    }
  },
  {
    "id": "pier_vigna",
    "image": "assets/cases/pier_vigna.png",
    "campaignId": "inferno",
    "characterName": "Pier delle Vigne",
    "canto": "Canto XIII",
    "cerchio": "Violenti",
    "order": 6,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Ti trovi in una selva tetra e senza foglie. Qui un tronco d'albero sanguina e parla quando gli spezzi un ramo. \u00c8 l'anima di Pier delle Vigne.",
      "obiettivo": "Indagare il peso del giudizio sociale, della calunnia e la tragedia di chi toglie la vita a se stesso per sfuggire al disonore.",
      "facts": "Pier delle Vigne fu il cancelliere, intimo consigliere e fidato diplomatico dell'Imperatore Federico II di Svevia. Deteneva le 'due chiavi' del cuore del sovrano.",
      "tragedia": "Vittima dell'invidia della corte, fu falsamente accusato di tradimento, accecato e gettato in prigione. Incapace di sopportare l'ingiustizia e il disonore, si uccise.",
      "accusation": "L'accusa \u00e8 il Suicidio. L'uomo non \u00e8 padrone assoluto della propria vita, ma custode di un dono divino. Distruggendo se stesso, si disprezza il creato e la natura umana.",
      "citazione": "\"L'animo mio, per disdegnoso gusto,\\ncredendo col morir fuggir disdegno,\\ningiusto fece me contra me giusto.\"",
      "contrappasso": "Avendo rifiutato il proprio corpo umano gettandolo via, le loro anime sono private di fattezze umane: crescono come alberi contorti mentre le Arpie mangiano le loro foglie.",
      "defense": "Piero fu vittima della 'meretrice' invidia e della calunnia della corte. Il suicidio fu un atto disperato per mantenere la propria purezza morale rispetto al tradimento di cui era accusato.",
      "crossExamination": [
        {
          "question": "Cosa intende Pier delle Vigne quando dice 'ingiusto fece me contra me giusto'?",
          "options": [
            "Che era colpevole di tradimento ma innocente di suicidio.",
            "Che per sfuggire all'ingiustizia degli altri, ha commesso lui stesso un'azione ingiusta (uccidersi) contro se stesso che era un uomo giusto.",
            "Che si \u00e8 fatto giustizia da solo uccidendo i suoi nemici."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! \u00c8 il paradosso tragico del suicida per onore: pur essendo un uomo 'giusto' (innocente dal tradimento), ha agito ingiustamente contro il proprio corpo."
        },
        {
          "question": "Quale bestia mitologica tormenta le anime dei suicidi nel loro contrappasso?",
          "options": [
            "Le Arpie (uccelli dal volto di donna che strappano i loro rami).",
            "Cerbero (che mastica le radici degli alberi).",
            "Il Minotauro (che abbatte i tronchi)."
          ],
          "correctIndex": 0,
          "explanation": "Esatto! Le Arpie nidificano tra i loro rami e si nutrono delle loro foglie, causando loro dolore e fornendo loro una 'voce' (le ferite sanguinanti permettono alle anime di parlare)."
        },
        {
          "question": "Chi \u00e8 la 'meretrice' (prostituta) che Piero incolpa per la sua rovina e che infetta le corti?",
          "options": [
            "L'avarizia, che corrompe i tesorieri.",
            "L'Invidia, che spinge a calunniare chi ha successo.",
            "La lussuria, che distrae gli imperatori."
          ],
          "correctIndex": 1,
          "explanation": "Giusto! Piero incolpa l'Invidia degli altri cortigiani, che lo hanno falsamente accusato di tradimento per distruggere la sua influenza sull'Imperatore."
        }
      ],
      "reflection": "Quanto peso ha la societ\u00e0 (tramite calunnie, cyberbullismo, invidia) nel portare una persona all'estremo gesto? La colpa \u00e8 solo di chi lo compie o c'\u00e8 un concorso di colpa sociale?",
      "sealPuzzle": {
        "riddle": "Pier delle Vigne ne custodiva due, per aprire e chiudere il cuore dell'Imperatore. Quali oggetti metaforici? (6 lettere, plurale)",
        "answer": "CHIAVI"
      }
    }
  },
  {
    "id": "ugolino",
    "image": "assets/cases/ugolino.png",
    "campaignId": "inferno",
    "characterName": "Conte Ugolino",
    "canto": "Canto XXXIII",
    "cerchio": "Traditori",
    "order": 10,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Nel ghiaccio eterno del Cocito, un'ombra morde il cranio del suo vicino. \u00c8 il Conte Ugolino della Gherardesca.",
      "obiettivo": "Analizzare la brutalit\u00e0 della vendetta politica, il tradimento, e il limite in cui la pena supera la colpa coinvolgendo innocenti.",
      "facts": "Il Conte Ugolino fu il leader politico di Pisa. In un periodo di lotte feroci, stipul\u00f2 accordi ambigui cedendo castelli ai nemici per salvare se stesso o la citt\u00e0.",
      "tragedia": "Il suo avversario, l'Arcivescovo Ruggieri, lo trad\u00ec. Ugolino fu rinchiuso nella Torre della Muda con i suoi figli innocenti e lasciati morire di fame.",
      "accusation": "Ugolino \u00e8 condannato come Traditore della Patria per le sue oscure manovre politiche e i castelli ceduti. \u00c8 nel punto pi\u00f9 basso dell'Inferno.",
      "citazione": "\"Poscia, pi\u00f9 che 'l dolor, pot\u00e9 'l digiuno.\"\n\"che se 'l conte Ugolino aveva voce\\nd'aver tradita te de le castella...\"",
      "contrappasso": "Come in vita consumarono freddamente la patria o i parenti con l'odio, ora sono immersi nel ghiaccio che li paralizza. Ugolino mangia ferocemente il cranio del suo traditore.",
      "defense": "Ugolino richiama empatia universale raccontando la straziante morte innocente dei suoi figli. L'atto mostruoso di Ruggieri rende la crudelt\u00e0 del potere politico intollerabile.",
      "crossExamination": [
        {
          "question": "Il contrappasso dei traditori prevede che siano immersi nel ghiaccio (Cocito). Perch\u00e9 il ghiaccio e non il fuoco?",
          "options": [
            "Perch\u00e9 Pisa si trova a Nord.",
            "Perch\u00e9 il tradimento spegne il calore dell'amore e della fiducia, raggelando l'anima.",
            "Per raffreddare la loro eterna rabbia."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Il fuoco simboleggia spesso la passione (es. Paolo e Francesca, Ulisse). Il tradimento, invece, \u00e8 un peccato 'a freddo', calcolato, che priva l'uomo di ogni calore umano (l'amore)."
        },
        {
          "question": "Cosa implica la terribile frase 'Poscia, pi\u00f9 che 'l dolor, pot\u00e9 'l digiuno'?",
          "options": [
            "Che Ugolino mor\u00ec di fame prima che per il dolore del lutto.",
            "Che Ugolino us\u00f2 il digiuno come protesta politica.",
            "\u00c8 un verso ambiguo che suggerisce che, accecato dalla fame estrema, Ugolino abbia divorato i corpi dei suoi stessi figli."
          ],
          "correctIndex": 2,
          "explanation": "Esatto. Il celebre verso lascia sospeso il dubbio se la fame lo abbia ucciso dopo il dolore, o se la fame lo abbia portato ad atti di cannibalismo estremo."
        },
        {
          "question": "Su quale concetto fa leva l'Avvocato Difensore per suscitare clemenza?",
          "options": [
            "Sulla sproporzione della pena terrena (la morte atroce dei figli innocenti) rispetto alla sua colpa politica.",
            "Sulla legittimit\u00e0 legale del tradimento in tempo di guerra.",
            "Sul fatto che l'Arcivescovo Ruggieri fosse pi\u00f9 cattivo di lui."
          ],
          "correctIndex": 0,
          "explanation": "Giusto. La difesa sostiene che, sebbene Ugolino abbia sbagliato politicamente, averlo costretto a veder morire di inedia i propri figli innocenti \u00e8 un supplizio che azzera e supera il suo crimine."
        }
      ],
      "reflection": "Nelle guerre moderne, quanto \u00e8 frequente che per punire i 'padri' (governi, leader) si facciano soffrire in modo atroce i 'figli' (civili innocenti)?",
      "sealPuzzle": {
        "riddle": "In quale angusta struttura muraria (che ancora oggi prende il nome di quel terribile evento) furono rinchiusi a morire di fame? (5 lettere)",
        "answer": "TORRE"
      }
    }
  },
  {
    "id": "ulisse",
    "image": "assets/cases/ulisse.png",
    "campaignId": "inferno",
    "characterName": "Ulisse",
    "canto": "Canto XXVI",
    "cerchio": "Fraudolenti",
    "order": 8,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Nell'abisso roccioso le anime brillano come lucciole ma sono avvolte da altissime fiamme. Una fiamma a due corni si agita: \u00e8 Ulisse.",
      "obiettivo": "Comprendere il confine tra la nobile sete di conoscenza umana e l'orgoglio arrogante (hybris) che non riconosce limiti.",
      "facts": "Ulisse (Odisseo), re di Itaca, noto per l'inganno del Cavallo di Troia. Tornato in patria, rifiut\u00f2 di restare, spinto dal desiderio di esplorare l'ignoto.",
      "tragedia": "Convinse con un discorso persuasivo (orazione picciola) i compagni a superare le Colonne d'Ercole. Furono affondati da un vortice a un passo dal Purgatorio.",
      "accusation": "Condannato per l'uso fraudolento dell'intelletto (Cavallo di Troia), ma soprattutto per aver convinto i suoi uomini a un'impresa mortale oltre i limiti divini.",
      "citazione": "\"Considerate la vostra semenza:\\nfatti non foste a viver come bruti,\\nma per seguir virtute e canoscenza.\"",
      "contrappasso": "Poich\u00e9 in vita usarono l'intelligenza di nascosto per ingannare, ora la loro anima \u00e8 eternamente nascosta e fasciata da una fiamma che li brucia.",
      "defense": "Ulisse incarna la spinta primordiale dell'umanit\u00e0 al progresso e alla scoperta. Il suo desiderio di 'divenir del mondo esperto' non \u00e8 vile, ma l'essenza stessa della dignit\u00e0 umana.",
      "crossExamination": [
        {
          "question": "Il 'folle volo' di Ulisse supera un limite geografico e allegorico invalicabile. Quale?",
          "options": [
            "Il Mare del Nord.",
            "Le Colonne d'Ercole (Stretto di Gibilterra), simbolo del confine imposto da Dio alla conoscenza umana.",
            "La rotta verso l'America."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Nel Medioevo, le Colonne d'Ercole segnavano il limite invalicabile per l'uomo; superarle con l'astuzia significava sfidare i divieti divini."
        },
        {
          "question": "Secondo l'Accusa, Ulisse \u00e8 un Consigliere Fraudolento. In che modo ha frodato i suoi stessi compagni nel suo ultimo viaggio?",
          "options": [
            "Rubando la cassa della nave.",
            "Usando una bellissima orazione linguistica per manipolarli emotivamente, nascondendo loro il pericolo mortale per soddisfare la propria ambizione.",
            "Vendendoli come schiavi in Spagna."
          ],
          "correctIndex": 1,
          "explanation": "Giusto! L'inganno non sta solo nel Cavallo di Troia, ma nell'usare la sua retorica (l'orazione picciola) per ingannare i compagni verso morte certa, facendolo sembrare un atto eroico."
        },
        {
          "question": "Come possiamo interpretare l'arringa della Difesa per Ulisse in un'ottica moderna?",
          "options": [
            "Come un monito a non viaggiare per mare.",
            "Come la difesa della ricerca scientifica indipendente, che non deve avere limiti dogmatici imposti dalla religione.",
            "Come una scusa per tradire la propria famiglia (Penelope)."
          ],
          "correctIndex": 1,
          "explanation": "Esatto. La difesa esalta l'Ulisse esploratore come il pioniere della scienza moderna, l'uomo che rifiuta di essere 'bruto' (ignorante) e rischia tutto per la verit\u00e0."
        }
      ],
      "reflection": "Il progresso umano, scientifico e tecnologico (es. intelligenza artificiale, genetica) deve avere dei limiti etici invalicabili, oppure la 'conoscenza' giustifica ogni rischio?",
      "sealPuzzle": {
        "riddle": "Quante erano le colonne usate dagli antichi e da Dante per indicare il confine del mondo esplorabile? (Scrivi il numero a lettere, es. CINQUE)",
        "answer": "DUE"
      }
    }
  }
,
  {
    "id": "casella",
    "image": "assets/cases/casella.png",
    "campaignId": "purgatorio",
    "characterName": "Casella",
    "canto": "Canto II",
    "cerchio": "Antipurgatorio",
    "order": 1,
    "active": true,
    "phases": {
      "intro": "Benvenuto alla spiaggia del Purgatorio. L'alba tinge il mare, e una barca guidata da un angelo scarica nuove anime. Tra esse, Dante riconosce il suo vecchio amico Casella, un musicista.",
      "obiettivo": "Comprendere il pericolo della nostalgia e delle distrazioni terrene rispetto al cammino di purificazione spirituale.",
      "facts": "Casella era un celebre cantore e musico fiorentino, caro amico di Dante, che spesso aveva messo in musica le poesie del Sommo Poeta.",
      "tragedia": "Appena sbarcato, Dante cerca di abbracciarlo invano (il corpo \u00e8 d'aria). Per consolarsi dall'affanno del viaggio, Dante gli chiede di cantare. Casella intona dolcemente 'Amor che ne la mente mi ragiona', incantando tutti i presenti.",
      "accusation": "Non c'\u00e8 un peccato grave, ma un rimprovero severo. Catone il Censore interviene urlando, accusandoli di negligenza: si sono fermati ad ascoltare una canzone terrena dimenticando che il loro unico scopo ora \u00e8 purificarsi per raggiungere Dio.",
      "citazione": "\"Che \u00e8 ci\u00f2, spiriti lenti?\\nqual negligenza, quale stare \u00e8 questo?\\nCorrete al monte a spogliarvi lo scoglio...\"",
      "contrappasso": "Nessun contrappasso punitivo. La loro 'pena' \u00e8 l'attesa nell'Antipurgatorio e la fatica di dover scalare la montagna per liberarsi delle scorie (lo scoglio) del peccato.",
      "defense": "La difesa elogia la forza consolatoria dell'arte e dell'amicizia. La musica di Casella non era un peccato malvagio, ma un istante di sollievo umano necessario dopo il terrore della morte e dell'Inferno.",
      "crossExamination": [
        {
          "question": "Perch\u00e9 il rimprovero di Catone \u00e8 cos\u00ec duro contro un atto apparentemente innocuo come ascoltare musica?",
          "options": [
            "Perch\u00e9 Catone odiava la musica e i poeti.",
            "Perch\u00e9 nel Purgatorio il tempo \u00e8 prezioso e ogni attaccamento ai piaceri terreni distrae dall'urgenza della salvezza.",
            "Perch\u00e9 Casella stava cantando una canzone blasfema."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Nel Purgatorio l'urgenza di liberarsi dal peccato \u00e8 assoluta; l'arte fine a se stessa diventa una distrazione (negligenza)."
        },
        {
          "question": "Quando Dante cerca di abbracciare Casella, le sue braccia si chiudono sul petto vuoto per tre volte. Cosa simboleggia?",
          "options": [
            "La natura incorporea delle anime e l'impossibilit\u00e0 di replicare gli affetti fisici terreni.",
            "Che Casella in realt\u00e0 \u00e8 un demone dell'Inferno mascherato.",
            "Che Casella non vuole essere toccato perch\u00e9 \u00e8 arrabbiato con Dante."
          ],
          "correctIndex": 0,
          "explanation": "Giusto. Riprende un motivo virgiliano: l'anima \u00e8 un'ombra inconsistente, e gli affetti puramente fisici del mondo terreno appartengono al passato."
        },
        {
          "question": "Nonostante il rimprovero, quale aspetto positivo (difesa) emerge dall'episodio di Casella?",
          "options": [
            "La dimostrazione che le regole possono essere infrante.",
            "La bellezza immortale dell'arte, della poesia e dei legami d'amicizia che sopravvivono alla morte.",
            "Il fatto che Catone sia un guardiano ingiusto."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Il canto sottolinea come la musica e l'amicizia siano doni meravigliosi, anche se nell'aldil\u00e0 devono essere trascesi per un bene superiore."
        }
      ],
      "reflection": "Oggi la distrazione continua (smartphone, social, intrattenimento) ci impedisce di concentrarci sui nostri veri obiettivi. La 'negligenza' rimproverata da Catone \u00e8 il male della nostra epoca?",
      "sealPuzzle": {
        "riddle": "L'angelo porta le anime su una barca velocissima spinta senza remi o vele. Cosa usa l'angelo per far muovere la barca? (3 lettere, plurale)",
        "answer": "ALI"
      }
    }
  },
  {
    "id": "manfredi",
    "image": "assets/cases/manfredi.png",
    "campaignId": "purgatorio",
    "characterName": "Manfredi di Svevia",
    "canto": "Canto III",
    "cerchio": "Antipurgatorio",
    "order": 2,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Ai piedi della ripida montagna, un gruppo di anime procede lentissimo. Una di loro \u00e8 un giovane biondo, bello e di gentile aspetto, ferito al petto e al volto: \u00e8 Re Manfredi.",
      "obiettivo": "Giudicare se la scomunica politica della Chiesa abbia il potere di dannare un'anima, o se la clemenza di Dio superi ogni giudizio umano.",
      "facts": "Manfredi, figlio naturale di Federico II, fu Re di Sicilia. Nemico giurato del Papato (che lo aveva scomunicato), mor\u00ec eroicamente nella Battaglia di Benevento contro i francesi angioini.",
      "tragedia": "Essendo scomunicato, il suo corpo fu dissotterrato dal vescovo di Cosenza e gettato fuori dai confini del regno, senza sepoltura sacra, esposto alle intemperie e ai cani.",
      "accusation": "La Chiesa terrena lo aveva condannato per i suoi peccati orribili, per la sua superbia e per la sua opposizione al potere papale, dichiarandolo perduto per sempre.",
      "citazione": "\"Orribil furon li peccati miei;\\nma la bont\u00e0 infinita ha s\u00ec gran braccia,\\nche prende ci\u00f2 che si rivolge a lei.\"",
      "contrappasso": "Scomunicato in vita, ora deve attendere nell'Antipurgatorio (fuori dai confini del Purgatorio vero e proprio) per trenta volte il tempo che pass\u00f2 in contumacia contro la Chiesa.",
      "defense": "La difesa si basa sul puro perdono divino. In punto di morte, Manfredi si pent\u00ec piangendo e si affid\u00f2 a Dio. La Grazia divina \u00e8 infinitamente pi\u00f9 grande e misericordiosa dei decreti politici del Papa.",
      "crossExamination": [
        {
          "question": "Quale concetto teologico rivoluzionario esprime l'episodio di Manfredi?",
          "options": [
            "Che i re non possono andare all'Inferno.",
            "Che la scomunica del Papa non ha alcun valore se l'anima si pente in punto di morte, perch\u00e9 Dio \u00e8 pi\u00f9 grande della Chiesa terrena.",
            "Che chi muore in battaglia \u00e8 automaticamente salvato."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! \u00c8 una fortissima critica politica: Dante afferma che i prelati non possono decidere la salvezza di un'anima, perch\u00e9 la misericordia di Dio sfugge alla giurisdizione umana."
        },
        {
          "question": "Perch\u00e9 Manfredi mostra a Dante le sue ferite ('or vedi la piaga a sommo 'l petto')?",
          "options": [
            "Per chiedere vendetta contro i francesi.",
            "Per fargli capire che i morti provano dolore fisico.",
            "Per essere riconosciuto e per dimostrare che, nonostante il corpo martoriato e umiliato, la sua anima \u00e8 salva e regale."
          ],
          "correctIndex": 2,
          "explanation": "Giusto! Le ferite subite a Benevento e il successivo oltraggio al suo cadavere contrastano con la sua salvezza spirituale."
        },
        {
          "question": "Come si pu\u00f2 ridurre il tempo di attesa nell'Antipurgatorio secondo Manfredi?",
          "options": [
            "Attraverso le preghiere dei vivi sulla terra.",
            "Corrompendo l'Angelo guardiano.",
            "Scalando la montagna di nascosto."
          ],
          "correctIndex": 0,
          "explanation": "Esatto. Il tema del 'suffragio': le preghiere dei vivi, se fatte in grazia di Dio, possono accorciare la pena delle anime purganti."
        }
      ],
      "reflection": "Oggi molte istituzioni si arrogano il diritto di giudicare definitivamente chi \u00e8 'buono' e chi \u00e8 'cattivo', chi \u00e8 'dentro' e chi \u00e8 'fuori'. Il pentimento tardivo merita davvero il reintegro sociale?",
      "sealPuzzle": {
        "riddle": "La punizione ecclesiastica che esclude un fedele dai sacramenti, usata spessissimo come arma politica dai Papi, subita da Manfredi. (9 lettere)",
        "answer": "SCOMUNICA"
      }
    }
  },
  {
    "id": "pia_tolomei",
    "image": "assets/cases/pia_tolomei.png",
    "campaignId": "purgatorio",
    "characterName": "Pia de' Tolomei",
    "canto": "Canto V",
    "cerchio": "Antipurgatorio",
    "order": 3,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Tra le anime dei morti violentemente che si pentirono all'ultimo istante, una voce dolcissima e malinconica si rivolge a Dante, chiedendogli di essere ricordata.",
      "obiettivo": "Sensibilizzare sul tema della violenza domestica, del femminicidio e della memoria di coloro che scompaiono nel silenzio.",
      "facts": "Pia era una nobildonna di Siena. Sposata a Nello de' Pannocchieschi, fu confinata nel castello della Maremma per motivi mai chiariti (forse gelosia, forse interessi politici).",
      "tragedia": "Nel silenzio letale della Maremma, fu uccisa dal marito, precipitata dalla finestra del castello. Un omicidio freddo e senza giustizia terrena.",
      "accusation": "Non c'\u00e8 accusa contro di lei, ma contro l'atrocit\u00e0 del suo assassino. Pia \u00e8 vittima della brutale possessivit\u00e0 e violenza del marito che l'aveva 'inanellata' (sposata).",
      "citazione": "\"Ricorditi di me, che son la Pia;\\nSiena mi f\u00e9, disfecemi Maremma:\\nsalsi colui che 'nnanellata pria\\ndisposando m'avea con la sua gemma.\"",
      "contrappasso": "Poich\u00e9 per\u00ec di morte violenta senza poter ricevere i sacramenti per tempo (pentendosi solo negli ultimi istanti), deve sostare nell'Antipurgatorio.",
      "defense": "La sua difesa risiede nella sua immensa delicatezza e dignit\u00e0. Pia non chiede vendetta, ma solo piet\u00e0 e ricordo. \u00c8 il volto mite e tragico delle donne vittime di violenza.",
      "crossExamination": [
        {
          "question": "A differenza delle anime infernali che gridano vendetta o maledicono i loro aguzzini, quale atteggiamento mostra Pia verso Dante?",
          "options": [
            "Gli chiede di uccidere suo marito Nello.",
            "Mostra un'infinita delicatezza, chiedendogli di ricordarla solo dopo che si sar\u00e0 riposato dal lungo viaggio.",
            "Minaccia Dante se non pregher\u00e0 per lei."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Dice 'quando tu sarai tornato al mondo, e riposato de la lunga via...'. La sua premura per la stanchezza di Dante contrasta tragicamente con la crudelt\u00e0 subita."
        },
        {
          "question": "Cosa significa il verso 'Siena mi f\u00e9, disfecemi Maremma'?",
          "options": [
            "Che a Siena \u00e8 nata e in Maremma \u00e8 morta (uccisa).",
            "Che a Siena era ricca e in Maremma \u00e8 andata in bancarotta.",
            "Che ha costruito una casa a Siena e l'ha demolita in Maremma."
          ],
          "correctIndex": 0,
          "explanation": "Giusto. \u00c8 una sintesi poetica magistrale e lapidaria della sua vita: nata a Siena, morta (disfatta) in Maremma."
        },
        {
          "question": "Pia non pronuncia mai il nome del suo assassino. Che effetto produce questa scelta stilistica?",
          "options": [
            "Indica che Pia soffriva di amnesia.",
            "Dimostra che Nello era innocente.",
            "Rende il marito un'ombra innominabile, cancellandolo dalla dignit\u00e0 del ricordo, lasciando il focus solo sul tragico destino di lei."
          ],
          "correctIndex": 2,
          "explanation": "Esatto. 'Salsi colui...' (lo sa colui). Cancellare il nome dell'assassino \u00e8 un atto di dignit\u00e0 estrema; lui non merita di esistere nella memoria poetica."
        }
      ],
      "reflection": "Il femminicidio \u00e8 una piaga ancora oggi dilagante. Quanto la struttura patriarcale e il concetto tossico di 'possesso' (inanellata con la sua gemma) continuano a 'disfare' vite nel silenzio?",
      "sealPuzzle": {
        "riddle": "Quale oggetto simbolico, menzionato da Pia, rappresenta il patto matrimoniale che il marito ha tradito e usato per rivendicare il 'possesso' su di lei? (5 lettere)",
        "answer": "GEMMA"
      }
    }
  },
  {
    "id": "oderisi",
    "image": "assets/cases/oderisi.png",
    "campaignId": "purgatorio",
    "characterName": "Oderisi da Gubbio",
    "canto": "Canto XI",
    "cerchio": "Superbi",
    "order": 4,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Sulla Prima Cornice del Purgatorio, anime avanzano schiacciate dal peso di enormi macigni che li costringono a guardare in basso. Una di queste anime \u00e8 Oderisi da Gubbio.",
      "obiettivo": "Indagare il peccato di superbia, la vanagloria dell'arte e l'illusione della fama terrena che passa con il tempo.",
      "facts": "Oderisi fu un famosissimo e geniale miniatore (illustratore di manoscritti) del suo tempo, stimato in tutta Italia. In vita fu accecato dalla propria bravura e non ammetteva rivali.",
      "tragedia": "Convinto di essere insuperabile, l'orgoglio del suo talento lo port\u00f2 a disprezzare gli altri e a rincorrere unicamente la fama terrena.",
      "accusation": "La superbia, il primo e pi\u00f9 grave dei vizi capitali. Ha creduto che il suo talento fosse merito esclusivamente suo, gonfiandosi di orgoglio e dimenticando che ogni dote \u00e8 un dono di Dio.",
      "citazione": "\"Oh vana gloria de le umane posse!\\ncom' poco verde in su la cima dura,\\nse non \u00e8 giunta da l'etati grosse!\"",
      "contrappasso": "Poich\u00e9 in vita camminarono con la testa alta per l'orgoglio, ora camminano chini sotto il peso umiliante di pesanti macigni, battendosi il petto e imparando l'umilt\u00e0.",
      "defense": "Oderisi ha finalmente compreso l'inutilit\u00e0 dell'orgoglio. Ammette spontaneamente che il suo allievo Franco Bolognese \u00e8 ora pi\u00f9 bravo di lui, dimostrando un completo e sincero pentimento.",
      "crossExamination": [
        {
          "question": "Cosa intende Oderisi quando paragona la fama al colore 'verde in su la cima' (il verde delle foglie sulle vette)?",
          "options": [
            "Che la fama fa bene alla natura.",
            "Che la gloria dura pochissimo tempo, proprio come le foglie verdi che cadono presto, a meno che non seguano periodi di decadenza artistica (etati grosse).",
            "Che solo i contadini possono capire cos'\u00e8 la gloria."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! La fama \u00e8 effimera. Se dopo un grande artista nasce un artista ancora pi\u00f9 geniale, la fama del primo scompare immediatamente."
        },
        {
          "question": "Quale esempio clamoroso fa Oderisi per dimostrare che la fama passa velocemente?",
          "options": [
            "Cimabue che credeva di dominare la pittura ed \u00e8 stato superato da Giotto.",
            "Cesare superato da Augusto.",
            "Omero superato da Virgilio."
          ],
          "correctIndex": 0,
          "explanation": "Giusto! Cita proprio l'arte a lui contemporanea: Cimabue pensava di tenere il campo, ma poi \u00e8 arrivato Giotto e la fama di Cimabue si \u00e8 oscurata."
        },
        {
          "question": "Qual \u00e8 il contrappasso fisico per la Superbia nella Prima Cornice?",
          "options": [
            "Hanno la testa tagliata.",
            "Sono costretti a portare enormi pesi di pietra sulla schiena che li piegano verso la terra.",
            "Devono lodare tutti quelli che passano."
          ],
          "correctIndex": 1,
          "explanation": "Esatto. Questo piegarsi innaturale ed estenuante li costringe alla posizione fisica dell'umilt\u00e0, fissando la terra (e vedendo scolpiti i bassorilievi dell'umilt\u00e0 sul pavimento)."
        }
      ],
      "reflection": "Oggi la 'vana gloria' si chiama ricerca di Likes, Followers e viralit\u00e0. La superbia di primeggiare sui social media rende schiavi di una fama che 'poco verde in su la cima dura'?",
      "sealPuzzle": {
        "riddle": "La forma d'arte in cui Oderisi eccelleva, che consisteva nell'illustrare in piccolo i manoscritti medievali con pigmenti pregiati. (9 lettere)",
        "answer": "MINIATURA"
      }
    }
  },
  {
    "id": "stazio",
    "image": "assets/cases/stazio.png",
    "campaignId": "purgatorio",
    "characterName": "Stazio",
    "canto": "Canto XXI",
    "cerchio": "Avari_Purg",
    "order": 5,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Mentre Dante e Virgilio camminano sulla Quinta Cornice, la montagna del Purgatorio trema violentemente e tutte le anime gridano 'Gloria in excelsis Deo'. Appare uno spirito luminoso: \u00e8 il poeta latino Stazio.",
      "obiettivo": "Indagare il ruolo segreto della poesia nell'ispirare le conversioni e l'eccesso opposto all'avarizia: la prodigalit\u00e0.",
      "facts": "Stazio fu un poeta epico latino (autore della Tebaide), ammiratore accanito di Virgilio. Nonostante visse nell'impero pagano, si convert\u00ec segretamente al Cristianesimo.",
      "tragedia": "Visse la sua fede nascostamente per paura delle persecuzioni. Inoltre, non pecc\u00f2 di avarizia, ma del vizio opposto: la prodigalit\u00e0 (spendere in modo sfrenato e irresponsabile).",
      "accusation": "La sua colpa principale \u00e8 stata la tiepidezza (accidia) nel dichiarare la sua fede per codardia, e la dissipazione scriteriata delle sue ricchezze terrene senza giusta misura.",
      "citazione": "\"Per te poeta fui, per te cristiano:\\nma perch\u00e9 veggi me' ci\u00f2 ch'io disegno,\\na colorare stender\u00f2 la mano.\"",
      "contrappasso": "Per la prodigalit\u00e0 (che condivide la cornice con l'Avarizia) \u00e8 stato disteso faccia a terra, piangendo e legato (adhasit pavimento anima mea), imparando che i beni terreni non vanno n\u00e9 adorati n\u00e9 sprecati.",
      "defense": "Stazio elogia incondizionatamente Virgilio. Virgilio, pur essendo pagano, con la sua poesia (la IV Ecloga e l'Eneide) gli ha illuminato la strada del Cristianesimo. Stazio rappresenta il trionfo della Grazia mediata dalla Cultura.",
      "crossExamination": [
        {
          "question": "Perch\u00e9 il monte del Purgatorio trema al passaggio di Stazio?",
          "options": [
            "Perch\u00e9 c'\u00e8 un terremoto causato dai peccatori.",
            "Perch\u00e9 Stazio ha completato la sua purificazione ed \u00e8 libero di salire al Paradiso, causando la gioia dell'intero monte.",
            "Perch\u00e9 Dio \u00e8 arrabbiato con lui."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Il terremoto e il canto corale avvengono ogni volta che un'anima si sente finalmente pura e pronta ad ascendere a Dio, indicando la fine della pena."
        },
        {
          "question": "Stazio rivela che Virgilio \u00e8 stato per lui come 'colui che va di notte, che porta il lume dietro...'. Cosa significa questa metafora?",
          "options": [
            "Che Virgilio faceva il guardiano notturno.",
            "Che Virgilio con la sua poesia ha illuminato la strada del Cristianesimo a chi veniva dopo di lui (Stazio), restando per\u00f2 lui stesso al buio (nel Limbo).",
            "Che Virgilio era una spia."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Una delle metafore pi\u00f9 belle: Virgilio ha portato la lampada dietro le sue spalle; non ha illuminato se stesso (\u00e8 morto pagano), ma ha illuminato chi lo seguiva."
        },
        {
          "question": "Quale vizio purga Stazio nella cornice degli Avari?",
          "options": [
            "L'avarizia (accumulo).",
            "La lussuria.",
            "La prodigalit\u00e0 (lo spreco eccessivo senza ritegno)."
          ],
          "correctIndex": 2,
          "explanation": "Giusto! Dante chiarisce che la prodigalit\u00e0 (spendere troppo e male) \u00e8 condannata esattamente come l'avarizia (non spendere), perch\u00e9 entrambe violano il principio del giusto mezzo (l'equilibrio aristotelico)."
        }
      ],
      "reflection": "Se l'avarizia \u00e8 un male riconosciuto, lo spreco (prodigalit\u00e0, acquisti compulsivi, fast fashion) \u00e8 altrettanto dannoso per l'equilibrio della societ\u00e0 e del pianeta?",
      "sealPuzzle": {
        "riddle": "In che condizione sono posizionate le anime nella cornice degli avari e prodighi per punire il loro eccessivo attaccamento ai beni terreni? (7 lettere)",
        "answer": "SDRAIATI"
      }
    }
  }
,
  {
    "id": "sordello",
    "image": "assets/cases/sordello.png",
    "campaignId": "purgatorio",
    "characterName": "Sordello da Goito",
    "canto": "Canto VI",
    "cerchio": "Antipurgatorio",
    "order": 6,
    "active": true,
    "phases": {
      "intro": "Benvenuto. Nell'Antipurgatorio un'ombra si erge isolata, altera e fiera, muovendo gli occhi in modo lento e grave, a guisa di leone quando si posa. \u00c8 Sordello da Goito.",
      "obiettivo": "Esplorare il concetto di Patria, l'amore fraterno civile e la feroce invettiva politica contro le guerre civili.",
      "facts": "Sordello fu un famoso trovatore del XIII secolo. Originario di Mantova, visse in varie corti (inclusa quella francese) scrivendo aspre satire politiche contro i sovrani corrotti.",
      "tragedia": "Assistendo alla costante guerra civile tra le citt\u00e0 italiane (e all'inettitudine degli Imperatori), esprime il dramma di una patria divisa e sanguinante.",
      "accusation": "Non \u00e8 sotto accusa diretta, ma l'incontro scatena la pi\u00f9 dura invettiva di Dante ('Ahi serva Italia, di dolore ostello') contro la corruzione, l'abbandono imperiale e le lotte fratricide.",
      "citazione": "\"Quell'ombra tutta in s\u00e9 romita\\nverso noi venne...\\n'O Mantoano, io son Sordello de la tua terra!'; e l'un l'altro abbracciava.\"",
      "contrappasso": "Anche lui \u00e8 nell'Antipurgatorio, costretto ad attendere (forse tra i morti di morte violenta o i negligenti).",
      "defense": "Il gesto di Sordello \u00e8 la massima difesa dell'amor patrio. Solo sentendo il nome 'Mantova', abbandona la sua fierezza per abbracciare Virgilio, un concittadino nato secoli prima di lui.",
      "crossExamination": [
        {
          "question": "Cosa spinge l'altero Sordello ad abbracciare improvvisamente Virgilio?",
          "options": [
            "Virgilio gli offre del cibo.",
            "Virgilio pronuncia la parola 'Mantova' (la loro patria comune).",
            "Sordello riconosce Virgilio dai suoi vestiti."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Il solo suono del nome della loro terra d'origine basta a far scattare un amore fraterno tra due anime che non si erano mai viste in vita."
        },
        {
          "question": "Nell'invettiva che segue, Dante chiama l'Italia 'nave sanza nocchiere in gran tempesta'. Chi \u00e8 il nocchiere mancante?",
          "options": [
            "Il Papa.",
            "L'Imperatore (Alberto d'Asburgo), che trascura l'Italia lasciandola alle guerre civili.",
            "Il Re di Francia."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Dante incolpa l'Impero di aver abbandonato il 'giardino dell'Impero' (l'Italia), causando caos politico e tirannie locali."
        },
        {
          "question": "Il gesto d'affetto tra Sordello e Virgilio viene usato da Dante per denunciare...",
          "options": [
            "...come invece i cittadini italiani viventi si odino e si facciano guerra, anche se chiusi dentro le stesse mura.",
            "...l'amicizia tra poeti.",
            "...che nell'aldil\u00e0 tutti si vogliono bene."
          ],
          "correctIndex": 0,
          "explanation": "Giusto! Il contrasto \u00e8 fortissimo: due morti di epoche diverse si abbracciano per puro amor patrio, mentre i vivi si sbranano 'dentro a un muro e a una fossa'."
        }
      ],
      "reflection": "Se l'amor di patria unisce, il nazionalismo spesso divide. Oggi l'identit\u00e0 nazionale \u00e8 motivo di solidariet\u00e0 come per Sordello, o pretesto per alzare muri contro il prossimo?",
      "sealPuzzle": {
        "riddle": "In che forma Dante definisce l'Italia, non pi\u00f9 signora (domina), ma schiava, diventata un 'bordello'? (5 lettere)",
        "answer": "SERVA"
      }
    }
  },
  {
    "id": "buonconte",
    "image": "assets/cases/buonconte.png",
    "campaignId": "purgatorio",
    "characterName": "Buonconte da Montefeltro",
    "canto": "Canto V",
    "cerchio": "Antipurgatorio",
    "order": 7,
    "active": true,
    "phases": {
      "intro": "Benvenuto, Giurato. Tra i morti per forza (in battaglia), si fa avanti uno spirito per narrare uno dei misteri pi\u00f9 grandi della storia fiorentina.",
      "obiettivo": "Riflettere sul valore del pentimento estremo e sulla lotta cosmica tra Bene e Male per il possesso dell'anima.",
      "facts": "Buonconte era un feroce condottiero ghibellino, figlio di Guido da Montefeltro. Guid\u00f2 le truppe contro i guelfi di Firenze (in cui combatteva Dante) nella Battaglia di Campaldino (1289).",
      "tragedia": "Sconfitto e ferito a morte, fugg\u00ec lungo l'Archiano. Il suo corpo non fu mai ritrovato, diventando leggenda.",
      "accusation": "Uomo sanguinario, condottiero crudele. Il demonio stesso era sceso per prendere la sua anima non appena spirato, certo che gli appartenesse per via dei suoi crimini in vita.",
      "citazione": "\"Quivi perdei la vista e la parola;\\nnel nome di Maria fini', e quivi\\ncaddi, e rimase la mia carne sola.\"",
      "contrappasso": "Nessun contrappasso, sosta tra coloro che si sono pentiti in extremis.",
      "defense": "Una lacrima. Fuggendo ferito, cadde e con l'ultimo respiro invoc\u00f2 Maria, versando una singola 'lagrimetta' di pentimento, che bast\u00f2 a strapparlo dall'Inferno.",
      "crossExamination": [
        {
          "question": "Cosa provoc\u00f2 l'ira del Demonio, tanto da spingerlo a scatenare una tempesta distruttiva sul corpo di Buonconte?",
          "options": [
            "Il fatto che Buonconte lo avesse insultato.",
            "La sconfitta a Campaldino.",
            "L'Angelo di Dio gli sottrasse l'anima di Buonconte per via di una sola 'lagrimetta' di pentimento."
          ],
          "correctIndex": 2,
          "explanation": "Esatto! Il demonio, furioso di essersi visto rubare l'anima per cos\u00ec poco ('per una lagrimetta'), si vendica scatenando il maltempo per disperdere il cadavere."
        },
        {
          "question": "Questo episodio forma un parallelismo inverso con un altro dannato, il padre di Buonconte. Chi era?",
          "options": [
            "Ugolino.",
            "Guido da Montefeltro (che and\u00f2 all'Inferno perch\u00e9 l'assoluzione senza pentimento fu invalidata dal demonio).",
            "Farinata degli Uberti."
          ],
          "correctIndex": 1,
          "explanation": "Giusto! Il padre Guido cerc\u00f2 l'assoluzione formale dal Papa ma non si pent\u00ec (e and\u00f2 all'Inferno), mentre il figlio Buonconte fu scomunicato ma si pent\u00ec (e fu salvato)."
        },
        {
          "question": "Cosa accadde al corpo materiale di Buonconte?",
          "options": [
            "Fu sepolto con onori.",
            "Il torrente Archiano lo inghiott\u00ec per via del nubifragio demoniaco e ne sciolse la croce di braccia.",
            "Fu bruciato dai guelfi."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Svela il mistero storico: il corpo fu spazzato via dalla fiumana causata dal demone furioso, cancellandone ogni traccia terrena."
        }
      ],
      "reflection": "Se una singola, autentica lacrima all'ultimo istante di vita pu\u00f2 cancellare i crimini di una vita intera, la giustizia terrena (che giudica i fatti) ha senso davanti a quella spirituale (che giudica il cuore)?",
      "sealPuzzle": {
        "riddle": "Come definisce ironicamente il Diavolo quell'unica piccola manifestazione di pentimento che gli ha fatto perdere l'anima di Buonconte? (10 lettere)",
        "answer": "LAGRIMETTA"
      }
    }
  }
,
  {
    "id": "piccarda",
    "image": "assets/cases/piccarda.png",
    "campaignId": "paradiso",
    "characterName": "Piccarda Donati",
    "canto": "Canto III",
    "cerchio": "Luna",
    "order": 1,
    "active": true,
    "phases": {
      "intro": "Benvenuto. Nel Cielo della Luna, tra spiriti che appaiono come immagini riflesse in un vetro terso, una donna dai tratti dolcissimi si rivolge a Dante sorridendo.",
      "obiettivo": "Comprendere che in Paradiso la felicit\u00e0 \u00e8 proporzionata alla capacit\u00e0 di amare, e nessuno desidera pi\u00f9 di ci\u00f2 che ha.",
      "facts": "Piccarda, sorella dell'amico di Dante Forese Donati, si era fatta suora clarissa. Fu rapita con la forza dal chiostro dal fratello Corso Donati per farle sposare, per motivi politici, Rossellino della Tosa.",
      "tragedia": "Costretta a violare i voti nuziali a Cristo, visse nel dolore il suo matrimonio forzato e mor\u00ec poco dopo.",
      "accusation": "Non \u00e8 un'accusa, ma un Limite Terreno: essendo stata forzata al matrimonio, la sua volont\u00e0 non si \u00e8 ribellata fino al martirio (ha sub\u00ecto la violenza), per cui i suoi voti risultarono 'inadempienti'.",
      "citazione": "\"E 'n la sua volontade \u00e8 nostra pace:\\nell'\u00e8 quel mare al qual tutto si move\\nci\u00f2 ch'ella cria o che natura face.\"",
      "contrappasso": "Corrispondenza di Beatitudine: Poich\u00e9 i suoi voti non furono mantenuti fermi in vita, gode della beatitudine nel grado pi\u00f9 basso (Cielo della Luna).",
      "defense": "L'Elogio della Grazia: Piccarda non prova alcuna invidia per chi \u00e8 pi\u00f9 in alto di lei. La carit\u00e0 quieta ogni desiderio, facendo desiderare solo ci\u00f2 che si ha e allineando la volont\u00e0 dell'anima perfettamente alla volont\u00e0 di Dio.",
      "crossExamination": [
        {
          "question": "Dante chiede a Piccarda se lei o le altre anime l\u00ec presenti desiderino un grado pi\u00f9 alto in Paradiso. Cosa risponde?",
          "options": [
            "S\u00ec, ma devono aspettare mille anni.",
            "No, perch\u00e9 desiderare qualcosa di diverso da ci\u00f2 che hanno significherebbe non essere d'accordo con la volont\u00e0 di Dio, rovinando la loro beatitudine.",
            "No, perch\u00e9 hanno paura di cadere."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! In Paradiso la Carit\u00e0 calma ogni desiderio. Volere di pi\u00f9 significherebbe ribellarsi all'ordine divino, perdendo la pace."
        },
        {
          "question": "Come descrive Dante l'aspetto delle anime nel Cielo della Luna?",
          "options": [
            "Come fiamme ardenti che accecano.",
            "Come immagini tenui, riflesse su un vetro trasparente o nell'acqua limpida.",
            "Come angeli con le ali d'oro."
          ],
          "correctIndex": 1,
          "explanation": "Giusto. Sono anime 'difettive', la cui consistenza visiva \u00e8 debole (come i loro voti), al punto che Dante inizialmente crede siano riflessi e si gira indietro."
        },
        {
          "question": "Quale famosa massima di Piccarda riassume l'essenza dell'intero Paradiso?",
          "options": [
            "E 'n la sua volontade \u00e8 nostra pace.",
            "Lasciate ogne speranza, voi ch'intrate.",
            "Libert\u00e0 va cercando, ch'\u00e8 s\u00ec cara."
          ],
          "correctIndex": 0,
          "explanation": "Esatto. 'Nella Sua volont\u00e0 \u00e8 la nostra pace' (In la sua volontade \u00e8 nostra pace) \u00e8 forse il verso pi\u00f9 importante di tutta la Cantica."
        }
      ],
      "reflection": "Oggi la societ\u00e0 ci spinge a volere sempre di pi\u00f9 (soldi, carriera, status), generando ansia costante. Il concetto di Piccarda, trovare la pace nell'accettare il proprio posto, \u00e8 saggezza o rassegnazione?",
      "sealPuzzle": {
        "riddle": "In quale cielo, il pi\u00f9 vicino alla Terra e associato alla mutabilit\u00e0, si trovano gli spiriti mancanti ai voti? (4 lettere)",
        "answer": "LUNA"
      }
    }
  },
  {
    "id": "giustiniano",
    "image": "assets/cases/giustiniano.png",
    "campaignId": "paradiso",
    "characterName": "Giustiniano",
    "canto": "Canto VI",
    "cerchio": "Mercurio",
    "order": 2,
    "active": true,
    "phases": {
      "intro": "Benvenuto. Nel cielo di Mercurio, uno spirito luminosissimo, nascosto dalla sua stessa letizia, si fa avanti e traccia la cavalcata storica dell'aquila imperiale.",
      "obiettivo": "Comprendere l'idea di Giustizia e l'importanza del Diritto Civile universale per garantire la pace tra gli uomini.",
      "facts": "Giustiniano I fu Imperatore dell'Impero Romano d'Oriente. La sua opera pi\u00f9 immensa fu il 'Corpus Iuris Civilis', la raccolta sistematica delle leggi romane su cui si basa gran parte del diritto moderno.",
      "tragedia": "L'eccessiva ambizione e ricerca della gloria terrena durante la sua azione politica.",
      "accusation": "Il Limite Terreno: questi sono gli 'Spiriti Attivi', le cui grandi opere sulla Terra (per il bene) furono per\u00f2 mosse dal desiderio egoistico di fama e gloria, sminuendo l'amore puro verso Dio.",
      "citazione": "\"Cesare fui e son Iustiniano,\\nche, per voler del primo amor ch'i' sento,\\nd'entro le leggi trassi il troppo e 'l vano.\"",
      "contrappasso": "Corrispondenza di Beatitudine: Trovandosi in un cielo basso (Mercurio), la loro luce \u00e8 leggermente inferiore a quella degli amanti o dei contemplativi.",
      "defense": "L'Elogio della Grazia: Hanno riordinato il caos umano (il 'troppo e 'l vano' delle leggi) per permettere all'umanit\u00e0 di vivere in pace. La loro azione politica fu strumento diretto della Provvidenza.",
      "crossExamination": [
        {
          "question": "Come si presenta l'anima di Giustiniano?",
          "options": [
            "Dice di essere ancora l'Imperatore di Roma.",
            "Usa il passato ('Cesare fui') per l'Impero, e il presente ('son Iustiniano') per la sua identit\u00e0 spirituale.",
            "Nega di essere mai stato Imperatore."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! Le cariche terrene ('Cesare fui') svaniscono con la morte, ma l'essenza dell'individuo purificata davanti a Dio rimane per sempre ('son Iustiniano')."
        },
        {
          "question": "L'intero Canto VI del Paradiso \u00e8 un riassunto di cosa?",
          "options": [
            "Della vita privata di Giustiniano.",
            "Della storia del simbolo dell'Impero (l'Aquila Romana), da Enea fino a Carlo Magno e all'attualit\u00e0 di Dante.",
            "Delle eresie del passato."
          ],
          "correctIndex": 1,
          "explanation": "Giusto. Il canto \u00e8 un 'volo' epico dell'Aquila imperiale, che mostra come la storia di Roma sia stata guidata dalla Provvidenza per portare il mondo alla pace (e accogliere la nascita di Cristo)."
        },
        {
          "question": "Cosa rimprovera Giustiniano a Guelfi e Ghibellini?",
          "options": [
            "I Guelfi si oppongono all'Aquila con i gigli francesi, e i Ghibellini la usano solo per i loro scopi di fazione.",
            "Di non pagare le tasse imperiali.",
            "Di aver distrutto Costantinopoli."
          ],
          "correctIndex": 0,
          "explanation": "Esatto. L'Impero \u00e8 universale e sacro. Guelfi e Ghibellini lo stanno profanando riducendolo a squallide lotte di potere locale."
        }
      ],
      "reflection": "Giustiniano riordin\u00f2 il 'troppo e 'l vano' delle leggi. Oggi i nostri sistemi giudiziari sono spesso lenti e burocratici. Abbiamo bisogno di un nuovo Corpus Iuris per snellire la Giustizia?",
      "sealPuzzle": {
        "riddle": "L'animale sacro usato da Giustiniano come simbolo per raccontare la storia dell'Impero Romano. (6 lettere)",
        "answer": "AQUILA"
      }
    }
  }
,
  {
    "id": "cacciaguida",
    "image": "assets/cases/cacciaguida.png",
    "campaignId": "paradiso",
    "characterName": "Cacciaguida",
    "canto": "Canto XV",
    "cerchio": "Marte",
    "order": 3,
    "active": true,
    "phases": {
      "intro": "Nel cielo di Marte, una luce fulgida scende lungo i bracci di una croce luminosa formata dagli spiriti combattenti, venendo incontro a Dante come una stella cadente.",
      "obiettivo": "Riscoprire le radici etiche della propria famiglia e della propria citt\u00e0, accettando il peso dell'esilio e la missione profetica della poesia.",
      "facts": "Cacciaguida era l'avo di Dante. Cavaliere crociato, mor\u00ec combattendo in Terrasanta. Rappresenta la Firenze antica, sobria, onesta e virtuosa.",
      "tragedia": "Assistere alla decadenza morale e civile di Firenze, un tempo casta e sobria, ora corrotta dall'avidit\u00e0 e dalle guerre di fazione.",
      "accusation": "Il Limite Terreno: come 'Spirito Combattente' ha usato la violenza e la spada (seppur per una 'guerra giusta' secondo l'epoca).",
      "citazione": "\"Tu lascerai ogne cosa diletta\\npi\u00f9 caramente; e questo \u00e8 quello strale\\nche l'arco de lo essilio pria saetta.\"",
      "contrappasso": "Corrispondenza di Beatitudine: Avendo combattuto per la Fede, forma insieme agli altri martiri una grandiosa Croce luminosa su fondo rosso (Marte).",
      "defense": "L'Elogio della Grazia: Cacciaguida profetizza l'esilio di Dante, invitandolo a non temere e a non nascondere la verit\u00e0. Dante dovr\u00e0 essere un testimone scomodo, perch\u00e9 la sua parola colpir\u00e0 le coscienze 'come vento che le pi\u00f9 alte cime pi\u00f9 percuote'.",
      "crossExamination": [
        {
          "question": "Cosa profetizza esplicitamente Cacciaguida a Dante in questo famoso incontro?",
          "options": [
            "Che Dante diventer\u00e0 Papa.",
            "L'amaro sapore dell'esilio ('come sa di sale lo pane altrui') e la sofferenza di dover mendicare protezione nelle corti.",
            "Che Firenze conquister\u00e0 l'Europa."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! \u00c8 la profezia pi\u00f9 chiara e drammatica sull'esilio di Dante, descritto con la metafora fisica del pane salato altrui e delle scale dure da scendere e salire."
        },
        {
          "question": "Cacciaguida descrive la Firenze del suo tempo rispetto alla Firenze contemporanea di Dante. Qual \u00e8 il contrasto?",
          "options": [
            "Prima Firenze era ricca, ora \u00e8 povera.",
            "Prima Firenze era in pace, sobria e modesta (dentro dalla cerchia antica), ora \u00e8 gonfia di lusso, superbia e corruzione.",
            "Prima Firenze era pagana, ora \u00e8 cristiana."
          ],
          "correctIndex": 1,
          "explanation": "Giusto. Il mito della Firenze antica e pura contrapposta alla metropoli mercantile e avida del 1300."
        },
        {
          "question": "Dante chiede se deve nascondere le cose spiacevoli che ha visto nei tre regni per non farsi nemici potenti. Cacciaguida cosa risponde?",
          "options": [
            "Di usare nomi falsi.",
            "Di rivelare tutto ('tutta tua vision fa manifesta'), senza paura, perch\u00e9 la verit\u00e0 \u00e8 l'unico modo per curare il mondo.",
            "Di scrivere solo del Paradiso."
          ],
          "correctIndex": 1,
          "explanation": "Esatto! \u00c8 l'investitura profetica di Dante: la sua poesia sar\u00e0 dura, ma vitale per la salvezza dell'umanit\u00e0."
        }
      ],
      "reflection": "A volte dire la verit\u00e0 ha un costo altissimo (l'esilio, l'emarginazione, il 'pane salato'). Quanto siamo disposti a rischiare personalmente per difendere ci\u00f2 che \u00e8 giusto?",
      "sealPuzzle": {
        "riddle": "Come descrive metaforicamente Cacciaguida l'arma dell'esilio, che colpisce costringendo ad abbandonare ogni 'cosa diletta pi\u00f9 caramente'? (4 lettere)",
        "answer": "ARCO"
      }
    }
  },
    // NUOVI CASI INFERNO
    {
        id: 'c_inf_8',
        campaignId: 'inferno',
        characterName: 'Farinata degli Uberti',
        mapNode: { x: 30, y: 70 },
        phases: {
            intro: "Il fiero capo ghibellino si erge dalla sua tomba infuocata, guardandoti con sdegno come se avesse l'inferno in gran dispitto.",
            facts: "Farinata fu capo della fazione ghibellina a Firenze. Combatté e vinse la battaglia di Montaperti (1260), ma si oppose fermamente alla distruzione di Firenze proposta dai suoi alleati.",
            accusation: "È condannato tra gli eretici epicurei, che 'l'anima col corpo morta fanno', non credendo nella vita oltre la morte.",
            dantePerspective: "Dante lo rispetta politicamente per aver salvato Firenze, ma lo condanna teologicamente per la sua mancanza di fede.",
            defense: "La mia eresia fu un errore intellettuale, ma il mio amore per la patria mi spinse a salvare la città quando tutti volevano raderla al suolo. Non basta questo a riscattarmi?",
            crossExamination: [
                {
                    q: "Perché Farinata si trova nel sesto cerchio?",
                    options: [
                        "Perché fu un tiranno",
                        "Perché non credeva nell'immortalità dell'anima",
                        "Perché tradì la sua fazione"
                    ],
                    correctIndex: 1,
                    explanation: "Gli epicurei non credevano nella vita eterna, da qui il contrappasso delle tombe di fuoco."
                },
                {
                    q: "Quale grande merito riconosce Dante a Farinata?",
                    options: [
                        "Aver salvato Firenze dalla distruzione",
                        "Aver finanziato l'esilio di Dante",
                        "Aver sconfitto il papa"
                    ],
                    correctIndex: 0,
                    explanation: "Farinata difese Firenze 'a viso aperto' al concilio di Empoli."
                }
            ],
            reflection: "Un grande leader politico che commette errori teologici: le opere buone terrene possono bilanciare le mancanze spirituali?"
        }
    },
    {
        id: 'c_inf_9',
        campaignId: 'inferno',
        characterName: 'Filippo Argenti',
        mapNode: { x: 40, y: 35 },
        phases: {
            intro: "Dalla palude Stigia emerge coperto di fango uno spirito furioso, che cerca di rovesciare la barca su cui viaggi.",
            facts: "Filippo Cavicchiuli (detto Argenti perché ferrava i cavalli d'argento) fu un membro influente dei Guelfi Neri, noto per la sua arroganza e scoppi d'ira.",
            accusation: "È condannato tra gli iracondi, immerso nel fango della palude Stigia, dove si percuote e si morde da solo per l'eternità.",
            dantePerspective: "Dante prova un disprezzo feroce verso di lui, augurandosi di vederlo straziato dagli altri dannati, in uno sfogo di sdegno 'giusto'.",
            defense: "La mia ira era la mia natura. Voi mi condannate, ma lo stesso Dante mostra un'ira feroce contro di me: non è forse colpevole dello stesso peccato?",
            crossExamination: [
                {
                    q: "In quale cerchio si trova Filippo Argenti?",
                    options: [
                        "Quinto cerchio (Iracondi e Accidiosi)",
                        "Secondo cerchio (Lussuriosi)",
                        "Nono cerchio (Traditori)"
                    ],
                    correctIndex: 0,
                    explanation: "Si trova nella palude Stigia, il quinto cerchio."
                },
                {
                    q: "Come reagisce Dante all'incontro con Argenti?",
                    options: [
                        "Prova compassione e piange",
                        "Lo scaccia con estremo disprezzo",
                        "Fugge terrorizzato"
                    ],
                    correctIndex: 1,
                    explanation: "Dante lo maledice e gode nel vederlo punito, mostrando lo 'sdegno giusto'."
                }
            ],
            reflection: "L'ira può mai essere giustificata (sdegno giusto) o è sempre una perdita della ragione?"
        }
    },
    {
        id: 'c_inf_10',
        campaignId: 'inferno',
        characterName: 'Vanni Fucci',
        mapNode: { x: 70, y: 75 },
        phases: {
            intro: "Un uomo morso da un serpente si incenerisce e rinasce istantaneamente. Con un gesto osceno verso il cielo, ti fissa con ferocia.",
            facts: "Vanni Fucci di Pistoia, fiero Guelfo Nero, rubò gli arredi sacri nel Duomo di Pistoia, lasciando che un innocente venisse condannato.",
            accusation: "Condannato tra i ladri (Bolgia 7). Subisce metamorfosi dolorose ed è noto per la sua bestiale arroganza contro Dio.",
            dantePerspective: "Dante lo descrive come l'anima più superba contro Dio di tutto l'Inferno, disprezzandolo per la sua 'vita bestial'.",
            defense: "Fui ladro e violento, vero. Ma ho l'ardire di sfidare il Creatore a viso aperto, senza ipocrisie. La mia ribellione non ha qualcosa di titanico?",
            crossExamination: [
                {
                    q: "Per quale crimine principale Vanni Fucci si trova all'Inferno?",
                    options: [
                        "Furto di arredi sacri in chiesa",
                        "Omicidio di un vescovo",
                        "Tradimento della patria"
                    ],
                    correctIndex: 0,
                    explanation: "Rubò nel Tesoro di San Iacopo e lasciò accusare un innocente."
                },
                {
                    q: "Qual è la particolarità del suo atteggiamento?",
                    options: [
                        "Piange perennemente pentito",
                        "Sfida Dio facendo il gesto delle fiche",
                        "Cerca di corrompere Dante"
                    ],
                    correctIndex: 1,
                    explanation: "Fucci fa 'le fiche' (gesto osceno) rivolto al cielo sfidando Dio."
                }
            ],
            reflection: "La malvagità pura e la sfida aperta all'autorità suprema: fascino del male o semplice bestialità?"
        }
    },
    
    // NUOVI CASI PURGATORIO
    {
        id: 'c_purg_8',
        campaignId: 'purgatorio',
        characterName: 'Marco Lombardo',
        mapNode: { x: 55, y: 65 },
        phases: {
            intro: "Avvolto da un fumo denso e nero come la notte, senti una voce saggia che discorre sul libero arbitrio e sulla corruzione.",
            facts: "Cortigiano veneziano del XIII secolo, uomo di grande levatura morale, ma afflitto dal peccato dell'ira.",
            accusation: "Si trova nella cornice degli Iracondi. Espia la sua colpa camminando in un fumo acre che acceca, così come l'ira acceca la mente.",
            dantePerspective: "Dante lo usa come portavoce per spiegare che la corruzione del mondo dipende dalle cattive scelte umane (libero arbitrio).",
            defense: "Ho vissuto con sdegno verso un mondo ingiusto. Ora questo fumo mi purifica. Non era la mia ira una reazione a una società corrotta?",
            crossExamination: [
                {
                    q: "Secondo Marco Lombardo, qual è la causa della corruzione del mondo?",
                    options: [
                        "L'influenza maligna delle stelle",
                        "Il libero arbitrio mal usato dagli uomini",
                        "La debolezza della natura umana"
                    ],
                    correctIndex: 1,
                    explanation: "Marco chiarisce che gli uomini hanno il libero arbitrio e sono responsabili del male."
                },
                {
                    q: "Come è punita l'ira nel Purgatorio?",
                    options: [
                        "Avvolti da un fumo buio e denso",
                        "Immersi nel fuoco bollente",
                        "Schiacciati da massi enormi"
                    ],
                    correctIndex: 0,
                    explanation: "Il fumo acceca la vista come l'ira ha accecato la mente in vita."
                }
            ],
            reflection: "Si può giustificare l'aggressività (ira) quando è rivolta contro le ingiustizie del mondo?"
        }
    },
    {
        id: 'c_purg_9',
        campaignId: 'purgatorio',
        characterName: 'Forese Donati',
        mapNode: { x: 50, y: 35 },
        phases: {
            intro: "Davanti a te un uomo scheletrico, con gli occhi incavati. Solo dalla sua voce lo riconosci: è un tuo vecchio amico.",
            facts: "Forese Donati, poeta e amico di gioventù di Dante (scambiarono la 'Tenzone', rime comiche e offensive). Dedito ai piaceri della gola.",
            accusation: "Sconta il peccato di Gola. Costretto a patire fame e sete guardando frutti profumati e acqua fresca che non può toccare.",
            dantePerspective: "Dante prova gioia e dolore nel ritrovare l'amico così sciupato. Forese ringrazia sua moglie Nella per le preghiere.",
            defense: "Amavo il buon cibo e la bella vita fiorentina. Grazie all'amore di mia moglie sono già qui a purificarmi. Il piacere del cibo è davvero una colpa così grave?",
            crossExamination: [
                {
                    q: "Quale peccato sconta Forese Donati?",
                    options: [
                        "Lussuria",
                        "Avarizia",
                        "Gola"
                    ],
                    correctIndex: 2,
                    explanation: "Forese è punito nella cornice dei Golosi."
                },
                {
                    q: "Chi ringrazia Forese per aver abbreviato il suo tempo nell'Antipurgatorio?",
                    options: [
                        "Sua sorella Piccarda",
                        "La moglie Nella",
                        "L'amico Dante"
                    ],
                    correctIndex: 1,
                    explanation: "Sua moglie Nella, con le sue preghiere sincere, lo ha aiutato a salire più in fretta."
                }
            ],
            reflection: "Il cibo e l'eccesso: dove si traccia la linea tra la goduria della vita e la perdita del controllo di sé?"
        }
    },
    {
        id: 'c_purg_10',
        campaignId: 'purgatorio',
        characterName: 'Guido Guinizzelli',
        mapNode: { x: 30, y: 15 },
        phases: {
            intro: "Attraverso un muro di fiamme ardenti, intravedi l'ombra del grande maestro della poesia stilnovista.",
            facts: "Poeta bolognese, considerato da Dante il 'padre' del Dolce Stil Novo (la dottrina che lega amore e cuore gentile).",
            accusation: "Espia la Lussuria nella settima e ultima cornice del Purgatorio, camminando dentro un muro di fuoco che brucia le impurità carnali.",
            dantePerspective: "Dante lo chiama 'padre mio' poetico, mostrando enorme devozione e rispetto per il maestro, nonostante il suo peccato.",
            defense: "Ho cantato l'Amore, ho innalzato la donna ad Angelo. Se l'amore mi ha travolto anche nella carne, non fu per brutalità, ma per un eccesso di passione.",
            crossExamination: [
                {
                    q: "Quale titolo riconosce Dante a Guido Guinizzelli?",
                    options: [
                        "Padre della giurisprudenza",
                        "Padre spirituale e poetico (Stilnovismo)",
                        "Miglior cavaliere d'Italia"
                    ],
                    correctIndex: 1,
                    explanation: "Dante lo considera il capostipite della poesia d'amore a cui lui stesso appartiene."
                },
                {
                    q: "Come sono puniti i Lussuriosi nel Purgatorio?",
                    options: [
                        "Travolti da un vento tempestoso",
                        "Purificati attraverso un muro di fuoco",
                        "Cuciti gli occhi con fil di ferro"
                    ],
                    correctIndex: 1,
                    explanation: "I lussuriosi (sia etero che omosessuali) camminano tra fiamme ardenti."
                }
            ],
            reflection: "Arte e vita privata: il talento poetico e l'ispirazione giustificano una vita sregolata nei piaceri?"
        }
    },

    // NUOVI CASI PARADISO
    {
        id: 'c_par_4',
        campaignId: 'paradiso',
        characterName: 'San Tommaso',
        mapNode: { x: 25, y: 70 },
        phases: {
            intro: "Nel cielo del Sole, una corona di spiriti sapienti ruota cantando. Una luce abbagliante si fa avanti: è il Dottor Angelico.",
            facts: "Frate domenicano e immenso teologo del XIII secolo. Conciliò la filosofia aristotelica con il Cristianesimo.",
            accusation: "Nessuna colpa. È lo spirito sapiente per eccellenza, lodato per la sua sterminata conoscenza messa al servizio di Dio.",
            dantePerspective: "Dante lo usa per presentare la vita di San Francesco e per muovere una dura critica contro la corruzione del suo stesso ordine domenicano.",
            defense: "Ho dedicato la vita alla ricerca della Verità attraverso la Ragione e la Fede. Non vi è contraddizione tra le due, poiché entrambe provengono da Dio.",
            crossExamination: [
                {
                    q: "Di quale grande Santo San Tommaso (che è Domenicano) tesse le lodi?",
                    options: [
                        "San Domenico",
                        "San Francesco d'Assisi",
                        "San Pietro"
                    ],
                    correctIndex: 1,
                    explanation: "Nel Paradiso, un domenicano loda il fondatore dei francescani, e viceversa, simbolo di armonia."
                },
                {
                    q: "In quale cielo si trova Tommaso d'Aquino?",
                    options: [
                        "Cielo della Luna",
                        "Cielo del Sole (Spiriti Sapienti)",
                        "Cielo di Marte (Spiriti Militanti)"
                    ],
                    correctIndex: 1,
                    explanation: "Nel Sole, associato alla luce dell'intelletto e della saggezza."
                }
            ],
            reflection: "La Ragione può davvero spiegare la Fede? La scienza e la spiritualità sono destinate ad essere alleate o nemiche?"
        }
    },
    {
        id: 'c_par_5',
        campaignId: 'paradiso',
        characterName: 'San Pier Damiani',
        mapNode: { x: 40, y: 55 },
        phases: {
            intro: "Nel cielo di Saturno (Spiriti Contemplativi), uno spirito fulgente scende lungo una scala d'oro infinita, nel silenzio più totale.",
            facts: "Eremita e monaco dell'XI secolo, riformatore della Chiesa, fustigatore dei costumi mondani del clero e cardinale quasi controvoglia.",
            accusation: "È il simbolo della vita contemplativa assoluta e della predestinazione, un uomo che ha rinunciato a tutto per la preghiera.",
            dantePerspective: "Pier Damiani condanna aspramente i prelati moderni, troppo occupati dai lussi e dal potere rispetto agli apostoli scalzi.",
            defense: "La Chiesa deve spogliarsi dell'oro e tornare al silenzio e all'eremitaggio. Ma la predestinazione divina è un mistero inaccessibile.",
            crossExamination: [
                {
                    q: "Che oggetto caratterizza il cielo di Saturno dove si trova Pier Damiani?",
                    options: [
                        "Una croce di luce",
                        "Un'aquila fatta di anime",
                        "Una scala d'oro che sale verso l'alto"
                    ],
                    correctIndex: 2,
                    explanation: "La Scala d'oro simboleggia l'ascesa contemplativa dell'anima a Dio."
                },
                {
                    q: "Chi attacca duramente Pier Damiani nel suo discorso?",
                    options: [
                        "L'Imperatore",
                        "I prelati corrotti e moderni",
                        "I filosofi arabi"
                    ],
                    correctIndex: 1,
                    explanation: "Rimprovera la pinguedine e la ricchezza dei cardinali del tempo di Dante."
                }
            ],
            reflection: "L'isolamento contemplativo (stare fuori dal mondo) è più nobile dell'impegno attivo nella società?"
        }
    },
    {
        id: 'c_par_6',
        campaignId: 'paradiso',
        characterName: 'San Benedetto',
        mapNode: { x: 55, y: 40 },
        phases: {
            intro: "La luce più grande e candida del cielo di Saturno si fa avanti. È il fondatore del monachesimo occidentale.",
            facts: "Benedetto da Norcia (480-547), fondatore dell'abbazia di Montecassino e autore della celebre Regola ('Ora et labora').",
            accusation: "Anima somma e purissima, lamenta la totale decadenza del suo Ordine monastico.",
            dantePerspective: "Attraverso di lui, Dante denuncia come le abbazie un tempo fiorenti siano ora covi di ladri per colpa della cupidigia dei monaci.",
            defense: "Io ritirai il mondo a Montecassino fondando una regola santa, ma i miei monaci hanno abbandonato il lavoro per l'usura e l'avidità.",
            crossExamination: [
                {
                    q: "In cosa consisteva principalmente la Regola di San Benedetto?",
                    options: [
                        "Isolamento totale nel deserto",
                        "Ora et labora (Prega e lavora)",
                        "Povertà estrema senza tetto"
                    ],
                    correctIndex: 1,
                    explanation: "La sua regola si fonda sull'equilibrio tra preghiera e lavoro manuale."
                },
                {
                    q: "Quale abbazia famosa ha fondato?",
                    options: [
                        "Cluny",
                        "Montecassino",
                        "San Galgano"
                    ],
                    correctIndex: 1,
                    explanation: "Montecassino è la culla dell'ordine benedettino, nominata esplicitamente nel canto."
                }
            ],
            reflection: "Le istituzioni nascono con nobili ideali ma finiscono sempre per corrompersi? Il difetto è umano o sistemico?"
        }
    },
    {
        id: 'c_par_7',
        campaignId: 'paradiso',
        characterName: 'San Pietro',
        mapNode: { x: 70, y: 25 },
        phases: {
            intro: "Nel cielo delle Stelle Fisse, un fuoco intensissimo e roteante si stacca dalla schiera. È il primo degli Apostoli.",
            facts: "Il primo Papa, discepolo di Cristo. Dante viene interrogato da lui sulla natura della Fede.",
            accusation: "Non ha colpe, ma è portatore della collera divina contro i papi corrotti del tempo di Dante (soprattutto Bonifacio VIII).",
            dantePerspective: "La scena in cui San Pietro si arrossa d'ira, e tutto il Paradiso cambia colore per la vergogna dei papi corrotti, è uno dei momenti più drammatici.",
            defense: "Chi usurpa il mio posto in terra, ha fatto del cimitero mio una cloaca. Non c'è pace in cielo se a Roma siede un usurpatore.",
            crossExamination: [
                {
                    q: "Su quale Virtù Teologale San Pietro esamina Dante?",
                    options: [
                        "Carità",
                        "Fede",
                        "Speranza"
                    ],
                    correctIndex: 1,
                    explanation: "Pietro esamina Dante sulla Fede; Giacomo sulla Speranza, Giovanni sulla Carità."
                },
                {
                    q: "Cosa accade al cielo quando Pietro nomina Bonifacio VIII?",
                    options: [
                        "Un tuono scuote l'universo",
                        "Tutto il cielo diventa rosso di vergogna e collera",
                        "Cala il buio totale"
                    ],
                    correctIndex: 1,
                    explanation: "Il cielo si tinge di rosso, riflettendo la collera e la vergogna dell'Apostolo."
                }
            ],
            reflection: "Quando l'autorità suprema si corrompe, è giusto che i cittadini (o i fedeli) si ribellino apertamente come fa Dante?"
        }
    },
    {
        id: 'c_par_8',
        campaignId: 'paradiso',
        characterName: "Costanza d'Altavilla",
        mapNode: { x: 45, y: 85 },
        phases: {
            intro: "Nel cielo della Luna, accanto a Piccarda, vedi brillare un'altra luce: è una grande imperatrice.",
            facts: "Figlia di Ruggero II, fu costretta a uscire dal convento per sposare l'imperatore Enrico VI, generando Federico II di Svevia.",
            accusation: "Come Piccarda, subì la violenza di essere strappata ai voti monastici per ragioni di Stato.",
            dantePerspective: "Dante sottolinea che, sebbene le sia stato strappato il velo dal capo, nel cuore ella rimase sempre fedele a Dio.",
            defense: "Il mondo mi strappò alla mia cella per costringermi al trono. Generai un impero potente, ma il mio spirito non ha mai lasciato il monastero.",
            crossExamination: [
                {
                    q: "Chi era il figlio di Costanza d'Altavilla?",
                    options: [
                        "Manfredi",
                        "Federico II di Svevia",
                        "Carlo d'Angiò"
                    ],
                    correctIndex: 1,
                    explanation: "Costanza è la madre dell'imperatore Federico II."
                },
                {
                    q: "In quale cielo si trova Costanza?",
                    options: [
                        "Cielo della Luna",
                        "Cielo di Venere",
                        "Cielo del Sole"
                    ],
                    correctIndex: 0,
                    explanation: "Condivide il cielo della Luna (Inadempienti ai voti) con Piccarda Donati."
                }
            ],
            reflection: "È possibile mantenere l'integrità del proprio 'io' quando si è costretti a vivere una vita imposta dalla società?"
        }
    },
    {
        id: 'c_par_9',
        campaignId: 'paradiso',
        characterName: 'Traiano',
        mapNode: { x: 75, y: 70 },
        phases: {
            intro: "Nell'occhio dell'Aquila celeste nel cielo di Giove, brilla un'anima inaspettata: un imperatore romano nato e morto pagano.",
            facts: "Imperatore romano, noto per la sua immensa giustizia. Secondo la leggenda, il Papa Gregorio Magno pregò per lui fino a farlo resuscitare affinché potesse salvarsi.",
            accusation: "Nessuna. Simboleggia la Giustizia suprema, tanto forte da aver piegato le regole stesse di Dio e sconfitto l'Inferno.",
            dantePerspective: "La presenza di Traiano è uno scandalo teologico: un pagano in Paradiso. Dante esalta l'infinita misericordia divina.",
            defense: "Fui giusto in vita. Feci fermare l'esercito imperiale per ascoltare la supplica di una vedova. Le mie azioni terrene hanno aperto i cieli.",
            crossExamination: [
                {
                    q: "Perché la presenza di Traiano in Paradiso è sorprendente?",
                    options: [
                        "Perché era un tiranno crudele",
                        "Perché morì prima di Cristo",
                        "Perché era un imperatore romano e pagano"
                    ],
                    correctIndex: 2,
                    explanation: "Traiano era pagano e destinato all'Inferno, ma la preghiera di Gregorio Magno lo salvò."
                },
                {
                    q: "Per quale virtù Traiano è famoso?",
                    options: [
                        "Spirito Guerriero",
                        "Giustizia verso una povera vedova",
                        "Conquiste territoriali"
                    ],
                    correctIndex: 1,
                    explanation: "Ascoltò la vedova a cui avevano ucciso il figlio, rinviando la spedizione militare."
                }
            ],
            reflection: "Le regole possono essere 'infrante' dall'amore e dalla bontà? La preghiera può cambiare il destino di un uomo?"
        }
    },
    {
        id: 'c_par_10',
        campaignId: 'paradiso',
        characterName: 'San Bernardo',
        mapNode: { x: 90, y: 20 },
        phases: {
            intro: "Sostituendo Beatrice nell'Empireo, un vecchio dal volto benevolo ti si accosta per l'ultima fase del viaggio.",
            facts: "Bernardo di Chiaravalle (1090-1153), mistico devotissimo alla Vergine Maria, autore di profonde opere di contemplazione.",
            accusation: "L'ultima e più alta guida di Dante, che ha il compito di chiedere alla Vergine Maria la grazia di far vedere a Dante il volto di Dio.",
            dantePerspective: "Dante ha bisogno di una guida puramente contemplativa e mistica alla fine. La teologia (Beatrice) non basta più.",
            defense: "L'intelletto umano ha un limite. Di fronte all'Empireo, solo l'amore puro e l'intercessione della Vergine possono sollevarti a guardare l'Infinito.",
            crossExamination: [
                {
                    q: "Che ruolo ha San Bernardo alla fine del Paradiso?",
                    options: [
                        "Scaccia i demoni",
                        "Sostituisce Beatrice come ultima guida",
                        "Rimprovera Dante"
                    ],
                    correctIndex: 1,
                    explanation: "Bernardo subentra a Beatrice nell'Empireo per guidare Dante alla visione di Dio."
                },
                {
                    q: "A chi rivolge San Bernardo la sua celebre preghiera finale?",
                    options: [
                        "A Dio",
                        "Alla Vergine Maria",
                        "Agli Angeli"
                    ],
                    correctIndex: 1,
                    explanation: "Recita la preghiera alla Vergine ('Vergine Madre, figlia del tuo figlio')."
                }
            ],
            reflection: "C'è un limite alla ragione umana? Arriva un punto in cui bisogna affidarsi all'intuizione mistica?"
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
    getUserProfile,            return null;
        } catch (e) {
            console.error("Errore fetch profilo:", e);
            return null;
        }
    },

    updateXP,    },

    getAllUsers,            // --- FINE MOCK DATA ---
            return users;
        } catch (e) {
            console.error("Errore getAllUsers:", e);
            return [];
        }
    },

    updateUserRole,    },
    
    // --- DOCENTI E CLASSI ---
    saveClass,    },

    getClassById,            return null;
        } catch (e) {
            console.error("Errore getClassById:", e);
            return null;
        }
    },

    getClassByCode,            return null;
        } catch (e) {
            console.error("Errore getClassByCode:", e);
            return null;
        }
    },

    getTeacherClasses,            }
            // --- FINE MOCK CLASS ---
            return classes;
        } catch (e) {
            console.error("Errore getTeacherClasses:", e);
            return [];
        }
    },

    joinClassAsCollaborator,            const data = docSnap.data();
            if (data.teacher === teacherEmail) {
                throw new Error("Sei già il docente principale di questa classe.");
            }
            if (data.collaborators && data.collaborators.includes(teacherEmail)) {
                throw new Error("Sei già un collaboratore di questa classe.");
            }
            await updateDoc(docRef, {
                collaborators: arrayUnion(teacherEmail)
            });
            return true;
        } catch (e) {
            console.error("Errore joinClassAsCollaborator:", e);
            throw e;
        }
    },

    getStudentsByClass,            }
            // --- FINE MOCK STUDENTS ---
            return students;
        } catch (e) {
            console.error("Errore getStudentsByClass:", e);
            return [];
        }
    },

    // --- CAMPAGNE E CASI ---
    getCampaigns,    },

    getCasesByCampaign,
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
    saveSentence,    },

    getCaseStats,            
            const querySnapshot = await getDocs(sentencesQuery);
            
            const stats = {
                conferma: 0,
                riduzione: 0,
                aggravo: 0,
                assoluzione: 0,
                total: 0,
                motivations: []
            };

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                stats.total++;
                if (data.verdict === 'conferma') stats.conferma++;
                if (data.verdict === 'riduzione') stats.riduzione++;
                if (data.verdict === 'aggravo') stats.aggravo++;
                if (data.verdict === 'assoluzione') stats.assoluzione++;
                
                if (data.motivation && data.motivation.trim() !== '') {
                    stats.motivations.push(data.motivation);
                }
            });
            
            return stats;
        } catch (e) {
            console.error("Errore recupero statistiche:", e);
            return { conferma: 0, riduzione: 0, aggravo: 0, assoluzione: 0, total: 0, motivations: [] };
        }
    },

    getUserSentences,    },

    getRawVerdicts,            const querySnapshot = await getDocs(sentencesQuery);
            const verdicts = [];
            querySnapshot.forEach((doc) => {
                verdicts.push(doc.data());
            });
            return verdicts;
        } catch (e) {
            console.error("Errore recupero raw verdicts:", e);
            return [];
        }
    }
};

window.EroiDB = EroiDB;
export default EroiDB;
