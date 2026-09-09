import { Teacher, Homeroom, Competition, MeritSetting, ScheduleSlot } from '@/types/database';

export const INITIAL_MERIT_SETTINGS: MeritSetting[] = [
  { id: '1', placement: 'Johan', points: 100 },
  { id: '2', placement: 'Naib Johan', points: 70 },
  { id: '3', placement: 'Ketiga', points: 40 },
  { id: '4', placement: 'Keempat', points: 30 },
  { id: '5', placement: 'Kelima', points: 20 },
  { id: '6', placement: 'Penyertaan', points: 10 },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    "id": "t-101",
    "salary_no": "201801",
    "name": "HOMEROOM TG 1",
    "role": "Guru"
  },
  {
    "id": "t-102",
    "salary_no": "201802",
    "name": "HOMEROOM TG 2",
    "role": "Guru"
  },
  {
    "id": "t-103",
    "salary_no": "201803",
    "name": "HOMEROOM TG 3",
    "role": "Guru"
  },
  {
    "id": "t-104",
    "salary_no": "201804",
    "name": "HOMEROOM TG 4",
    "role": "Guru"
  },
  {
    "id": "t-105",
    "salary_no": "201805",
    "name": "HOMEROOM TG 5",
    "role": "Guru"
  },
  {
    "id": "t-106",
    "salary_no": "322102",
    "name": "MUHAMMAD HARITH AIMAN BIN SHUHAIMI",
    "role": "Guru"
  },
  {
    "id": "t-107",
    "salary_no": "332176",
    "name": "NURUL ASYIQIN AMMALEEYNA BINTI SAMSURI",
    "role": "Guru"
  },
  {
    "id": "t-108",
    "salary_no": "209539",
    "name": "SAIFUL BAHRI B. HASAM",
    "role": "Guru"
  },
  {
    "id": "t-109",
    "salary_no": "331290",
    "name": "AISAR IZZUDDIN BIN ROSLAN",
    "role": "Guru"
  },
  {
    "id": "t-110",
    "salary_no": "286219",
    "name": "HAJAR NADIA BINTI ABDUL ZUBIR",
    "role": "Guru"
  },
  {
    "id": "t-111",
    "salary_no": "92652",
    "name": "HASLINA BINTI ABDUL RAHMAN",
    "role": "Guru"
  },
  {
    "id": "t-112",
    "salary_no": "265269",
    "name": "HASYIMAH BINTI HASHIM",
    "role": "Guru"
  },
  {
    "id": "t-113",
    "salary_no": "215837",
    "name": "MOHD NASRUN BIN ABDULLAH",
    "role": "Guru"
  },
  {
    "id": "t-114",
    "salary_no": "208996",
    "name": "NOOR HAZREEN BINTI MOHD AYOP",
    "role": "Guru"
  },
  {
    "id": "t-115",
    "salary_no": "252557",
    "name": "NURUL AZRA BT HAZAN",
    "role": "Guru"
  },
  {
    "id": "t-116",
    "salary_no": "237378",
    "name": "ROHANI BINTI MUKHTAR",
    "role": "Guru"
  },
  {
    "id": "t-117",
    "salary_no": "213606",
    "name": "SALWANA BINTI ABDUL SALAM",
    "role": "Guru"
  },
  {
    "id": "t-118",
    "salary_no": "287373",
    "name": "ZATIL AQMAR BT MOHD BASARI",
    "role": "Guru"
  },
  {
    "id": "t-119",
    "salary_no": "316309",
    "name": "AHMED HAFIZAINOL BIN AHMED IDRIS",
    "role": "Guru"
  },
  {
    "id": "t-120",
    "salary_no": "276083",
    "name": "MAIMUN BINTI SAIDIN",
    "role": "Guru"
  },
  {
    "id": "t-121",
    "salary_no": "316969",
    "name": "MOHD FAIZ BIN JUMARI",
    "role": "Guru"
  },
  {
    "id": "t-122",
    "salary_no": "257772",
    "name": "MOHD SHAH RIDZUAN BIN ISMAIL",
    "role": "Guru"
  },
  {
    "id": "t-123",
    "salary_no": "320997",
    "name": "MUHAMMAD ASHRAF ADZHA BIN ISMAIL",
    "role": "Guru"
  },
  {
    "id": "t-124",
    "salary_no": "283597",
    "name": "NURNAZIFAH BINTI MAT AKHIR",
    "role": "Guru"
  },
  {
    "id": "t-125",
    "salary_no": "212393",
    "name": "NUZULA BINTI OTHMAN",
    "role": "Guru"
  },
  {
    "id": "t-126",
    "salary_no": "201100",
    "name": "SALMIAH BT HAMAT",
    "role": "Guru"
  },
  {
    "id": "t-127",
    "salary_no": "268680",
    "name": "SITI RUHAIDA BINTI DIN",
    "role": "Guru"
  },
  {
    "id": "t-128",
    "salary_no": "210971",
    "name": "FARIDAH BT CHE HARUN",
    "role": "Guru"
  },
  {
    "id": "t-129",
    "salary_no": "247630",
    "name": "FATMAWATI BT HAMAD @ AHMAD LUTFI",
    "role": "Guru"
  },
  {
    "id": "t-130",
    "salary_no": "201414",
    "name": "NORMA BINTI PAUZI",
    "role": "Guru"
  },
  {
    "id": "t-131",
    "salary_no": "256333",
    "name": "NUR FARIZAN BINTI MOHAMAD",
    "role": "Guru"
  },
  {
    "id": "t-132",
    "salary_no": "242017",
    "name": "SURIANA BINTI CHE HARUN",
    "role": "Guru"
  },
  {
    "id": "t-133",
    "salary_no": "281353",
    "name": "WARHASNARZIRAH BT AHMAD",
    "role": "Guru"
  },
  {
    "id": "t-134",
    "salary_no": "71961",
    "name": "MOHD NOR APANDI BIN CHE WAN",
    "role": "Guru"
  },
  {
    "id": "t-135",
    "salary_no": "279404",
    "name": "MUHAMMAD HAFIZ BIN AB HAMID",
    "role": "Guru"
  },
  {
    "id": "t-136",
    "salary_no": "301741",
    "name": "AIMIE SHAZLIZA BINTI ISHAK",
    "role": "Guru"
  },
  {
    "id": "t-137",
    "salary_no": "291327",
    "name": "ARIFAH BINTI HUSSAIN",
    "role": "Guru"
  },
  {
    "id": "t-138",
    "salary_no": "300234",
    "name": "FATIN NADIAH BINTI ABD AZIZ",
    "role": "Guru"
  },
  {
    "id": "t-139",
    "salary_no": "286206",
    "name": "HAMIZA BINTI AZIMI",
    "role": "Guru"
  },
  {
    "id": "t-140",
    "salary_no": "205708",
    "name": "MOHAMMAD RAHIMY FITRY BIN ISMAIL",
    "role": "Guru"
  },
  {
    "id": "t-141",
    "salary_no": "200677",
    "name": "MOHD NOORZI BIN MOHD NOOR",
    "role": "Guru"
  },
  {
    "id": "t-142",
    "salary_no": "324553",
    "name": "NUR FARHANA BINTI SAMSULSAHRI",
    "role": "Guru"
  },
  {
    "id": "t-143",
    "salary_no": "282718",
    "name": "MUHAMMAD BIN YUSUF",
    "role": "Guru"
  },
  {
    "id": "t-144",
    "salary_no": "269016",
    "name": "NIK MOHAMED AZLI BIN NIK YAACOB",
    "role": "Guru"
  },
  {
    "id": "t-145",
    "salary_no": "209953",
    "name": "WAN RHYNA BT WAN HUSSIN",
    "role": "Guru"
  },
  {
    "id": "t-146",
    "salary_no": "279747",
    "name": "MOHD ZULFAZLI BIN MOHD RAMLI",
    "role": "Guru"
  },
  {
    "id": "t-147",
    "salary_no": "273905",
    "name": "MUHAMMAD GHAZALI BIN YAHYA",
    "role": "Guru"
  },
  {
    "id": "t-148",
    "salary_no": "248273",
    "name": "NIK SITI HAJJAR BINTI MAT TAIB",
    "role": "Guru"
  },
  {
    "id": "t-149",
    "salary_no": "282187",
    "name": "ANUAR SYAHRIN BIN WAHID",
    "role": "Guru"
  },
  {
    "id": "t-150",
    "salary_no": "271253",
    "name": "MOHD AZAM BIN MANAF",
    "role": "Guru"
  },
  {
    "id": "t-151",
    "salary_no": "84877",
    "name": "SHUKRI BIN MUHAMMAD",
    "role": "Guru"
  },
  {
    "id": "t-152",
    "salary_no": "308650",
    "name": "AINA FARAHANA BT MOHD ZAID",
    "role": "Guru"
  },
  {
    "id": "t-153",
    "salary_no": "319898",
    "name": "DANIAL FIKRI BIN SAMSUDIN",
    "role": "Guru"
  },
  {
    "id": "t-154",
    "salary_no": "301699",
    "name": "MOHD FAHIM BIN JAAFAR",
    "role": "Guru"
  },
  {
    "id": "t-155",
    "salary_no": "291071",
    "name": "MOHD SYARIFUAD BIN ABDULLAH",
    "role": "Guru"
  },
  {
    "id": "t-156",
    "salary_no": "333333",
    "name": "MUHAMAD SOLEH HUDIN BIN SHAMSUDDIN",
    "role": "Guru"
  },
  {
    "id": "t-157",
    "salary_no": "301806",
    "name": "NORFAZILAH BT MOHAMAD ZULDIN",
    "role": "Guru"
  },
  {
    "id": "t-158",
    "salary_no": "247627",
    "name": "NUR ADILA BT MOHAMAD NADZIR",
    "role": "Guru"
  },
  {
    "id": "t-159",
    "salary_no": "960323",
    "name": "NUR ANIS BINTI RAJAB",
    "role": "Guru"
  },
  {
    "id": "t-160",
    "salary_no": "306209",
    "name": "NURUL SYAZWANIE BT ABDUL GHANI",
    "role": "Guru"
  },
  {
    "id": "t-161",
    "salary_no": "308676",
    "name": "SAIDAH NAFISAH BT ZULKUPLI",
    "role": "Guru"
  },
  {
    "id": "t-162",
    "salary_no": "280668",
    "name": "SITI ROHANI BT JAAFAR",
    "role": "Guru"
  },
  {
    "id": "t-163",
    "salary_no": "310826",
    "name": "AHMAD BIYAMIN BIN ABDUL RAZAK",
    "role": "Guru"
  },
  {
    "id": "t-164",
    "salary_no": "99558",
    "name": "AZYUNA BT AZHAR",
    "role": "Guru"
  },
  {
    "id": "t-165",
    "salary_no": "280655",
    "name": "WAN MAIZATUL AKHMAR BT WAN MOHAMAD",
    "role": "Guru"
  },
  {
    "id": "t-166",
    "salary_no": "207968",
    "name": "AHMAD B HJ. MD NAWI",
    "role": "Guru"
  },
  {
    "id": "t-167",
    "salary_no": "236023",
    "name": "AMINATUL JAZILAH BINTI MAT AMIN",
    "role": "Guru"
  },
  {
    "id": "t-168",
    "salary_no": "280613",
    "name": "EMMA FITRIYAH BT YUSOFF",
    "role": "Guru"
  },
  {
    "id": "t-169",
    "salary_no": "218261",
    "name": "FAIROZ BT MOHAMED",
    "role": "Guru"
  },
  {
    "id": "t-170",
    "salary_no": "263245",
    "name": "HAMDAN BIN MOHAMED",
    "role": "Guru"
  },
  {
    "id": "t-171",
    "salary_no": "284240",
    "name": "IDA FARIZA BT ABD AZIZ",
    "role": "Guru"
  },
  {
    "id": "t-172",
    "salary_no": "309837",
    "name": "MOHAMAD NAZRI BIN MOHAMAD KHATA",
    "role": "Guru"
  },
  {
    "id": "t-173",
    "salary_no": "301592",
    "name": "MUHAMMAD SYAZWAN BIN MOHD ZAKI",
    "role": "Guru"
  },
  {
    "id": "t-174",
    "salary_no": "222451",
    "name": "NOR AKMAL BINTI ZAWAWI",
    "role": "Guru"
  },
  {
    "id": "t-175",
    "salary_no": "264325",
    "name": "NOR HASLINDA BINTI BASRI",
    "role": "Guru"
  },
  {
    "id": "t-176",
    "salary_no": "210722",
    "name": "NUR SUHAILA BINTI ABU BAKAR",
    "role": "Guru"
  },
  {
    "id": "t-177",
    "salary_no": "284198",
    "name": "NURUL FATIHAH BINTI MOHD RAZALI",
    "role": "Guru"
  },
  {
    "id": "t-178",
    "salary_no": "97327",
    "name": "RAHIMAH BINTI ABU BAKAR",
    "role": "Guru"
  },
  {
    "id": "t-179",
    "salary_no": "201278",
    "name": "WAN ROSIDA BINTI MAT RASIK",
    "role": "Guru"
  },
  {
    "id": "t-180",
    "salary_no": "290302",
    "name": "ZAFIRATUL HUSNA BINTI ARBAIN",
    "role": "Guru"
  },
  {
    "id": "t-181",
    "salary_no": "258849",
    "name": "ERMA BT MAT",
    "role": "Guru"
  },
  {
    "id": "t-182",
    "salary_no": "224417",
    "name": "AMINUDDEEN BIN MOHAMMAD",
    "role": "Guru"
  },
  {
    "id": "t-183",
    "salary_no": "237514",
    "name": "CIK MUNIRAH BT MAT JUSOH",
    "role": "Guru"
  },
  {
    "id": "t-184",
    "salary_no": "210706",
    "name": "MASTURA BINTI MAHMUD",
    "role": "Guru"
  },
  {
    "id": "t-185",
    "salary_no": "250083",
    "name": "MOHAMAD ALWI BIN ARIFIN",
    "role": "Guru"
  },
  {
    "id": "t-186",
    "salary_no": "280231",
    "name": "MOHAMAD BIN ALI",
    "role": "Guru"
  },
  {
    "id": "t-187",
    "salary_no": "292575",
    "name": "NURUL KHALISAH BINTI MOHAMMAD",
    "role": "Guru"
  },
  {
    "id": "t-188",
    "salary_no": "258810",
    "name": "ROSLI BIN IBRAHIM",
    "role": "Guru"
  },
  {
    "id": "t-189",
    "salary_no": "265586",
    "name": "UBAIDILLAH BIN ISMAIL",
    "role": "Guru"
  },
  {
    "id": "t-190",
    "salary_no": "212306",
    "name": "MOHD AL FADIL B. RAZAK",
    "role": "Guru"
  },
  {
    "id": "t-191",
    "salary_no": "295310",
    "name": "MOHD ASMADI BIN AWANG",
    "role": "Guru"
  },
  {
    "id": "t-192",
    "salary_no": "313506",
    "name": "NOR AININA BINTI MOHD MUSTAFA",
    "role": "Guru"
  },
  {
    "id": "t-193",
    "salary_no": "322568",
    "name": "NURAISYAH BINTI MOHTAR",
    "role": "Guru"
  },
  {
    "id": "t-194",
    "salary_no": "304984",
    "name": "SITI ZUBAIDA BT SAPAR",
    "role": "Guru"
  },
  {
    "id": "t-195",
    "salary_no": "271648",
    "name": "SITI ZUBAIDAH BINTI CHE HAT",
    "role": "Guru"
  },
  {
    "id": "t-196",
    "salary_no": "269799",
    "name": "NOR HAZLIEN BINTI MOHD SANITU",
    "role": "Guru"
  },
  {
    "id": "t-197",
    "salary_no": "218151",
    "name": "ROZITA BINTI AMBAK",
    "role": "Guru"
  },
  {
    "id": "t-198",
    "salary_no": "90874",
    "name": "ADNAN BIN AWANG",
    "role": "Guru"
  },
  {
    "id": "t-199",
    "salary_no": "280626",
    "name": "AHMAD SYAZWAN B AMIN",
    "role": "Guru"
  },
  {
    "id": "t-200",
    "salary_no": "268729",
    "name": "AZURAYANA BINTI SHAARI",
    "role": "Guru"
  },
  {
    "id": "t-201",
    "salary_no": "265874",
    "name": "MOHD LUTFI BIN JUSOH",
    "role": "Guru"
  },
  {
    "id": "t-202",
    "salary_no": "272524",
    "name": "NUR DIANA BINTI DZURADI",
    "role": "Guru"
  },
  {
    "id": "t-203",
    "salary_no": "256126",
    "name": "NUR FARAHIYAH BINTI ZAMRI",
    "role": "Guru"
  },
  {
    "id": "t-204",
    "salary_no": "273523",
    "name": "RUZALMY BIN AB. RAHMAN",
    "role": "Guru"
  },
  {
    "id": "t-205",
    "salary_no": "283267",
    "name": "NOR ILI BT ISHAK",
    "role": "Guru"
  },
  {
    "id": "t-206",
    "salary_no": "207971",
    "name": "NURAZLINA ABDULLAH",
    "role": "Guru"
  },
  {
    "id": "t-207",
    "salary_no": "206228",
    "name": "RIZALMAN MOHD NASIR",
    "role": "Guru"
  },
  {
    "id": "t-208",
    "salary_no": "331669",
    "name": "SAZARATUL NUR FATIHAH BINYI ZAKARIA",
    "role": "Guru"
  },
  {
    "id": "t-209",
    "salary_no": "276889",
    "name": "ASYRAF BIN MUHAMAD",
    "role": "Guru"
  },
  {
    "id": "t-210",
    "salary_no": "250203",
    "name": "RAHAYU BINTI AB WAHAB",
    "role": "Guru"
  },
  {
    "id": "t-211",
    "salary_no": "225539",
    "name": "SALWANI BT. MUHAMMAD",
    "role": "Guru"
  },
  {
    "id": "t-212",
    "salary_no": "81016",
    "name": "AZMAN BIN ABD GHANI",
    "role": "Guru"
  },
  {
    "id": "t-213",
    "salary_no": "211035",
    "name": "ASHAR BIN AB. MAJID",
    "role": "Guru"
  },
  {
    "id": "t-214",
    "salary_no": "205805",
    "name": "ZULKIFLI BIN YUSOFF",
    "role": "Guru"
  },
  {
    "id": "t-215",
    "salary_no": "97440",
    "name": "MOHD NOOR BIN MAHMUD",
    "role": "Guru"
  },
  {
    "id": "t-216",
    "salary_no": "274726",
    "name": "NIK MOHD ROSDI BIN NIK MAHMOOD",
    "role": "Guru"
  },
  {
    "id": "t-217",
    "salary_no": "213431",
    "name": "TUAN MAT B. NIK SOH",
    "role": "Guru"
  },
  {
    "id": "t-218",
    "salary_no": "276957",
    "name": "CHE ASRI BIN ABDUL WAHAB",
    "role": "Guru"
  },
  {
    "id": "t-219",
    "salary_no": "285870",
    "name": "AHMAD AIMAN SHAFIQ B. MOHD JAAFAR",
    "role": "Guru"
  },
  {
    "id": "t-220",
    "salary_no": "288738",
    "name": "MOHD ROHAIME BIN MA HUSSIN",
    "role": "Guru"
  },
  {
    "id": "t-221",
    "salary_no": "276931",
    "name": "MASLIZA BINTI IDRIS",
    "role": "Guru"
  },
  {
    "id": "t-222",
    "salary_no": "218643",
    "name": "NOR MAZRAH BINTI MD NASIR",
    "role": "Guru"
  },
  {
    "id": "t-223",
    "salary_no": "276915",
    "name": "NURNADIAAIDA BT MOHD ROSDI",
    "role": "Guru"
  },
  {
    "id": "t-224",
    "salary_no": "220783",
    "name": "ROSHAIDA BT NOR",
    "role": "Guru"
  },
  {
    "id": "t-225",
    "salary_no": "276902",
    "name": "SITI FATEHA BT MAT NOH @ CHE YUNUS",
    "role": "Guru"
  },
  {
    "id": "t-226",
    "salary_no": "276944",
    "name": "SUZYLA BT DAUD",
    "role": "Guru"
  },
  {
    "id": "t-227",
    "salary_no": "276928",
    "name": "SYARIFUDDIN BIN ABDULLAH",
    "role": "Guru"
  },
  {
    "id": "t-228",
    "salary_no": "219011",
    "name": "SAIPUL MIZAN BIN AZAMI",
    "role": "Guru"
  },
  {
    "id": "t-229",
    "salary_no": "281816",
    "name": "SYAFAWATI BT ARIFFIN",
    "role": "Guru"
  },
  {
    "id": "t-230",
    "salary_no": "290454",
    "name": "SITI NORSHAHIDA BINTI MUHAMMAD",
    "role": "Guru"
  },
  {
    "id": "t-231",
    "salary_no": "262699",
    "name": "MOHD JAFRI BIN IDHAM BHARI",
    "role": "Guru"
  },
  {
    "id": "t-232",
    "salary_no": "289928",
    "name": "SUHARA NADIA BINTI ABDUL HAMID",
    "role": "Guru"
  },
  {
    "id": "t-233",
    "salary_no": "293082",
    "name": "ROZAIHAN BINTI CHE DIN",
    "role": "Guru"
  },
  {
    "id": "t-234",
    "salary_no": "208556",
    "name": "RUSLINA BT ISMAIL",
    "role": "Guru"
  },
  {
    "id": "t-235",
    "salary_no": "290629",
    "name": "NIK HASNIDA BINTI NIK DAUD",
    "role": "Guru"
  },
  {
    "id": "t-236",
    "salary_no": "243414",
    "name": "JUNAIDAH BINTI MD SANGIDIN",
    "role": "Guru"
  },
  {
    "id": "t-237",
    "salary_no": "111111",
    "name": "ASMAH BINTI AHMAD HAMBADLEY",
    "role": "Guru"
  },
  {
    "id": "t-238",
    "salary_no": "202468",
    "name": "ASMAH BINTI AHMAD HAMBADLEY",
    "role": "Guru"
  },
  {
    "id": "t-239",
    "salary_no": "277422",
    "name": "MOHAMAD RIDUAN BIN RAMLI",
    "role": "Guru"
  },
  {
    "id": "t-240",
    "salary_no": "224527",
    "name": "MOHD AIRI BIN KAMARUDDIN",
    "role": "Guru"
  },
  {
    "id": "t-241",
    "salary_no": "96713",
    "name": "RIDZUAN BIN ISMAIL",
    "role": "Guru"
  },
  {
    "id": "t-242",
    "salary_no": "217217",
    "name": "NOAIDA BINTI HASHIM",
    "role": "Guru"
  },
  {
    "id": "t-243",
    "salary_no": "283270",
    "name": "HASNIZAM BIN MAT GHANI",
    "role": "Guru"
  },
  {
    "id": "t-244",
    "salary_no": "65427",
    "name": "HASNIZAM BIN MAT GHANI",
    "role": "Guru"
  },
  {
    "id": "t-245",
    "salary_no": "209872",
    "name": "HASNIZAM BIN MAT GHANI",
    "role": "Guru"
  },
  {
    "id": "t-246",
    "salary_no": "284554",
    "name": "HAZIQ SYAZWAN BIN SAJALI",
    "role": "Guru"
  },
  {
    "id": "t-247",
    "salary_no": "86875",
    "name": "MOHAMMED NAJIB BIN OTHMAN",
    "role": "Guru"
  }
];

