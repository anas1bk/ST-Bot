const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const keepAlive = require(`./server.js`);
const token = '7938100914:AAEkuXNm5ATXpRKzxVkygXFwB17n8x5I_XM';
const bot = new TelegramBot(token, { polling: true });
keepAlive();

const mainMenu = [
  { text: 'Cour', callback_data: '/cour' },
  { text: 'TD', callback_data: '/td' },
  { text: 'TP', callback_data: '/tp' },
  { text: 'Interrogation', callback_data: '/intero' },
  { text: 'Examen', callback_data: '/exam' },
  { text: 'Contrôle TP', callback_data: '/examen_tp' },
  { text: 'Drive', callback_data: '/res' },
  { text: 'Livre', callback_data: '/liv' },
  { text: 'Email', callback_data: '/cnt' },
];
const modules = {
  '/cour': [
    "Analyse 3",
    "Analyse numérique",
    "Physique 3",
    "Chimie 3",
    "Informatique 3",
    "Eléctricité générale",
    "MR",
    "MDF",
    "Technique d'expression",
    "Ingénierie 3",
    "Anglais 3",
    "Analyse 4", 
    "Analyse numérique 2",
    "Physique 4",
    "Chimie 4",
    "Informatique 4",
    "RDM",
    "Eléctronique générale",
    "Technique d'expression 2",
    "Anglais 4",
    "Ingénierie 4",
    "MR 2"
  ],
  '/td': [
    "Analyse 3",
    "Analyse numérique",
    "Physique 3",
    "Chimie 3",
    "Informatique 3",
    "Eléctricité générale",
    "MR",
    "MDF",
    "Technique d'expression",
    "Ingénierie 3",
    "Anglais 3",
    "Analyse 4",
    "Analyse numérique 2",
    "Physique 4",
    "Chimie 4",
    "Informatique 4",
    "RDM",
    "Eléctronique générale",
    "Technique d'expression 2",
    "Anglais 4",
    "Ingénierie 4",
    "MR 2"
  ],
  '/tp': [
    "Physique 3",
    "Chimie 3",
    "Eléctricité générale",
    "Analyse numérique",
    "MDF",
    "Ingénierie 3",
    "Physique 4",
    "Chimie 4",
    "Analyse numérique 2",
    "Informatique 4",
    "Eléctronique générale",
    "RDM"
  ],
  '/intero': [
    "Analyse 3",
    "Analyse numérique",
    "Physique 3",
    "Chimie 3",
    "Informatique 3",
    "Eléctricité générale",
    "MR",
    "MDF",
    "Technique d'expression",
    "Ingénierie 3",
    "Anglais 3",
    "Analyse 4",
    "Analyse numérique 2",
    "Physique 4",
    "Chimie 4",
    "Informatique 4",
    "RDM",
    "Eléctronique générale",
    "Technique d'expression 2",
    "Anglais 4",
    "Ingénierie 4",
    "MR 2"
  ],
  '/exam': [
    "Analyse 3",
    "Analyse numérique",
    "Physique 3",
    "Chimie 3",
    "Informatique 3",
    "Eléctricité générale",
    "MR",
    "MDF",
    "Technique d'expression",
    "Ingénierie 3",
    "Anglais 3",
    "Analyse 4",
    "Analyse numérique 2",
    "Physique 4",
    "Chimie 4",
    "Informatique 4",
    "RDM",
    "Eléctronique générale",
    "Technique d'expression 2",
    "Anglais 4",
    "Ingénierie 4",
    "MR 2"
  ],
  '/res': [
    "S4 -Basmala Chebri-",
    "EasyCPST",
    "2eme année",
    "Interogation & Examens TP Chimie 4",
    "2CPST 2020/2021",
    "Concour",
    "bibmath integral multiple 1 ",
    "bibmath integral multiple 2 ",
    "2eme annee cpst",
    "2eme",
    "deuxième annee ",
    "2eme année prépa",
    "Drive série douchet",
    "Drive 2eme année + cours analyse Boukaloua",
    "COURS", "prepa promo 2022",
    "Td ESSA",
    "Td MR ENP",
    "ENSTP",
    "Courrigé de cncrs ana num",
    "Concours",
    "2cpst ENP",
    "Résumés ",
    "Exam dvr",
    "ENP",
    "2cpst",
    "VOM",
    "Chimie",
    "Résumé Ana num",
    "Starter pack",
    "2eme pack",
    "CPST 2eme",
    "Analyse",
    "ENPO",
    "Sabri starter Pack",
    "Cncrs phy ",
    "Marwan's drive",
    "sujets classe préparatoire",
    "TD ESSA",
    "tous examens&DS Dr.Sofiane MEKKI",
    "Chimie CNCR",
    "prepa DZ",
    "Résumé Aweb",
    "2eme année polytech"
  ],
  '/liv': [
    "Chimie de solution - Dr. Dofiane MEKKI",
    "Mr KADI",
    "Analyse numérique pour ingénieurs by André Fortin",
    "électricité générale - Analyse et synthèse des circuits",
    "Analyse 3 Livre ENP Alger  ( Series entiéres - Fourier).pdf",
    "Fundamentals of Electric Circuits by Charles K Alexander",
    "fluid_mechanics_fundamentals_and_applications_3rd_edition_cengel",
    "Analyse-Numérique-G.-FACCANONI-2014"
  ],
  
  '/cnt': [
    "Enseignants chercheurs « Département Classe Préparatoire »"],
  
  '/examen_tp': [
    "Physique 3",
    "Chimie 3",
    "Eléctricité générale",
    "Analyse numérique",
    "MDF",
    "Physique 4",
    "Chimie 4",
    "Analyse numérique 2",
    "Informatique 4",
    "Eléctronique générale",
    "RDM"
  ],
};
const moduleData = {

  '/cour': {
    "MR 2": {
      "files": [
        "./cour/MR 2/1-Cours_2_Mec_Rat_2.pdf",
        "./cour/MR 2/4-Cours_03_Mec_Rat_2.pdf",
        "./cour/MR 2/downloadfile-25 (1).pdf"
        ]},
    "Analyse 3": {
      "files": [
        "./cour/Analyse 3/Cours Analyse 3.pdf",
        "./cour/Analyse 3/chapter 2 part 1.pdf",
        "./cour/Analyse 3/chapter 2 part 2.pdf",
        "./cour/Analyse 3/Table.pdf"
  
      ],
      "urls": [
        ""
      ]
    },

    "Analyse numérique": {
      "files": [
        "./cour/Analyse numérique/ANUNUM S3.pdf",
        "./cour/Analyse numérique/ANALYSE NUMERIQUE 1 (1).pdf",
        "./cour/Analyse numérique/Présentation du module d'analyse numérique.pdf"
      ],

      "urls": [
      ]
    },

    "Physique 3": {
      "files": [
        "./cour/Physique 3/Oscillations Libres des Système à un (01) DDL.pdf",
        "./cour/Physique 3/Oscillations Libre Amorties des Systèmes à un DDL.pdf",
        "./cour/Physique 3/Oscillations Forcées Amorties des Systèmes à un DDL.PDF",
        "./cour/Physique 3/Oscillations des Systèmes à deux (02) DDL.PDF"
      ],

      "urls": [
      ]
    },

    "Chimie 3": {

      "files": [
        "./cour/Chimie 3/chapitre 2 équilibre acidobasique.pdf",
        "./cour/Chimie 3/chapitre1.pdf",
        "./cour/Chimie 3/calcul pH base faible.pdf",
        "./cour/Chimie 3/chapitre 3.pdf",
        "./cour/Chimie 3/Chapitre 4.pdf",
        "./cour/Chimie 3/effet de précipitation sur la réaction oxred.pdf"
      ],

      "urls": [
      ]
    },

    "Informatique 3": {

      "files": [
        "./cour/Informatique 3/présentation.pdf"
      ],

      "urls": [
      ]
    },

    "Eléctricité générale": {

      "files": [
        "./cour/Eléctricité générale/Cours 1 .pdf",
        "./cour/Eléctricité générale/Cours 2 .pdf",
        "./cour/Eléctricité générale/Cours 3 .pdf",
        "./cour/Eléctricité générale/Cours ELT GEN.pdf"
      ],

      "urls": [
      ]
    },

    "MR": {
      "files": [
        "./cour/MR/MR L0.pdf",
        "./cour/MR/MR L1.pdf",
        "./cour/MR/MR L2.pdf",
        "./cour/MR/MR L3.pdf",
        "./cour/MR/MR L4.pdf",
        "./cour/MR/MR L5.pdf",
        "./cour/MR/MR L6.pdf",
        "./cour/MR/MR L7.pdf",
        "./cour/MR/MR L8.pdf"
      ],
      "urls": [
      ]
    },

    "MDF": {
      "files": [
        "./cour/MDF/Chapter01_Introduction.pdf",
        "./cour/MDF/Chapter02_Properties of Fluids.pdf",
        "./cour/MDF/Chapter03_Hydrostatics and Pressure.pdf",
        "./cour/MDF/Chapter 04 Fluid Kinematics.pdf"
      ],
      "urls": [

      ]
    },

    "Technique d'expression": {
      "files": [
        "./cour/Technique d'expression/Cours_1_Le_vocabulaire_scientifique.pdf",
        "./cour/Technique d'expression/Cours_2_Définition_et_étymologie_+_présent_de_lindicatif.pdf",
        "./cour/Technique d'expression/Cours_3_Les_adjectifs_numéraux.pdf",
        "./cour/Technique d'expression/Cours_4_Les_différents_procédés_de_définition.pdf",
        "./cour/Technique d'expression/Cours_5_Les_pronoms_relatifs_composés.pdf",
        "./cour/Technique d'expression/Cours 6 - La forme passive.pdf",
        "./cour/Technique d'expression/Cours_7_Les_connecteurs_logiques_condition_et_hypothèse,_opposition.pdf",
        "./cour/Technique d'expression/Cours 8 - La forme impersonnelle.pdf",
        "./cour/Technique d'expression/Cours 9 - Le texte explicatif.pdf"
      ],
      "urls": [
      ]
    },

    "Ingénierie 3": {
      "files": [
        "./cour/Ingénierie 3/analyse-fonctionnelle-cours-1.pdf",
        "./cour/Ingénierie 3/analyse-fonctionnelle-cours-2.pdf",
        "./cour/Ingénierie 3/Cours 1 ingénierie1.ppt",
        "./cour/Ingénierie 3/cours_qualite.pdf",
        "./cour/Ingénierie 3/ING1.pdf",
        "./cour/Ingénierie 3/ING2.pdf",
        "./cour/Ingénierie 3/ING3.pdf",
        "./cour/Ingénierie 3/Ingénierie-1.docx",
        "./cour/Ingénierie 3/Ingénierie-3-Analyse-des-systèmes-1.pdf",
        "./cour/Ingénierie 3/ingénierie2.docx",
        "./cour/Ingénierie 3/ingénierie3.pdf"
      ],
      "urls": [
      ]
    },

    "Anglais 3": {
      "files": [
        "./cour/Anglais 3/2023-2024/Expressing Numbers in English .pptx",
        "./cour/Anglais 3/2023-2024/Mathematical Symbols & Expressions.pdf",
        "./cour/Anglais 3/2023-2024/Unites of Measurement.pdf",
        "./cour/Anglais 3/2023-2024/Describing Graphs, Charts and Diagrams.pdf",


        "./cour/Anglais 3/describing diagrams (practice).docx",
        "./cour/Anglais 3/DESCRIBING DIAGRAMS.pdf",
        "./cour/Anglais 3/Math, Greek letters, & abbreviation symbols 1.jpeg",
        "./cour/Anglais 3/Math, Greek letters, & abbreviations symbols 2.jpeg",
        "./cour/Anglais 3/Passive voice.pdf",
        "./cour/Anglais 3/Phrasal verbs.pdf",
        "./cour/Anglais 3/Safety procedures and precautions.pdf",
        "./cour/Anglais 3/Safety Signs, Instructions  and Notices.pdf",
        "./cour/Anglais 3/Safetyat work Hazards.pdf",
        "./cour/Anglais 3/Unit One Describing Amounts & Quatities.pdf",
        "./cour/Anglais 3/Unit One Describing Amounts Lesson.pdf",
        "./cour/Anglais 3/Unit One Describing Amounts text practice.pdf",
        "./cour/Anglais 3/Useful Mathematical Symbols.pdf"
      ],
      "urls": [
      ]
    },

    "Analyse 4": {
      "files": [
        "./cour/Analyse 4/Cours Analyse 4.pdf",
        "./cour/Analyse 4/Chapter 1 Power series.pdf",
        "./cour/Analyse 4/Chapter 2 Fourier series.pdf",
        "./cour/Analyse 4/Séries entières.pdf"
      ],
      "urls": [
      ]
    },

    "Analyse numérique 2": {
      "files": [
        "./cour/Analyse numérique 2/Cours_analyse_num_rique_II.pdf"
      ],
      "urls": [
      ]
    },

    "Physique 4": {
      "files": [
        "./cour/Physique 4/Chapitre 02  Cordes et Membranes Vibrantes.pdf",
        "./cour/Physique 4/Chapitre 03 -Ondes Acoustiques dans les Fluides.pdf",
        "./cour/Physique 4/Chapitre 04 -Ondes Elastiques dans les Solides.pdf",
        "./cour/Physique 4/Chapitre 05  Ondes Electromagnétiques.PDF"
      ],
      "urls": [
      ]
    },

    "Chimie 4": {
      "files": [
        "./cour/Chimie 4/Cours_Chimie-organique.pdf"
      ],
      "urls": [
      ]
    },

    "Informatique 4": {
      "files": [
        "./cour/Informatique 4/INFO4-presentation.pdf",
        "./cour/Informatique 4/Python-presentation.pdf"
      ],
      "urls": [
      ]
    },

    "RDM": {
      "files": [
        "./cour/RDM/Flexion deviee.pdf",
        "./cour/RDM/cisaillement simple.pdf",
        "./cour/RDM/Traction et compression.pdf",
        "./cour/RDM/La torsion simple.pdf",
        "./cour/RDM/Généralités.pdf",
        "./cour/RDM/Flexion pure.pdf",
        "./cour/RDM/Flexion composée.pdf",
      ],
      "urls": [
      ]
    },

    "Eléctronique générale": {
      "files": [
        "./cour/Eléctronique générale/Chap1 S-C & jonction PN.pdf",
        "./cour/Eléctronique générale/Chap2 Diodes & applications.pdf",
        "./cour/Eléctronique générale/Chap3 transistor bipolaire & amplification.pdf",
        "./cour/Eléctronique générale/électronique résumé.pdf",
        "./cour/Eléctronique générale/semi-conducteurs.pdf"
      ],
      "urls": [
      ]
    },

    "Technique d'expression 2": {
      "files": [
        "./cour/Technique d'expression 2/Cours 1 - LA PRISE DE NOTES.pptx",
        "./cour/Technique d'expression 2/Cours 2 - LA REFORMULATION.pptx"
      ],
      "urls": [
      ]
    },

    "Anglais 4": {
      "files": [
        "./cour/Anglais 4/Oral Presentations Lesson 3.pdf",
        "./cour/Anglais 4/abstract example.pdf",
        "./cour/Anglais 4/Abstracts and excutive summaries-1.pdf",
        "./cour/Anglais 4/cv sample.pdf",
        "./cour/Anglais 4/emailing answers.pdf",
        "./cour/Anglais 4/engineering-resume.pdf",
        "./cour/Anglais 4/English Test (Answers).pdf",
        "./cour/Anglais 4/Memo.pdf",
        "./cour/Anglais 4/Progress Report 1.jpg",
        "./cour/Anglais 4/progress report 2.jpg",
        "./cour/Anglais 4/Proposals-2.pdf",
        "./cour/Anglais 4/summary example.pdf",
        "./cour/Anglais 4/Technical Reports.pdf"
      ],
      "urls": [
      ]
    },

    "Ingénierie 4": {
      "files": [
        "./cour/Ingénierie 4/downloadfile-30.pdf",
        "./cour/Ingénierie 4/downloadfile-205.pdf",
        "./cour/Ingénierie 4/Ingénierie - Partie Matériaux.pptx",
        "./cour/Ingénierie 4/Nanomaterials.pptx"
      ],
      "urls": [
      ]
    },

  },

  '/td': {

    "Analyse 3": {
      "files": [
        "./td/Analyse 3/series 1.pdf",
        "./td/Analyse 3/series 2.pdf"
      ],
      "urls": [
      ]
    },

    "Analyse numérique": {
      "files": [
        "./td/Analyse numérique/serie_n°1 .pdf",
        "./td/Analyse numérique/Ananum S3 TD's.pdf"

      ],
      "urls": [
      ]
    },

    "Physique 3": {
      "files": [
        "./td/Physique 3/TD N°01 - Nombre de Degré de Liberté et Equations d’Equilibre des Systèmes.pdf",
        "./td/Physique 3/TD N°02- Oscillations Libres des Systèmes à un (01) Degré de Liberté.pdf",
        "./td/Physique 3/Corrigé série N°02.pdf",
        "./td/Physique 3/Exercices supplémentaires.pdf",
        "./td/Physique 3/TD N°03 - Oscillations Libres Amorties des Systèmes à un (01) Degré de Liberté.pdf",
        "./td/Physique 3/Corrigé série N° 03.pdf",
        "./td/Physique 3/TD N°04 - Oscillations Forcées Amorties des Systèmes à un (01) Degré de Liberté.PDF",
        "./td/Physique 3/Corrigé série N° 04.pdf",
        "./td/Physique 3/TD N°05 - Oscillations forcées des systèmes à 02 DDL.pdf",
      ],
      "urls": [
      ]
    },

    "Chimie 3": {
      "files": [
        "./td/Chimie 3/TD1 2023 2024.pdf",
        "./td/Chimie 3/TD 1 chimie solution.pdf",
        "./td/Chimie 3/TD 2 - Chimie 3 2023-2024.pdf",
        "./td/Chimie 3/TD 2 chimie solution.pdf"
      ],
      "urls": [
      ]
    },

    "Informatique 3": {
      "files": [
        "./td/Informatique 3/TD1-TG.pdf",
        "./td/Informatique 3/solution TD1.pdf",
        "./td/Informatique 3/TD 2  - TG .pdf",
        "./td/Informatique 3/Solution de TD 2 informatique 3.pdf",
        "./td/Informatique 3/solution TD 2 INFO 3 .pdf"
      ],
      "urls": [
      ]
    },

    "Eléctricité générale": {
      "files": [
        "./td/Eléctronique générale/TD 01 notation complexe.pdf",
        "./td/Eléctricité générale/Td électricité générale.pdf"
      ],
      "urls": [
      ]
    },

    "MR": {
      "files": [
        "./td/MR/Td 1 Outils mathematiques.pdf",
        "./td/MR/td 2  Statique.pdf",
        "./td/MR/TD1 MR (2022-2023).pdf",
        "./td/MR/TD 2 MR1 ( 2022-2023).pdf",
        "./td/MR/TD 3 MR (2022-2023).pdf",
        "./td/MR/TD 4 MR 1 ( 2022-2023).pdf"

      ],
      "urls": [
      ]
    },

    "MDF": {
      "files": [
        "./td/MDF/tdndeg1_mdf.pdf",
        "./td/MDF/td2-2022.pdf",
        "./td/MDF/td_3-2022.pdf",
        "./td/MDF/td_mdf-04.pdf",
        "./td/MDF/TD 5 - Mecanique des Fluides CP.pdf",
        ""
      ],
      "urls": [
      ]
    },

    "Technique d'expression": { 
        "files": [
      ], 
        "urls": [
      ] 
    },

    "Ingénierie 3": { 
        "files": [
          ], 
        "urls": [
          ] 
    },

    "Anglais 3": { 
       "files": [
       ], 
       "urls": [
       ] 
    },

    "Analyse 4": { 
        "files": [
          "./td/Analyse 4/series 1.pdf"
        ], 
        "urls": [
        ] 
    },

    "Analyse numérique 2": { 
        "files": [
          "./td/Analyse numérique 2/serie_n°1.pdf"
        ], 
        "urls": [
        ] 
    },

    "Physique 4": { 
        "files": [
          "./td/Physique 4/TD 01 physique 04 _2024.pdf",
        ], 
        "urls": [
        ] 
    },

    "Chimie 4": { 
        "files": [
          "./td/Chimie 4/TD 1 - Chimie 4 .pdf",
        ], 
        "urls": [
        ] 
    },

    "Informatique 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "RDM": { 
        "files": [
          "./td/RDM/TD 1 CGMI.pdf",
          "./td/RDM/Correction TD1 .pdf",
          "./td/RDM/TD2 traction.pdf",
          "./td/RDM/TD3 cisaillement.pdf",
          "./td/RDM/TD4 torsion.pdf",
          "./td/RDM/TD5  Flexion.pdf",
          "./td/RDM/TD6  Flexion deviee.pdf",
        ], 
        "urls": [
        ] 
    },

    "Eléctronique générale": { 
        "files": [
          "./td/Eléctronique générale/serie TD_01.pdf"
        ], 
        "urls": [
        ] 
    },

    "Technique d'expression 2": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Anglais 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Ingénierie 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },
   "MR 2":{
     "files": [
       "./td/MR 2/TD 1 - Géometrie des masses.pdf",
       ],
     "urls": [
       ]
   },

  },

  '/tp': {

    "Analyse numérique": {
      "files": [
        "./TP/Analyse numérique/TP0 (Initiation Matlab).pdf"
      ],
      "urls": [
      ]
    },

    "Physique 3": {
      "files": [
        "./TP/Physique 3/djeffal_selman_Tp2_Torsion.pdf",
        "./TP/Physique 3/Tp_physics_djeffal_selman (Pohl Penduluum).pdf"
      ],
      "urls": [
      ]
    },

    "Chimie 3": {
      "files": [
        "./TP/Chimie 3/TP N1.pdf",
        "./TP/Chimie 3/TP2 .pdf",
        "./TP/Chimie 3/TP 03.pdf"
      ],
      "urls": [
      ]
    },

    "Eléctricité générale": {
      "files": [
        "./TP/Eléctricité générale/TP 1 électricité.pdf"
      ],
      "urls": [
      ]
    },

    "MDF": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Ingénierie 3": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Analyse numérique 2": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Physique 4": { 
        "files": [
          "./TP/Physique 4/Tp1_Physique4.pdf"
        ], 
        "urls": [
        ] 
    },

    "Chimie 4": {
      "files": [
        "./TP/Chimie 4/TP 1 - Extraction de la caféine des feuilles de thé.pdf",
      ],
      "urls": [
      ]
    },

    "Informatique 4": {
      "files": [
        "./TP/Informatique 4/EXERCICES.PDF"
      ],
      "urls": [
      ]
    },

    "RDM": {
      "files": [
        "./TP/RDM/TP 1.pdf"
      ],
      "urls": [
      ]
    },

    "Eléctronique générale": {
      "files": [
        "./TP/Eléctronique générale/Rapport TP_Diode_F.pdf"
      ],
      "urls": [
      ]
    },

  },

  '/intero': {

    "Analyse 3": {
      "files": [
        "./intero/Analyse 3/Interrogation N 01 2022-2023 - Analyse 3.pdf",
        "./intero/Analyse 3/Analyse 3 Examen Sans Solution 2020-2021.pdf",
        "./intero/Analyse 3/Analyse 3 Interrogation Avec Solution (2).pdf",
        "./intero/Analyse 3/Corrigé contrôle2021.pdf",
        "./intero/Analyse 3/Interro 1 2016-2017.pdf", "./intero/Analyse 3/Analyse 3 Interrogation Avec Solution 2017-2018.pdf",
        "./intero/Analyse 3/Analyse 3 Interrogation Sans Solution 2018-2019.pdf"
      ],
      "urls": [
      ]
    },

    "Analyse numérique": {
      "files": [
        "./intero/Analyse numérique/Interrogation 01 - Analyse numérique 3 - (2022-2023).pdf",
        "./intero/Analyse numérique/interrgation N°02 - Analyse numérique - ( 2022-2023 ).pdf",
        "./intero/Analyse numérique/Interro 2 2018-2019.pdf",
        "./intero/Analyse numérique/Interro 2 2016-2017.pdf",
        "./intero/Analyse numérique/Interro 1 2016-2017.pdf",
        "./intero/Analyse numérique/Analyse numérique Interrogation Sans Solution 2019-2020.pdf",
        "./intero/Analyse numérique/Analyse numérique Interrogation Sans Solution 2017-2018 .pdf",
        "./intero/Analyse numérique/Analyse numérique Interrogation 2017-2018 .pdf"
      ],
      "urls": [
      ]
    },

    "Physique 3": {
      "files": [
        "./intero/Physique 3/Physique 3 Interrogation Avec Solution 2017-2018.pdf",
        "./intero/Physique 3/Physique 3 Interrogation Sans Solution.pdf",
        "./intero/Physique 3/Interro 1 2022-2023 avec solution.pdf"
      ],
      "urls": [
      ]
    },

    "Chimie 3": {
      "files": [
        "./intero/Chimie 3/Interrogation N°01 2022-2023 - Chimie 3.pdf",
        "./intero/Chimie 3/Interrogation 2020-2021 - Chimie 3.pdf",
        "./intero/Chimie 3/Interrogation 1 2019-2020  -  Chimie 3.pdf",
        "./intero/Chimie 3/Interrogation 1 2018-2019  -  Chimie 3.pdf", "./intero/Chimie 3/Interroation 1 2019-2020 (solution)  -  Chimie 3.pdf",
        "./intero/Chimie 3/Chimie Interrogation Sans Solution 2017-2018.pdf"
      ],
      "urls": [
      ]
    },

    "Informatique 3": {
      "files": [
        "./intero/Informatique 3/Interrogation 01 - Informatique 3 - (2022-2023).pdf",
        "./intero/Informatique 3/Interrogation 02 - Informatique 3 - (2022-2023).pdf",
        "./intero/Informatique 3/Interro 2020- 2021 avec solution.pdf",
        "./intero/Informatique 3/Informatique Interrogation Avec Solution 2017-2018.pdf",
        "./intero/Informatique 3/Informatique Interrogation Avec Solution 2018-2019.pdf",
        "./intero/Informatique 3/Informatique Interrogation Sans Solution 2019-2020.pdf"

      ],
      "urls": [
      ]
    },

    "Eléctricité générale": {
      "files": [
        "./intero/Eléctricité générale/Electricité_Générale_Interrogation_Avec_Solution.pdf",
        "./intero/Eléctricité générale/Intérrogation 2022-2023  avec Solution.pdf",
        "./intero/Eléctricité générale/Interrogation_Avec_Solution.pdf",
        "./intero/Eléctricité générale/Interrogation + Solution .pdf",
        "./intero/Eléctricité générale/Interrogation ÉG Avec Solution .pdf"
      ],
      "urls": [
      ]
    },

    "MR": {
      "files": [
        "./intero/MR/interrogation - MR - ( 2022-2023 ).pdf",
        "./intero/MR/interrogation 2 - MR - ( 2022-2023 ).pdf",
        "./intero/MR/Mécanique Rationnelle Interrogation 1  Sans Solution 2017-2018.pdf",
        "./intero/MR/Mécanique Rationnelle Interrogation 2 Sans Solution 2017-2018.pdf",
        "./intero/MR/Mécanique Rationnelle Interrogation Avec Solution 2019-2020.pdf"
      ],
      "urls": [
      ]
    },

    "MDF": {
      "files": [
        "./intero/MDF/Interrogation 01 - MDF - (2022-2023).pdf",
        "./intero/MDF/Corrigé type   Barème_ Interrogation 1_ MDF (2022-2023).pdf",
        "./intero/MDF/Interrogation 2   Corrigé type avec Barème_MDF   (2022-2023).pdf",
        "./intero/MDF/MDF Interrogation Avec Solution.pdf"

      ],
      "urls": [
      ]
    },

    "Technique d'expression": {
      "files": [
        "./intero/Technique d'expression/Techniques d'expression interrogation Avec Solution 2019-2020.pdf",
        "./intero/Technique d'expression/Français Intrrogation Sans Solution.pdf",
        "./intero/Technique d'expression/Français Intrrogation Avec Solution.pdf"
      ],
      "urls": [
      ]
    },

    "Ingénierie 3": {
      "files": [
        "./intero/Ingénierie 3/Ingénierie 1 Interrogation Sans Solution 2017-2018.pdf",
        "./intero/Ingénierie 3/Ingénierie 1 Interrogation Avec Solution 2019-2020.pdf"
      ],
      "urls": [
      ]
    },

    "Anglais 3": {
      "files": [
        "./intero/Anglais 3/Anglais Test Avec Solution .pdf",
        "./intero/Anglais 3/Anglais Test Sans Solution 2017-2018.pdf"
      ],
      "urls": [
      ]
    },

    /*"Analyse 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Analyse numérique 2": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Physique 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Chimie 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Informatique 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "RDM": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Eléctronique générale": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Technique d'expression 2": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Anglais 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Ingénierie 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },*/

  },

  '/exam': {

    /*"Analyse 3": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Analyse numérique": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Physique 3": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Chimie 3": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Informatique 3": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Eléctricité générale": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "MR": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "MDF": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Technique d'expression": { 
        "files": [
        ], 
        "urls": [
        ] 
    },*/

    "Ingénierie 3": {
      "files": [
        "./exam/Enginerie 3/Ingénierie-1-Examens-ENPC.pdf"
      ],
      "urls": [
      ]
    },

    /*"Anglais 4": { 
        "files": [
        ], 
        "urls": [
            "https://drive.google.com/drive/folders/15-jiOhZ6uhXUPQLxrJxMw8CmvA0354YQ ",
        ] 
    },

    "Analyse ": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Analyse numérique 2": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Physique 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },*/

    "Chimie 4": {
      "files": [
        "./exam/Chimie 4/Control2021.pdf",
        "./exam/Chimie 4/Control2022 .pdf"
      ],
      "urls": [
      ]
    },

    "Informatique 4": {
      "files": [
        "./exam/Informatique 4/Informatique Examen Avec Solution 2017-2018.pdf"
      ],
      "urls": [
      ]
    },

    "RDM": {
      "files": [
        "./exam/RDM/Examen final 2020-2021.pdf",
        "./exam/RDM/Examen final 2020-2021 (solution).pdf"
      ],
      "urls": [
      ]
    },

    "Eléctronique générale": {
      "files": [
        "./exam/Eléctronique générale/examen.pdf"
      ],
      "urls": [
      ]
    },

    /*"Technique d'expression 2": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Anglais 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    },

    "Ingénierie 4": { 
        "files": [
        ], 
        "urls": [
        ] 
    }*/

  },

  '/res': {
    "S4 -Basmala Chebri-": { "urls": ["https://drive.google.com/drive/mobile/folders/1Du8Yvw7JWWXi61HogPCABDDTxIrFXmYu?fbclid=IwAR2Z9BW7qGiKMek6yUrPX45Lvv7kR7ixit-LNXX81i9tQ4uACLZrAnHcZmw"] },
    "EasyCPST": { "urls": ["https://drive.google.com/drive/folders/1D_GVXlCMqWW4JIQGW_W0GKmBqxt6hDgu"] },
    "2eme année": { "urls": ["https://drive.google.com/drive/folders/1TnSPcXH-RxjJRdCVaEN5X60V2dDnAtfD?direction=a"] },
    "Interogation & Examens TP Chimie 4": { "urls": ["https://drive.google.com/drive/folders/1Hrz__KbbFYQPAqAGbXQCwrn1Cx6HqPJr?usp=sharing"] },
    "2CPST 2020/2021": { "urls": ["https://drive.google.com/drive/folders/1O_lnfzNmEGTyiGWDlTKWA7g7C4A7Ayq-?fbclid=IwAR3-UqlnFHxbd3jqvMHfwQ1CsOl7Jo8kocEXm6BMqRVSHUqFQVER78fxznE"] },
    "Concour": { "urls": ["https://drive.google.com/drive/folders/189Kpr4MYlgYeBGMJK0DjRxi5aqDK27Vu"] },
    "bibmath integral multiple 1 ": { "urls": [" https://www.bibmath.net/ressources/index.phpaction=affiche&quoi=bde/analyse/integration/integrales-multiples&type=fexo"] },
    "bibmath integral multiple 2 ": { "urls": ["https://www.bibmath.net/ressources/index.php?action=affiche&quoi=bde/analyse/integration/integrales-curvilignes&type=fexo"] },
    "2eme prepa": { "urls": ["https://drive.google.com/drive/folders/1J4xGsi1YiL62XbJIqzWkisceeao7SnHP"] },
    "2eme annee cpst": { "urls": ["https://drive.google.com/drive/mobile/folders/1cZWm1zveSr_8L0l2c5ooS55fGMwKCWsG?usp=sharing"] },
    "2eme": { "urls": ["https://drive.google.com/drive/mobile/folders/1n0ExmFZjXArZ1eBXSKKOuXypBaw6kEAg?usp=sharing"] },
    "deuxième annee ": { "urls": ["https://drive.google.com/drive/folders/11bjQFahl2u0ZN0S9J-Dvk4gVkTTw2O9Y"] },
    "2eme année prépa": { "urls": ["https://drive.google.com/drive/u/0/mobile/folders/1SZmGuMJM3-9C8VfAudUlaXVVJJ-bs1ik?fbclid=IwAR1JIfVO1ieQ3TIMg7CfHnUhkwHLCtkR2hhhwEOqbLbbLhitzEWMVaVhMtk"] },
    "Drive série douchet": { "urls": "https://drive.google.com/drive/mobile/folders/1HLCth6-_swuL-PggFAj7GFsFNKuuCj9f?usp=sharing" },
    "Drive 2eme année + cours analyse Boukaloua": { "urls": [" https://drive.google.com/drive/mobile/folders/1u3vxX1s-kfPVsfXQ3Ao7S8B4ctF_Oozc?usp=sharing"] },
    "COURS": { "urls": ["https://drive.google.com/drive/mobile/folders/165DgDNVgI6RumOdbsgKJMmAAvImVRP28/1xexomoTl1_uBTjfE-h5QTmv2SvveAmXf?sort=13&direction=a"] },
    "prepa promo 2022": { "urls": ["https://drive.google.com/drive/u/0/folders/130XZLrtvvknZTUvx0zGqObzhOt09pnGU"] },
    "Td ESSA": { "urls": ["https://drive.google.com/drive/mobile/folders/1S6b8A3xbXg-fjMqsOBAFvCdZsCo148VT"] },
    "Td MR ENP": { "urls": ["https://drive.google.com/file/d/1BaOEuxjOAcoGaAZN_2zZidS34pN4iOY1/view?usp=drivesdk"] },
    "ENSTP": { "urls": ["https://drive.google.com/folderview?id=1SxZHmZi2G_bbjoJRrA6D0Tg8fGMX25S9"] },
    "Courrigé de cncrs ana num": { "urls": ["https://drive.google.com/file/d/14rXToXOxO6f7SydegoirHnxUabPrYC_v/view?usp=drivesdk"] },
    "Concours": { "urls": ["https://drive.google.com/folderview?id=189Kpr4MYlgYeBGMJK0DjRxi5aqDK27Vu"] },
    "2cpst ENP": { "urls": ["https://drive.google.com/drive/u/0/folders/1gcn1e29Ka_8dcbTKSKrBr0YRFrrpO719?fbclid=IwAR0TN78Xc_ikFc4t_YZ3wJJN7F053Opk7rGxupO-5XFgtROEWpOw4-JPtaI"] },
    "Résumés ": { "urls": ["https://drive.google.com/drive/mobile/folders/1emi4EJlKdfeBDR2uWwFFmQQ3Yyq2zzIE"] },
    "Exam dvr": { "urls": ["https://drive.google.com/folderview?id=1YmAEgrKAYryurmbmSZnG0Un9GPaot_Ul"] },
    "ENP": { "urls": ["https://drive.google.com/drive/mobile/folders/1gEzZBCgfE9phiscA6wEwk8w7ALOLKUr7?usp=drive_open"] },
    "2cpst": { "urls": ["https://drive.google.com/drive/u/0/folders/1RTx8si09q3PSKOcqw-ztAMBYrE6HBYI6?fbclid=IwAR0LMdnLDP-cPe45hdPPGrqzg8ZN0uCtkrFBMI2iUnEteIkYQF419-zghmA"] },
    "VOM": { "urls": ["https://drive.google.com/drive/mobile/folders/1mOwd5XsPfEoLMJ06V_Urcg04FUwdurTr"] },
    "Chimie": { "urls": ["https://drive.google.com/drive/mobile/folders/1q8jis39Ny6mfRhm-81gZBLe6F-EIi7lQ"] },
    "Résumé Ana num": { "urls": ["https://drive.google.com/file/d/1C4_LGCoTRkjfIvH_WVa95iOgxYEmlS-V/view?usp=drivesdk", "https://drive.google.com/file/d/1CEvrfDNOKtW35Lt3Pt7eGXqK74MqWu14/view?usp=drivesdk"] },
    "Starter pack": { "urls": ["https://drive.google.com/drive/folders/1-22xczpeCaGNsMgcAqmhjAMy0yUONo2f?usp=sharing"] },
    "2eme pack": { "urls": ["https://drive.google.com/drive/folders/1G1ur-mWKN2_3fEdvPxBmTXUuoTup9qZ9"] },
    "CPST 2eme": { "urls": ["https://drive.google.com/folderview?id=165DgDNVgI6RumOdbsgKJMmAAvImVRP28"] },
    "Analyse": { "urls": ["https://drive.google.com/drive/mobile/folders/1y1FOT7T86NUaLiBEqB-62ARxz3t_u3DY"] },
    "ENPO": { "urls": ["https://drive.google.com/folderview?id=1X-ToMFB8A1PLZE7wvGwlEQzl1XhbchAu"] },
    "Sabri starter Pack": { "urls": ["https://drive.google.com/drive/folders/17G_noknx8xYSUaY2RRYdjLrzj_XUhBxZ"] },
    "Cncrs phy ": { "urls": ["https://drive.google.com/drive/folders/1fioP8I2m9wsIPPtxdsbSD6kV1pC42Azw"] },
    "Marwan's drive": { "urls": ["https://drive.google.com/drive/folders/1IBY6ZAgY4hYSxnFeZ8ehs7vnCsQXkfH3"] },
    "sujets classe préparatoire": { "urls": ["https://drive.google.com/drive/folders/14RJvM4DfSN97iWMvraz21eRwvaspGwYA"] },
    "TD ESSA": { "urls": ["https://drive.google.com/drive/folders/12Ve2uIVNAOKW5ef9RZRTr-Dsiyhgozxn"] },
    "tous examens&DS Dr.Sofiane MEKKI": { "urls": ["https://drive.google.com/drive/folders/1W62vIo28XX4AfAmaaDfj5wfZJTc2TLzx"] },
    "Chimie CNCR": { "urls": ["https://drive.google.com/drive/folders/1q8jis39Ny6mfRhm-81gZBLe6F-EIi7lQ"] },
    "prepa DZ": { "urls": ["https://cpst.netlify.app/"] },
    "Résumé Aweb": { "urls": ["https://drive.google.com/drive/folders/1kBSYXKaW6L1Mfex63zy8Xvxt5E211zIk?fbclid=IwAR3hekYp6-qxzt6aTcNOB9GZeAkER_ocb1GlyIGjNddt583xVS9Zcfm31js"] },
    "2eme année polytech": { "urls": ["https://drive.google.com/drive/folders/1mjDUSlgXXTD6627YaBKphLn4BxvlcciT"] }
  },

  '/liv': {
    "Chimie de solution - Dr. Dofiane MEKKI": { "files": ["./livre/chimie des solutions-MEKKI SOFIANE.pdf"] },
    "Mr KADI": { "files": ["./livre/Livre-de-Mr-Kadi.pdf"] },
    "Analyse numérique pour ingénieurs by André Fortin": { "files": ["./livre/Analyse numérique pour ingénieurs by André Fortin.pdf"] },
    "électricité générale - Analyse et synthèse des circuits": { "files": ["./livre/électricité générale - Analyse et synthèse des circuits - 2eme édition.pdf"] },
    "Analyse 3 Livre ENP Alger  ( Series entiéres - Fourier).pdf": { "files": ["./livre/Analyse 3 Livre ENP Alger  ( Series entiéres - Fourier).pdf"] },
    "Fundamentals of Electric Circuits by Charles K Alexander": { "files": ["./livre/Fundamentals_of_Electric_Circuits_4th_edition_by_Charles_K_Alexander.pdf"] },
    "fluid_mechanics_fundamentals_and_applications_3rd_edition_cengel": { "files": ["./livre/fluid_mechanics_fundamentals_and_applications_3rd_edition_cengel.pdf"] },
    "Analyse-Numérique-G.-FACCANONI-2014": { "files": ["./livre/Analyse-Numérique-G.-FACCANONI-2014.pdf"] }
  },

  '/cnt': {
    "Enseignants chercheurs « Département Classe Préparatoire »": { "urls": ["enp-constantine.dz/classe-preparatoire/enseignants-chercheurs-departement-classe-preparatoire/"] }
  },

  '/examen_tp': {

    "Analyse numérique": {
      "files": [
        "./Examens TP/Analyse numérique/Devoir 01.pdf",
        "./Examens TP/Analyse numérique/Devoir 02.pdf",
        "./Examens TP/Analyse numérique/Analyse numérique Examen TP Avec Solution 2017-2018.pdf",
        "./Examens TP/Analyse numérique/Examen TP 2018-2019.pdf"
      ],
      "urls": [
      ]
    },

    "Physique 3": {
      "files": [
        "./Examens TP/Physique 3/Examen TP 2016-2017.pdf",
        "./Examens TP/Physique 3/Physique 3 Controle TP Avec Solution 2017-2018.pdf"
      ],
      "urls": [
      ]
    },

    "Chimie 3": {
      "files": [
        "./Examens TP/Chimie 3/Chimie 3 Examen TP Avec Solution.pdf",
        "./Examens TP/Chimie 3/Chimie 3 Examen TP Sans Solution 2017-2018.pdf",
        "./Examens TP/Chimie 3/Examen TP 2016-2017.pdf",
        "./Examens TP/Chimie 3/Examen TP 2019-2020.pdf",
        "./Examens TP/Chimie 3/examen-tp-smc3-corrige-2011.pdf"

      ],
      "urls": [
      ]
    },

    "Eléctricité générale": {
      "files": [
        "./Examens TP/Eléctricité générale/Contrôle TP - Éléctricité général.pdf"

      ],
      "urls": [
      ]
    },

    "MDF": {
      "files": [
        "./Examens TP/MDF/Contrôle TP - MDF.pdf",
        "./Examens TP/MDF/Examen TP 2016-2017 .pdf",
        "./Examens TP/MDF/MDF Controle TP Avec Solution 2017-2018.pdf"
      ],
      "urls": [
      ]
    },

    "Analyse numérique 2": {
      "files": [
      ],
      "urls": [
      ]
    },

    "Physique 4": {
      "files": [
        "./Examens TP/Physique 4/Contrôle TP - Physique 3.pdf",
        "./Examens TP/Physique 4/Examen TP 2020-2021.pdf",
        "./Examens TP/Physique 4/Examen TP Physique 3.pdf"
      ],
      "urls": [
      ]
    },

    "Chimie 4": {
      "files": [
        "./Examens TP/Chimie 4/Chimie 4 Examen TP Avec Solution 2017-2018.pdf",
        "./Examens TP/Chimie 4/Chimie 4 Examen TP Avec Solution 2020-2021.pdf",
        "./Examens TP/Chimie 4/Chimie 4 Interrogation Avec Solution 2017-2018 (1).pdf",
        "./Examens TP/Chimie 4/Chimie 4 Interrogation Avec Solution 2017-2018 (2).pdf",
        "./Examens TP/Chimie 4/Chimie 4 Interrogation Avec Solution 2018-2019.pdf"

      ],
      "urls": [
      ]
    },

    /*"Informatique 4": { 
        "files": [

        ], 
        "urls": [
      ] 
    },*/

    "RDM": {
      "files": [
        "./Examens TP/RDM/RDM Controle TP Avec Solution 2017-2018.pdf"

      ],
      "urls": [
      ]
    },

    /*"Eléctronique générale": { 
        "files": [

        ], 
        "urls": [
        ] 
    },*/

  },

};
const userSelections = {};
let mainMenuMessageId = null;
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userFirstName = msg.from.first_name;
  
  bot.sendMessage(chatId, `Hey <b>${userFirstName}</b> 👋 , use the command <b>/about </b> to get infos, or <b> /ing </b> to get started.`, { parse_mode: "HTML" });


});
bot.onText(/\/send/, (msg) => {
  const chatId = msg.chat.id;
  const senderFirstName = msg.from.first_name;
  const senderLastName = msg.from.last_name;
  const senderUsername = msg.from.username;

  bot.sendMessage(chatId, "Please insert the files:");

  bot.once('document', (documentMsg) => {
    const fileId = documentMsg.document.file_id;

    bot.sendMessage(chatId, 'Please enter the name of the file:');

    bot.once('text', (nameMsg) => {
      const FileName = nameMsg.text;
      const userid = msg.from.id;

      const userMessage = `File send by ${senderFirstName} ${senderLastName} (@${senderUsername}) ID: (@${userid}):\n\n${FileName}`;
      const channelChatId = '-1002467183466';
      bot.sendDocument(channelChatId, fileId, {
        caption: userMessage,
        parse_mode: 'Markdown',
      });

      bot.sendMessage(chatId, "Thank you! Your message has been sent to the bot owner.");
    });
  });
});
bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  const message = `
🤖 <b>StTcIng_bot</b> 🤖

هذا البوت هو رفيقك في منصة تليجرام الذي يقدم العديد من الخدمات والإمكانيات المفيدة. دعنا نستعرض الوظائف الرئيسية لهذا البوت:

<b><u>تعليمات المستخدمين :</u></b>

 <b>🔹البداية (/start) 🚀:</b>

 عند استخدام هذا الأمر، يُرحب البوت بالمستخدم.


 <b>🔹القائمة الرئيسية (/ing) 📚:</b>

   يمكن للمستخدمين الدخول إلى هذه القائمة للاختيار من بين العديد من الخيارات، مثل الوصول إلى معلومات حول المساقات الدراسية والامتحانات والكتب، وحتى كيفية التواصل مع المدرسين والمزيد.


  <b> 🔷️ إرسال ملفات إلى منشئ البوت (/send) 📤 : </b>

   بإمكان المستخدمين إرسال ملفات التي يرون أنها يجب أن تتوفر عند البوت إلى منشئ البوت لرفعها.

 <b>🔹إرسال ملاحظات (/feedback) 📢:</b>

   يُتيح البوت للمستخدمين إمكانية مشاركة ملاحظاتهم وآرائهم أو في حالة واجهوا مشاكل في البوت ، ومن ثم يقوم بإرسال هذه الملاحظات إلى منشئ البوت.
    ملاحظات المستخدمين ترسل إلى قناة خاصة(ليتم الرد في أسرع وقت ممكن )   
في حالة توقف البوت عن العمل يمكن التواصل مع منشئ البوت @anassbkk ,  
تم تقديم هذا البوت لكم بواسطة @anassbkk، شكر خاص لـ @mohammedkeina، لا تنسونا من دعائكم.


  هذا البوت يوفر إمكانيات متعددة للمستخدمين ويمكن استخدامه لأغراض مختلفة على منصة تليجرام. ,و هو شريك موثوق يساعد المستخدمين على الحصول على المعلومات والخدمات بسهولة وفعالية. 📱
`

  bot.sendMessage(chatId, message, { parse_mode: "HTML" });
});
bot.onText(/\/feedback (.+)/, (msg, match) => {
  const userFeedback = match[1];
  const senderFirstName = msg.from.first_name;
  const senderLastName = msg.from.last_name;
  const senderUsername = msg.from.username;
  const userid = msg.from.id;

  const feedbackMessage = `Feedback from ${senderFirstName} ${senderLastName} (@${senderUsername}) Id : (${userid}) :\n\n${userFeedback}`;
  const yourChatId = '-1002466094952';
  
  bot.sendMessage(yourChatId, feedbackMessage)
    .then(() => {
      bot.sendMessage(msg.chat.id, "Thank you for your feedback ❤️ Your message has been sent");
    })
    .catch((error) => {
      console.error('Error sending feedback to owner:', error);
      bot.sendMessage(msg.chat.id, "An error occurred while sending your feedback. Please try again later.");
    });
});
bot.onText(/\/ing/, (msg) => {
  const chatId = msg.chat.id;
  const userFirstName = msg.from.first_name;

  const options = {
    reply_markup: {
      inline_keyboard: mainMenu.map(item => [item]),
    },
    parse_mode: "HTML"
  };


  bot.sendMessage(chatId, `Hey <b>${userFirstName}</b>! 👋 Select an option:`, options)
    .then((message) => {
      mainMenuMessageId = message.message_id;
    })
    .catch((error) => {
      console.error('Error sending main menu:', error);
    });


});
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  if (data.startsWith('/')) {

    const selectedOption = data;


    let category = '';
    switch (selectedOption) {
      case '/cour':
        category = 'Cour';
        break;
      case '/td':
        category = 'TD';
        break;
      case '/tp':
        category = 'TP';
        break;
      case '/intero':
        category = 'Interrogation';
        break;
      case '/exam':
        category = 'Exam';
        break;
      case '/res':
        category = 'Drive';
        break;
      case '/liv':
        category = 'Book';
        break;
      case '/cnt':
        category = 'contact';
        break;
      case '/examen_tp':
        category = 'TP exam';
        break;
      default:
        category = 'Unknown';
        break;
    }


    if (mainMenuMessageId) {
      bot.deleteMessage(chatId, mainMenuMessageId).catch(error => console.error('Error deleting message:', error));
      mainMenuMessageId = null;
    }


    userSelections[chatId] = { mainOption: selectedOption, category, submodule: null };
    const submoduleOptions = modules[selectedOption];

    if (submoduleOptions && submoduleOptions.length > 0) {
      const buttonsPerColumn = Math.ceil(submoduleOptions.length / 2);
      const submoduleButtons = [];

      for (let i = 0; i < buttonsPerColumn; i++) {
        const buttonRow = [];
        if (i < submoduleOptions.length) {
          buttonRow.push({ text: submoduleOptions[i], callback_data: submoduleOptions[i] });
        }
        if (i + buttonsPerColumn < submoduleOptions.length) {
          buttonRow.push({ text: submoduleOptions[i + buttonsPerColumn], callback_data: submoduleOptions[i + buttonsPerColumn] });
        }
        submoduleButtons.push(buttonRow);
      }

      const options = {
        reply_markup: {
          inline_keyboard: submoduleButtons,
        },
        parse_mode: "HTML"
      };


      bot.editMessageText('', {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [],
        },
        parse_mode: "HTML",
      });


      bot.sendMessage(chatId, `Select a module of ${category}:`, options);
    } else {
      bot.sendMessage(chatId, `No modules available for ${category}.`);
    }
  } else {

    const userSelection = userSelections[chatId];
    if (userSelection && userSelection.mainOption && modules[userSelection.mainOption].includes(data)) {
      userSelection.submodule = data;


      const submoduleData = moduleData[userSelection.mainOption][data];

      if (submoduleData) {

        const category = userSelection.category;
        bot.sendMessage(chatId, `${category} of  <b>${data}:</b>`, { parse_mode: "HTML" });

        if (submoduleData.files && submoduleData.files.length > 0) {
          submoduleData.files.forEach(file => {
            bot.sendDocument(chatId, file);
          });

        }

        if (submoduleData.urls && submoduleData.urls.length > 0) {
          submoduleData.urls.forEach(url => {
            bot.sendMessage(chatId, url);
          });
        }
        bot.sendMessage(chatId, "Enjoy ur <b>Khbich</b> 🤓", { parse_mode: "HTML" });
        bot.deleteMessage(chatId, messageId).catch(error => console.error('Error deleting message:', error));
      } else {
        bot.sendMessage(chatId, `No data available for now we'll add it soon.`);


      }
    }
  }
});
const userStates = {};
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  const userId = msg.from.id;


  if ((msg.from.username === 'anassbkk') && messageText === '/reply') {

    bot.sendMessage(chatId, 'Please enter the user ID:');
    userStates[userId] = { step: 1, userId: null, username: null, feedback: null };
  } else if (userStates[userId]) {
    const userState = userStates[userId];
    switch (userState.step) {
      case 1:

        userState.userId = messageText;
        bot.sendMessage(chatId, 'Please enter the username of the user:');
        userState.step++;
        break;
      case 2:

        userState.username = messageText;
        bot.sendMessage(chatId, 'Please enter your reply:');
        userState.step++;
        break;
      case 3:

        userState.feedback = messageText;
        const userChatId = userState.userId;
        const username = userState.username;
        const feedbackMessage = userState.feedback;

        bot.sendMessage(userChatId, `Reply from @${msg.from.username}:\n\n${feedbackMessage}`)
          .then(() => {
            bot.sendMessage(chatId, 'Your reply has been sent to the user.');
          })
          .catch((error) => {
            bot.sendMessage(chatId, 'Failed to send the reply. Please check the user ID.');
          });


        delete userStates[userId];
        break;
    }
  }
});
const userDataFilePath = './userdata.json';
const users = [];
function loadUserData() {
}
loadUserData();
function findUserDataByChatId(chatId) {
  return users.find((userData) => userData.chatId === chatId);
}
function updateUserDataByChatId(chatId, newUsername) {
}
function doesUserDataExist(userId, chatId, username) {
  return users.some((userData) => userData.userId === userId && userData.chatId === chatId && userData.username === username);
}
function saveUserData() {
  fs.writeFileSync(userDataFilePath, JSON.stringify(users), 'utf-8');
}
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || '';
  const userFirstName = msg.from.first_name;
  const userLastName = msg.from.last_name;

  if (userId) {
    const chatIdData = findUserDataByChatId(chatId);
    if (!chatIdData) {

      users.push({ userId, chatId, username, userFirstName, userLastName });
    } else if (chatIdData.username !== username) {

      updateUserDataByChatId(chatId, username);
    }
    saveUserData();
  }





  if (msg.text === '/post') {

    if (msg.from.username === 'mohammedkeina' || msg.from.username == 'soheibaradj') {
      bot.sendMessage(chatId, 'Please send the picture or video for the post.');

      bot.once('photo', (photoMsg) => {
        const media = photoMsg.photo[0].file_id;
        bot.sendMessage(chatId, 'Please enter the caption for the post.');

        bot.once('text', (captionMsg) => {
          const caption = captionMsg.text;

          users.forEach((userData) => {
            const { userId } = userData;

            const captionWithUsername = ` \n\n${caption}`;
            bot.sendPhoto(userId, media, { caption: captionWithUsername });
          });

          bot.sendMessage(chatId, 'Post sent to all users who have not received it yet.');
        });
      });

      bot.once('document', (docMsg) => {
        const media = docMsg.document.file_id;
        const chatId = docMsg.chat.id;
        bot.sendMessage(chatId, 'Please enter the caption for the post.');


        bot.once('text', (captionMsg) => {
          const caption = captionMsg.text;

          users.forEach((userData) => {
            const { userId } = userData;

            const captionWithUsername = `🔴🟢\n\n${caption}`;
            bot.sendDocument(userId, media, { caption: captionWithUsername });
          });

          bot.sendMessage(chatId, 'Post sent to all users who have not received it yet.');
        });
      });


      bot.once('voice', (voiceMsg) => {
        const media = voiceMsg.voice.file_id;
        bot.sendMessage(chatId, 'Please enter the caption for the post.');


        bot.once('text', (captionMsg) => {
          const caption = captionMsg.text;

          users.forEach((userData) => {
            const { userId } = userData;

            const captionWithUsername = `🔴🟢\n\n${caption}`;
            bot.sendVoice(userId, media, { caption: captionWithUsername });
          });

          bot.sendMessage(chatId, 'Post sent to all users who have not received it yet.');
        });
      });


      bot.once('video', (videoMsg) => {
        const media = videoMsg.video.file_id;
        bot.sendMessage(chatId, 'Please enter the caption for the video.');

        bot.once('text', (captionMsg) => {
          const caption = captionMsg.text;

          users.forEach((userData) => {
            const { userId } = userData;

            const captionWithUsername = `🔴🟢\n\n${caption}`;

            bot.sendVideo(userId, media, { caption: captionWithUsername });
          });

          bot.sendMessage(chatId, 'Video sent to all users who have not received it yet.');
        });
      });

    } else {
      bot.sendMessage(chatId, 'You are not authorized to use this command.');
    }
  }
});