export const INITIAL_HOMEROOMS: Homeroom[] = [
  {
    "id": "hr-101",
    "form": 1,
    "name": "CIKGU ADILA",
    "advisor_teacher_id": "t-158",
    "needs_review": false
  },
  {
    "id": "hr-102",
    "form": 1,
    "name": "CIKGU AISAR",
    "advisor_teacher_id": "t-109",
    "needs_review": false
  },
  {
    "id": "hr-103",
    "form": 1,
    "name": "CIKGU AISYAH",
    "advisor_teacher_id": "t-193",
    "needs_review": false
  },
  {
    "id": "hr-104",
    "form": 1,
    "name": "CIKGU ARIFAH",
    "advisor_teacher_id": "t-137",
    "needs_review": false
  },
  {
    "id": "hr-105",
    "form": 1,
    "name": "CIKGU HASLINDA",
    "advisor_teacher_id": "t-175",
    "needs_review": false
  },
  {
    "id": "hr-106",
    "form": 1,
    "name": "CIKGU HAZREEN",
    "advisor_teacher_id": "t-114",
    "needs_review": false
  },
  {
    "id": "hr-107",
    "form": 1,
    "name": "CIKGU ROSIDA",
    "advisor_teacher_id": "t-179",
    "needs_review": false
  },
  {
    "id": "hr-108",
    "form": 1,
    "name": "CIKGU RUHAIDA",
    "advisor_teacher_id": "t-127",
    "needs_review": false
  },
  {
    "id": "hr-109",
    "form": 1,
    "name": "CIKGU SHUKRI",
    "advisor_teacher_id": "t-151",
    "needs_review": false
  },
  {
    "id": "hr-110",
    "form": 1,
    "name": "USTAZ UBAI",
    "advisor_teacher_id": "t-189",
    "needs_review": false
  },
  {
    "id": "hr-211",
    "form": 2,
    "name": "CIKGU ADNAN",
    "advisor_teacher_id": "t-198",
    "needs_review": false
  },
  {
    "id": "hr-212",
    "form": 2,
    "name": "CIKGU ASMADI",
    "advisor_teacher_id": "t-191",
    "needs_review": false
  },
  {
    "id": "hr-213",
    "form": 2,
    "name": "CIKGU AZAM",
    "advisor_teacher_id": "t-150",
    "needs_review": true
  },
  {
    "id": "hr-214",
    "form": 2,
    "name": "CIKGU DIANA",
    "advisor_teacher_id": "t-202",
    "needs_review": false
  },
  {
    "id": "hr-215",
    "form": 2,
    "name": "CIKGU ERMA",
    "advisor_teacher_id": "t-181",
    "needs_review": false
  },
  {
    "id": "hr-216",
    "form": 2,
    "name": "CIKGU FATMAWATI",
    "advisor_teacher_id": "t-129",
    "needs_review": false
  },
  {
    "id": "hr-217",
    "form": 2,
    "name": "CIKGU NOR AKMAL",
    "advisor_teacher_id": "t-174",
    "needs_review": false
  },
  {
    "id": "hr-218",
    "form": 2,
    "name": "CIKGU RAHIMAH",
    "advisor_teacher_id": "t-178",
    "needs_review": false
  },
  {
    "id": "hr-219",
    "form": 2,
    "name": "MISS WANA",
    "advisor_teacher_id": "t-117",
    "needs_review": false
  },
  {
    "id": "hr-220",
    "form": 2,
    "name": "USTAZ MUHAMMAD",
    "advisor_teacher_id": "t-186",
    "needs_review": true
  },
  {
    "id": "hr-321",
    "form": 3,
    "name": "CIKGU AINA",
    "advisor_teacher_id": "t-152",
    "needs_review": false
  },
  {
    "id": "hr-322",
    "form": 3,
    "name": "CIKGU ANIS",
    "advisor_teacher_id": "t-159",
    "needs_review": false
  },
  {
    "id": "hr-323",
    "form": 3,
    "name": "CIKGU FAIROZ",
    "advisor_teacher_id": "t-169",
    "needs_review": true
  },
  {
    "id": "hr-324",
    "form": 3,
    "name": "CIKGU HAFIZAINO",
    "advisor_teacher_id": "t-119",
    "needs_review": false
  },
  {
    "id": "hr-325",
    "form": 3,
    "name": "CIKGU LUTFI",
    "advisor_teacher_id": "t-201",
    "needs_review": false
  },
  {
    "id": "hr-326",
    "form": 3,
    "name": "CIKGU NAZIFAH",
    "advisor_teacher_id": "t-124",
    "needs_review": false
  },
  {
    "id": "hr-327",
    "form": 3,
    "name": "CIKGU NUZULA",
    "advisor_teacher_id": "t-125",
    "needs_review": false
  },
  {
    "id": "hr-328",
    "form": 3,
    "name": "CIKGU SAZA",
    "advisor_teacher_id": "t-208",
    "needs_review": true
  },
  {
    "id": "hr-329",
    "form": 3,
    "name": "CIKGU SHAH",
    "advisor_teacher_id": "t-122",
    "needs_review": false
  },
  {
    "id": "hr-330",
    "form": 3,
    "name": "USTAZAH KHALISA",
    "advisor_teacher_id": "t-187",
    "needs_review": false
  },
  {
    "id": "hr-431",
    "form": 4,
    "name": "CIKGU ANUAR",
    "advisor_teacher_id": "t-149",
    "needs_review": false
  },
  {
    "id": "hr-432",
    "form": 4,
    "name": "CIKGU AZLINA",
    "advisor_teacher_id": "t-206",
    "needs_review": true
  },
  {
    "id": "hr-433",
    "form": 4,
    "name": "CIKGU FARHANA",
    "advisor_teacher_id": "t-142",
    "needs_review": false
  },
  {
    "id": "hr-434",
    "form": 4,
    "name": "CIKGU FARIDAH",
    "advisor_teacher_id": "t-128",
    "needs_review": false
  },
  {
    "id": "hr-435",
    "form": 4,
    "name": "CIKGU FATIHAH",
    "advisor_teacher_id": "t-177",
    "needs_review": false
  },
  {
    "id": "hr-436",
    "form": 4,
    "name": "CIKGU IDA",
    "advisor_teacher_id": "t-171",
    "needs_review": false
  },
  {
    "id": "hr-437",
    "form": 4,
    "name": "CIKGU MAIZATUL",
    "advisor_teacher_id": "t-165",
    "needs_review": false
  },
  {
    "id": "hr-438",
    "form": 4,
    "name": "CIKGU NAZRI",
    "advisor_teacher_id": "t-172",
    "needs_review": false
  },
  {
    "id": "hr-439",
    "form": 4,
    "name": "CIKGU NORMA",
    "advisor_teacher_id": "t-130",
    "needs_review": false
  },
  {
    "id": "hr-440",
    "form": 4,
    "name": "USTAZAH MUNIRAH",
    "advisor_teacher_id": "t-183",
    "needs_review": false
  },
  {
    "id": "hr-541",
    "form": 5,
    "name": "CIKGU ASHRAF",
    "advisor_teacher_id": "t-123",
    "needs_review": false
  },
  {
    "id": "hr-542",
    "form": 5,
    "name": "CIKGU EMMA",
    "advisor_teacher_id": "t-168",
    "needs_review": false
  },
  {
    "id": "hr-543",
    "form": 5,
    "name": "CIKGU FARIZAN",
    "advisor_teacher_id": "t-131",
    "needs_review": false
  },
  {
    "id": "hr-544",
    "form": 5,
    "name": "CIKGU HAZLIEN",
    "advisor_teacher_id": "t-196",
    "needs_review": true
  },
  {
    "id": "hr-545",
    "form": 5,
    "name": "CIKGU NOORZI",
    "advisor_teacher_id": "t-141",
    "needs_review": false
  },
  {
    "id": "hr-546",
    "form": 5,
    "name": "CIKGU RIZALMAN",
    "advisor_teacher_id": "t-207",
    "needs_review": false
  },
  {
    "id": "hr-547",
    "form": 5,
    "name": "CIKGU BIYAMIN",
    "advisor_teacher_id": "t-163",
    "needs_review": false
  },
  {
    "id": "hr-548",
    "form": 5,
    "name": "CIKGU SURIANA",
    "advisor_teacher_id": "t-132",
    "needs_review": false
  },
  {
    "id": "hr-549",
    "form": 5,
    "name": "CIKGU SYARIFUAD",
    "advisor_teacher_id": "t-155",
    "needs_review": false
  },
  {
    "id": "hr-550",
    "form": 5,
    "name": "MADAM HAS",
    "advisor_teacher_id": "t-111",
    "needs_review": false
  },
  {
    "id": "hr-551",
    "form": 5,
    "name": "SIR M",
    "advisor_teacher_id": "t-143",
    "needs_review": false
  },
  {
    "id": "hr-552",
    "form": 5,
    "name": "USTAZ ROSLI",
    "advisor_teacher_id": "t-188",
    "needs_review": false
  }
];

export const INITIAL_COMPETITIONS: Competition[] = [
  // Tingkatan 1 (Known official competitions)
  { id: 'c-101', name: 'Pementasan Cerpen', form: 1, pic_teacher_id: 't-101' },
  { id: 'c-102', name: 'Newspaper Scavenger Hunt', form: 1, pic_teacher_id: 't-102' },
  { id: 'c-103', name: 'Slot Motivasi', form: 1, pic_teacher_id: 't-101' },
  { id: 'c-104', name: 'Misi Menakluk al Gebra', form: 1, pic_teacher_id: 't-103' },
  { id: 'c-105', name: 'Slot Malam Citrawarna', form: 1, pic_teacher_id: 't-104' },

  // Tingkatan 2 (Known official competitions)
  { id: 'c-201', name: 'Slot Motivasi', form: 2, pic_teacher_id: 't-101' },
  { id: 'c-202', name: 'Slot Malam Citrawarna', form: 2, pic_teacher_id: 't-104' },

  // Tingkatan 3 (Known official competitions)
  { id: 'c-301', name: 'Aesira My Challenge (Giant Volleyball Challenge)', form: 3, pic_teacher_id: 't-105' },
  { id: 'c-302', name: 'Aesira My Challenge (My Mission Malaysia)', form: 3, pic_teacher_id: 't-105' },
  { id: 'c-303', name: 'Slot RBT', form: 3, pic_teacher_id: 't-103' },
  { id: 'c-304', name: 'Slot Sejarah', form: 3, pic_teacher_id: 't-104' },
  { id: 'c-305', name: 'Slot Malam Citrawarna', form: 3, pic_teacher_id: 't-104' },

  // Tingkatan 4 (Tiada pertandingan rekaan; ditambah melalui Data Master)
  // Tingkatan 5 (TIADA PERTANDINGAN SAMA SEKALI)
];

export const INITIAL_SCHEDULE_SLOTS: ScheduleSlot[] = [
  // 13 September 2026
  {
    id: 's-101',
    title: 'Slot Motivasi Kecemerlangan',
    date: '2026-09-13',
    start_time: '08:00',
    end_time: '10:00',
    pic_teacher_id: 't-101',
    targets: [{ form: 1 }, { form: 2 }]
  },
  {
    id: 's-102',
    title: 'Pementasan Cerpen',
    date: '2026-09-13',
    start_time: '10:30',
    end_time: '12:30',
    pic_teacher_id: 't-102',
    targets: [{ form: 1 }]
  },
  {
    id: 's-103',
    title: 'Aesira My Challenge (Giant Volleyball)',
    date: '2026-09-13',
    start_time: '14:30',
    end_time: '16:30',
    pic_teacher_id: 't-105',
    targets: [{ form: 3 }]
  },
  {
    id: 's-104',
    title: 'Malam Citrawarna MRSM Tumpat',
    date: '2026-09-13',
    start_time: '20:30',
    end_time: '22:30',
    pic_teacher_id: 't-104',
    targets: [{ form: 1 }, { form: 2 }, { form: 3 }]
  }
];
