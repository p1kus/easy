const state = {
  current: null,
  currentIndex: null,
  currentRecord: null,
  answered: 0,
  correct: 0,
  order: [],
  cursor: 0,
  history: [],
  remaining: [],
  mode: "endless",
  difficulty: "normal",
  stats: {},
  activeQuizId: null,
};

const DEFAULT_DATA = window.QUIZ_DATA?.questions ?? [];
let data = [];
let importedQuiz = null;
let importedReport = null;
let importCounter = 0;
const quizCatalog = [
  {
    id: "ml-default",
    title: "Quiz ML",
    badge: "Wgrany automatycznie",
    description: "Gotowy zestaw z pytań o uczenie maszynowe.",
    questions: DEFAULT_DATA,
  },
];
const STATS_KEY = "mlQuizQuestionStats:v1";
const HARD_DISTRACTORS = {
  "1.1": [
    "Zestaw danych składa się ze 150 cech i 4 próbek.",
    "Zestaw danych składa się ze 150 obserwacji i 4 etykiet.",
    "Macierz wejść zawiera 150 próbek oraz 4 klasy wyjściowe.",
  ],
  "1.2": [
    "Pojedyncza obserwacja ma 1 cechę i 4 próbki.",
    "Pojedyncza obserwacja ma 4 klasy wyjściowe.",
    "Pojedyncza obserwacja jest kolumną z 4 wartościami.",
  ],
  "1.3": [
    "Klasyfikacja to przewidywanie wartości ciągłej na podstawie dotychczasowych obserwacji.",
    "Klasyfikacja to przypisywanie nowych wystąpień do grup bez etykiet.",
    "Klasyfikacja to odkrywanie ukrytych skupień bez znanych klas.",
  ],
  "1.4": [
    "x = [y(1), y(2), ..., y(N)]T.",
    "y = [x(1), x(2), ..., x(N)]T.",
    "Y = [y(1), y(2), ..., y(m)].",
  ],
  "1.5": [
    "{(x(i), y(i))}, i = 0, ..., m.",
    "{(x(i), x(i))}, i = 1, ..., m.",
    "{(y(i), x(i))}, i = 1, ..., m.",
  ],
  "1.6": [
    "(y, x).",
    "(x(i), y).",
    "(x, y(i)).",
  ],
  "1.8": [
    "Próbka, obserwacja, instancja, rekord. Nie: atrybut ani kolumna.",
    "Próbka, atrybut, instancja, rekord. Nie: cecha ani zmienna zależna.",
    "Obserwacja, rekord, cecha, instancja. Nie: etykieta ani klasa.",
  ],
  "1.9": [
    "Cecha albo zmienna zależna.",
    "Atrybut albo etykieta klasy.",
    "Wiersz albo obserwacja.",
  ],
  "1.14": [
    "Każda próbka zawiera dwie cechy oraz dwie etykiety klas.",
    "Każdy zbiór zawiera dwie próbki, zwykle oznaczane x1 i x2.",
    "Każda cecha zawiera dwie próbki opisujące jedną obserwację.",
  ],
  "1.15": [
    "Dyskretne, uporządkowane wartości określające kolejność instancji.",
    "Ciągłe, nieuporządkowane wartości określające przynależność do grup.",
    "Dyskretne wartości opisujące cechy wejściowe poszczególnych instancji.",
  ],
  "1.20": [
    "float64 tylko wtedy, gdy liczba nie ma części dziesiętnej.",
    "int, jeśli liczba zawiera przecinek dziesiętny.",
    "str, jeśli wartość ma być używana w obliczeniach numerycznych.",
  ],
  "1.21": [
    "Dopasowuje dane do już wytrenowanego modelu.",
    "Wyznacza predykcje modelu dla danych uczących.",
    "Dopasowuje hiperparametry przez ocenę na zbiorze testowym.",
  ],
  "1.22": [
    "Przypisanie wartości po sprawdzeniu równości.",
    "Porównanie tożsamości obiektów w pamięci.",
    "Sprawdzenie, czy jedna wartość zawiera drugą.",
  ],
  "1.23": [
    "Wykonuje blok kodu dopóki x jest większe od 5.",
    "Przypisuje wartość True, jeśli x jest większe od 5.",
    "Filtruje listę tak, aby zostały tylko wartości większe od 5.",
  ],
  "1.24": [
    "from.",
    "include.",
    "using.",
  ],
  "1.25": [
    "(1, 2, 3).",
    "{1, 2, 3}.",
    "array(1, 2, 3).",
  ],
  "1.26": [
    "Ponieważ dostarczają gotowe funkcje, ale zwykle wymagają samodzielnej implementacji algorytmów.",
    "Ponieważ automatycznie wybierają najlepszy model i jego hiperparametry.",
    "Ponieważ zastępują konieczność walidacji wyników analizy danych.",
  ],
  "2.6": [
    "Lepiej miesza próbki, ale nie zachowuje proporcji klas.",
    "Zachowuje proporcje klas tylko w zbiorze testowym.",
    "Zachowuje proporcje cech, dlatego pomaga przy nierównych skalach danych.",
  ],
  "3.5": [
    "Wyszukiwanie kierunków minimalnej wariancji i rzutowanie danych na oryginalną przestrzeń.",
    "Wyszukiwanie kierunków maksymalnej korelacji z etykietami klas.",
    "Wyszukiwanie centroidów opisujących największą wariancję w danych.",
  ],
  "3.6": [
    "Wartości własne oraz wielkości wariancji wyjaśnionej.",
    "Centroidy klastrów oraz kierunki minimalnej wariancji.",
    "Składowe główne oraz długości wektorów cech wejściowych.",
  ],
  "3.8": [
    "Korelację, czyli unormowany element macierzy kowariancji.",
    "Wariancję pojedynczej cechy, czyli element diagonalny macierzy korelacji.",
    "Odchylenie standardowe pary cech w macierzy kowariancji.",
  ],
  "3.9": [
    "Macierz korelacji dla trzech cech.",
    "Macierz kowariancji dla trzech próbek.",
    "Macierz wartości własnych dla trzech składowych.",
  ],
  "3.10": [
    "Sigma oznacza macierz korelacji.",
    "Sigma oznacza macierz wartości własnych.",
    "Sigma oznacza odchylenie standardowe cech.",
  ],
  "3.11": [
    "v to wartość własna, a lambda to wektor własny.",
    "v to wektor średnich, a lambda to wariancja wyjaśniona.",
    "v to składowa główna, a lambda to liczba cech.",
  ],
  "3.12": [
    "Współczynnik wariancji skumulowanej dla j-tej składowej.",
    "Współczynnik korelacji j-tej składowej z etykietą klasy.",
    "Udział j-tej cechy wejściowej w całkowitej wariancji.",
  ],
  "3.13": [
    "Wartości własne uporządkowane malejąco.",
    "Współczynniki wariancji wyjaśnionej.",
    "Oryginalne cechy wejściowe po standaryzacji.",
  ],
  "3.14": [
    "50%.",
    "65%.",
    "70%.",
  ],
  "4.1": [
    "Grupowaniem obiektów na podstawie znanych etykiet klas.",
    "Grupowaniem cech na podstawie podobieństwa etykiet.",
    "Przypisywaniem obiektów do klas wytrenowanych nadzorowanie.",
  ],
  "4.2": [
    "Uczenie częściowo nadzorowane.",
    "Uczenie nadzorowane bez etykiet.",
    "Uczenie przez wzmocnienie bez nagród.",
  ],
  "4.3": [
    "Każdy punkt należy do jednego głównego klastra i kilku pobocznych.",
    "Każdy punkt ma stopień przynależności do każdego klastra.",
    "Każdy klaster należy do dokładnie jednego punktu.",
  ],
  "4.4": [
    "Twardą.",
    "Hierarchiczną.",
    "Nierozmytą.",
  ],
  "4.5": [
    "Miękką.",
    "Rozmytą.",
    "Częściowo rozmytą.",
  ],
  "4.6": [
    "Do wyboru optymalnej liczby iteracji.",
    "Do wyboru optymalnej liczby cech.",
    "Do wyboru optymalnej wartości profilu.",
  ],
  "4.7": [
    "Sumą odległości punktów od centroidu klastra.",
    "Średnią kwadratów odległości centroidów między klastrami.",
    "Sumą kwadratów odległości centroidu od innych centroidów.",
  ],
  "4.8": [
    "Od 0 do 1, czyli [0, 1].",
    "Od -1 do 0, czyli [-1, 0].",
    "Od 0 do nieskończoności.",
  ],
  "4.9": [
    "1.",
    "-1.",
    "0.5.",
  ],
  "4.10": [
    "Ocenę jakości klasyfikacji.",
    "Ocenę jakości regresji.",
    "Dobór liczby epok uczenia.",
  ],
  "4.11": [
    "Odległość euklidesową bez podnoszenia do kwadratu.",
    "Odległość Manhattan po standaryzacji cech.",
    "Odległość kosinusową między punktem i centroidem.",
  ],
  "4.12": [
    "x i y oznaczają centroidy dwóch sąsiednich klastrów.",
    "x i y oznaczają etykiety klas porównywanych punktów.",
    "x i y oznaczają dwie wartości własne w przestrzeni cech.",
  ],
  "4.13": [
    "Funkcję odległości, czyli metrykę podobieństwa punktów.",
    "Funkcję profilu, czyli miarę separacji klastrów.",
    "Funkcję korelacji, czyli zależność między cechami.",
  ],
  "4.14": [
    "Najczęściej występujący punkt w klastrze.",
    "Punkt najbliższy wszystkim punktom w klastrze.",
    "Średnią odległość punktów od granicy klastra.",
  ],
  "4.15": [
    "Wagę przypisania próbki do j-tego klastra.",
    "Odległość próbki od j-tego centroidu.",
    "Liczbę punktów należących do j-tego klastra.",
  ],
  "4.16": [
    "Próbka x(i) częściowo należy do skupienia j.",
    "Próbka x(i) nie znajduje się w skupieniu j.",
    "Centroid j został przypisany do próbki x(i).",
  ],
  "4.17": [
    "Losuje centroidy całkowicie losowo, ale wykonuje więcej iteracji.",
    "Nie wymaga podania liczby klastrów, bo wybiera ją automatycznie.",
    "Używa innej metryki odległości niż zwykłe k-średnich.",
  ],
  "4.18": [
    "Liczbę klastrów.",
    "Liczbę iteracji.",
    "Stopień separacji.",
  ],
  "4.19": [
    "Wymaga z góry określonej liczby iteracji.",
    "Wymaga z góry określonej metryki profilu.",
    "Wymaga z góry określonego centroidu startowego.",
  ],
  "4.20": [
    "K-medoids.",
    "KNN.",
    "K-fold.",
  ],
  "4.21": [
    "scipy-learn.",
    "sklearn-plot.",
    "statsmodels-learn.",
  ],
  "4.22": [
    "R.",
    "Julia.",
    "MATLAB.",
  ],
  "4.23": [
    "Wartość opisującą obiekt.",
    "Atrybut opisujący etykietę obiektu.",
    "Właściwość przewidywana przez model.",
  ],
  "4.24": [
    "Częściową separację danych.",
    "Zbyt dużą separację danych.",
    "Poprawnie dobraną liczbę klastrów.",
  ],
  "4.25": [
    "Małą odległość obiektów od centrum klastra.",
    "Duże podobieństwo centroidów między klastrami.",
    "Dużą odległość obiektów od centroidu klastra.",
  ],
  "4.26": [
    "Klastry mogą zostać zbyt mocno rozdzielone.",
    "Klastry będą rozdzielone tylko w przestrzeni etykiet.",
    "Centroidy przestaną zależeć od wybranych cech.",
  ],
  "4.27": [
    "Pozwala potwierdzić, że wybrana liczba klastrów jest zawsze poprawna.",
    "Pozwala zobaczyć, że liczba klastrów nie wpływa na podział.",
    "Pozwala pominąć interpretację wyników, jeśli wykres wygląda dobrze.",
  ],
  "4.28": [
    "Dwa klastry często maksymalizują współczynnik profilu.",
    "Wizualizacja zawsze pokazuje poprawny podział dla dwóch klastrów.",
    "K-means++ może automatycznie ukrywać błędny podział.",
  ],
  "4.29": [
    "Dodatkowy wymiar zmienia tylko skalę osi, ale nie relacje między punktami.",
    "Trzecia cecha zwykle usuwa wpływ dwóch pierwszych cech.",
    "Dodatkowy wymiar zmienia etykiety klas, ale nie położenie punktów.",
  ],
  "4.30": [
    "Pomaga porównać dokładność klasyfikatora po klasteryzacji.",
    "Pomaga dobrać liczbę cech przed wykonaniem PCA.",
    "Pomaga zastąpić interpretację wizualną metryką zewnętrzną.",
  ],
  "4.31": [
    "Większą spójność wewnątrz jednego klastra.",
    "Większą wariancję punktów wewnątrz klastrów.",
    "Lepszą separację cech od etykiet klas.",
  ],
  "4.32": [
    "Różne grupy mogą zostać podzielone na zbyt wiele klastrów.",
    "Podobne grupy mogą zostać rozdzielone na osobne klastry.",
    "Każdy punkt może utworzyć osobny klaster.",
  ],
  "4.33": [
    "Pomaga ocenić jakość modelu bez patrzenia na dane.",
    "Pomaga dobrać hiperparametry bez metryk jakości.",
    "Pomaga potwierdzić wynik, nawet gdy klastry się nakładają.",
  ],
  "4.34": [
    "Możliwość oddzielenia grup krzywą albo powierzchnią.",
    "Możliwość przypisania punktów do klastra przez centroid.",
    "Możliwość rozdzielenia klastrów na podstawie profilu.",
  ],
  "4.35": [
    "Rozmieszczenie centroidów bez punktów danych.",
    "Macierz odległości pomiędzy wszystkimi skupieniami.",
    "Rozmieszczenie danych i etykiet klas nadzorowanych.",
  ],
  "4.36": [
    "Algorytm może utworzyć poprawny podział bez kontekstu danych.",
    "Wynik klasteryzacji zawsze wymaga tylko sprawdzenia metryki.",
    "Uruchomienie kodu wystarcza, jeśli wybrano właściwą liczbę klastrów.",
  ],
  "4.39": [
    "0.",
    "-1.",
    "Nie można jej określić, bo mianownik jest zerowy.",
  ],
  "4.40": [
    "0.",
    "1.",
    "Nie można jej określić, bo mianownik jest zerowy.",
  ],
};

const questionText = document.querySelector("#questionText");
const answerGrid = document.querySelector("#answerGrid");
const feedback = document.querySelector("#feedback");
const questionImage = document.querySelector("#questionImage");
const questionNumber = document.querySelector("#questionNumber");
const poolSize = document.querySelector("#poolSize");
const scoreboard = document.querySelector("#scoreboard");
const answered = document.querySelector("#answered");
const accuracy = document.querySelector("#accuracy");
const checkButton = document.querySelector("#checkButton");
const previousButton = document.querySelector("#previousButton");
const resetAnswerButton = document.querySelector("#resetAnswerButton");
const nextButton = document.querySelector("#nextButton");
const resetButton = document.querySelector("#resetButton");
const endlessMode = document.querySelector("#endlessMode");
const finiteMode = document.querySelector("#finiteMode");
const worstMode = document.querySelector("#worstMode");
const normalDifficulty = document.querySelector("#normalDifficulty");
const hardDifficulty = document.querySelector("#hardDifficulty");
const libraryPanel = document.querySelector("#libraryPanel");
const quizLibrary = document.querySelector("#quizLibrary");
const quizWorkspace = document.querySelector("#quizWorkspace");
const chooseQuizButton = document.querySelector("#chooseQuizButton");
const pdfInput = document.querySelector("#pdfInput");
const fileDrop = document.querySelector(".file-drop");
const importStatus = document.querySelector("#importStatus");
const importPreview = document.querySelector("#importPreview");
const useImportedQuiz = document.querySelector("#useImportedQuiz");
const exportImportedQuiz = document.querySelector("#exportImportedQuiz");

async function ensurePdfJs() {
  if (!window.pdfjsLib) {
    window.pdfjsLib = await import("./vendor/pdf.min.mjs");
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.min.mjs";
  return window.pdfjsLib;
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(state.stats));
  } catch {
    // Storage may be unavailable in strict private browsing; the quiz still works for the session.
  }
}

function questionKey(index) {
  return data[index]?.id ?? String(index);
}

function getQuestionStats(index) {
  const key = questionKey(index);
  return state.stats[key] ?? { attempts: 0, correct: 0, wrong: 0 };
}

function updateQuestionStats(index, isCorrect) {
  const key = questionKey(index);
  const current = getQuestionStats(index);
  state.stats[key] = {
    attempts: current.attempts + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
    wrong: current.wrong + (isCorrect ? 0 : 1),
  };
  saveStats();
}

function revertQuestionStats(index, wasCorrect) {
  const key = questionKey(index);
  const current = getQuestionStats(index);
  const next = {
    attempts: Math.max(0, current.attempts - 1),
    correct: Math.max(0, current.correct - (wasCorrect ? 1 : 0)),
    wrong: Math.max(0, current.wrong - (wasCorrect ? 0 : 1)),
  };

  if (next.attempts === 0) {
    delete state.stats[key];
  } else {
    state.stats[key] = next;
  }
  saveStats();
}

function getWorstIndexes() {
  return data
    .map((item, index) => {
      const stats = getQuestionStats(index);
      return {
        index,
        attempts: stats.attempts,
        wrong: stats.wrong,
        accuracy: stats.attempts ? stats.correct / stats.attempts : 1,
      };
    })
    .filter((entry) => entry.attempts > 0 && entry.wrong > 0)
    .sort((a, b) => (
      a.accuracy - b.accuracy
      || b.wrong - a.wrong
      || b.attempts - a.attempts
      || a.index - b.index
    ))
    .map((entry) => entry.index);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fraction(top, bottom) {
  return `<span class="formula"><span class="frac"><span>${top}</span><span>${bottom}</span></span></span>`;
}

function formatMath(value) {
  let html = escapeHtml(value);
  const replacements = [
    ["r = sigma_xy / (sigma_x * sigma_y)", `r = ${fraction("σ<sub>xy</sub>", "σ<sub>x</sub> · σ<sub>y</sub>")}`],
    ["r = sigma_xy / (sigma_x - sigma_y)", `r = ${fraction("σ<sub>xy</sub>", "σ<sub>x</sub> - σ<sub>y</sub>")}`],
    ["r = -sigma_xy / (sigma_x * sigma_y)", `r = -${fraction("σ<sub>xy</sub>", "σ<sub>x</sub> · σ<sub>y</sub>")}`],
    ["r = sigma_x * sigma_y / sigma_xy", `r = ${fraction("σ<sub>x</sub> · σ<sub>y</sub>", "σ<sub>xy</sub>")}`],
    ["FP/(FP+PN)", fraction("FP", "FP + PN")],
    ["(FP+FN)/(FP+FN+PP+PN)", fraction("FP + FN", "FP + FN + PP + PN")],
    ["2*(PRE*PEL)/(PRE+PEL)", `<span class="formula">2 · ${fraction("PRE · PEL", "PRE + PEL")}</span>`],
    ["PP/(PP+FP)", fraction("PP", "PP + FP")],
    ["(PP+PN)/(FP+FN+PP+PN)", fraction("PP + PN", "FP + FN + PP + PN")],
    ["PP/(FN+PP)", fraction("PP", "FN + PP")],
    ["lambda_j / sum_{l=1}^{d} lambda_l", fraction("λ<sub>j</sub>", "Σ<sub>l=1</sub><sup>d</sup> λ<sub>l</sub>")],
    ["sigma_jk = 1/n * sum_{i=1}^{n} (x_j^(i) - mu_j)(x_k^(i) - mu_k)", `σ<sub>jk</sub> = ${fraction("1", "n")} Σ<sub>i=1</sub><sup>n</sup> (x<sub>j</sub><sup>(i)</sup> - μ<sub>j</sub>)(x<sub>k</sub><sup>(i)</sup> - μ<sub>k</sub>)`],
    ["d(x, y)^2 = ||x - y||_2^2", `d(x, y)<sup>2</sup> = ||x - y||<sub>2</sub><sup>2</sup>`],
    ["sum_{i=1}^{n} sum_{j=1}^{k} w^(i,j) ||x^(i) - mu^(j)||^2", `Σ<sub>i=1</sub><sup>n</sup> Σ<sub>j=1</sub><sup>k</sup> w<sup>(i,j)</sup> ||x<sup>(i)</sup> - μ<sup>(j)</sup>||<sup>2</sup>`],
    ["Sigma = [[sigma_1^2, sigma_12, sigma_13], [sigma_21, sigma_2^2, sigma_23], [sigma_31, sigma_32, sigma_3^2]]", `Σ = <span class="matrix">[σ<sub>1</sub><sup>2</sup> σ<sub>12</sub> σ<sub>13</sub>; σ<sub>21</sub> σ<sub>2</sub><sup>2</sup> σ<sub>23</sub>; σ<sub>31</sub> σ<sub>32</sub> σ<sub>3</sub><sup>2</sup>]</span>`],
  ];

  replacements.forEach(([plain, rich]) => {
    html = html.replaceAll(plain, rich);
  });

  html = html
    .replaceAll("Sigma", "Σ")
    .replaceAll("lambda", "λ")
    .replaceAll("a_i", "a<sub>i</sub>")
    .replaceAll("b_i", "b<sub>i</sub>")
    .replaceAll("s_i", "s<sub>i</sub>")
    .replaceAll("sigma_xy", "σ<sub>xy</sub>")
    .replaceAll("sigma_x", "σ<sub>x</sub>")
    .replaceAll("sigma_y", "σ<sub>y</sub>")
    .replace(/\bmu\b/g, "μ")
    .replaceAll("\n", "<br>");

  return html;
}

function setFormattedText(element, value) {
  element.innerHTML = formatMath(value);
}

function normalizePlainText(value) {
  return String(value)
    .replaceAll("\u00a0", " ")
    .replaceAll("−", "-")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeComparable(value) {
  return normalizePlainText(value)
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"']/g, "")
    .trim();
}

function isTrueFalseAnswer(value) {
  const normalized = normalizeComparable(value);
  if (["prawda", "true", "tak"].includes(normalized)) {
    return true;
  }
  if (["fałsz", "falsz", "false", "nie"].includes(normalized)) {
    return false;
  }
  return null;
}

function setImportStatus(message, isError = false) {
  importStatus.textContent = message;
  importStatus.classList.toggle("error", isError);
}

function renderImportPreview(report) {
  importPreview.innerHTML = "";
  importPreview.hidden = false;

  const summary = document.createElement("div");
  summary.className = "import-sample";
  summary.innerHTML = `<strong>${report.questions.length} pytań gotowych do quizu</strong>${report.skipped.length} pominiętych bez wykrytej poprawnej odpowiedzi.`;
  importPreview.append(summary);

  report.questions.slice(0, 5).forEach((question) => {
    const sample = document.createElement("div");
    sample.className = "import-sample";
    const typeLabel = question.type || "singleChoice";
    sample.innerHTML = `<strong>${escapeHtml(question.id)} · ${escapeHtml(typeLabel)}</strong>${escapeHtml(question.question)}`;
    importPreview.append(sample);
  });

  if (report.skipped.length) {
    const skipped = document.createElement("div");
    skipped.className = "import-sample";
    skipped.innerHTML = `<strong>Pominięte przykłady</strong>${escapeHtml(report.skipped.slice(0, 3).join(" · "))}`;
    importPreview.append(skipped);
  }
}

async function extractPdfText(file) {
  const data = await extractPdfData(file);
  return data.text;
}

function getOperatorText(args) {
  const glyphs = args?.[0];
  if (!Array.isArray(glyphs)) {
    return "";
  }

  return glyphs
    .map((glyph) => {
      if (typeof glyph === "string") {
        return glyph;
      }
      return glyph?.unicode || glyph?.str || "";
    })
    .join("");
}

function normalizePdfColor(args) {
  if (!Array.isArray(args)) {
    return null;
  }
  const values = args.slice(0, 3).map(Number);
  if (values.length < 3 || values.some((value) => Number.isNaN(value))) {
    return null;
  }
  const scale = values.some((value) => value > 1) ? 255 : 1;
  return values.map((value) => value / scale);
}

function isCorrectAnswerColor(color) {
  if (!color) {
    return false;
  }
  const [r, g, b] = color;
  return g > 0.45 && g > r * 1.35 && g > b * 1.2;
}

function hasGreenPixels(canvas, x, y, width, height) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const left = Math.max(0, Math.floor(x));
  const top = Math.max(0, Math.floor(y));
  const right = Math.min(canvas.width, Math.ceil(x + width));
  const bottom = Math.min(canvas.height, Math.ceil(y + height));
  const sampleWidth = right - left;
  const sampleHeight = bottom - top;

  if (sampleWidth <= 0 || sampleHeight <= 0) {
    return false;
  }

  const pixels = context.getImageData(left, top, sampleWidth, sampleHeight).data;
  let greenPixels = 0;
  let coloredPixels = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 80) {
      continue;
    }

    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;
    const isInk = r < 0.86 || g < 0.86 || b < 0.86;
    if (!isInk) {
      continue;
    }

    coloredPixels += 1;
    if (isCorrectAnswerColor([r, g, b])) {
      greenPixels += 1;
    }
  }

  return greenPixels >= 3 && greenPixels / Math.max(1, coloredPixels) > 0.18;
}

async function extractColoredTextsFromRender(page, content) {
  const scale = 2;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  await page.render({ canvasContext: context, viewport }).promise;

  const coloredTexts = [];

  content.items.forEach((item) => {
    const text = normalizePlainText(item.str);
    if (!text) {
      return;
    }

    const transform = window.pdfjsLib.Util.transform(viewport.transform, item.transform);
    const fontHeight = Math.hypot(transform[2], transform[3]) || (item.height || 10) * scale;
    const x = transform[4];
    const y = transform[5] - fontHeight;
    const width = Math.max(item.width * scale, text.length * fontHeight * 0.25);
    const height = fontHeight * 1.35;

    if (hasGreenPixels(canvas, x - 2, y - 2, width + 4, height + 4)) {
      coloredTexts.push(text);
    }
  });

  return coloredTexts;
}

async function extractColoredTexts(page, content) {
  try {
    return await extractColoredTextsFromRender(page, content);
  } catch {
    return [];
  }
}

async function extractPdfData(file) {
  const pdfjsLib = await ensurePdfJs();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = [];
  const coloredTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map();

    content.items.forEach((item) => {
      const text = normalizePlainText(item.str);
      if (!text) {
        return;
      }
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      if (!rows.has(y)) {
        rows.set(y, []);
      }
      rows.get(y).push({ x, text });
    });

    const pageLines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, parts]) => parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(" "))
      .map(normalizePlainText)
      .filter(Boolean);
    pages.push(pageLines.join("\n"));
    coloredTexts.push(...await extractColoredTexts(page, content));
  }

  return {
    text: pages.join("\n"),
    coloredTexts,
  };
}

function createImportedQuestion(candidate, answerKeys, skipped) {
  const rawAnswer = normalizePlainText(candidate.answer || answerKeys[candidate.id] || candidate.coloredAnswer || "");
  const questionTextValue = normalizePlainText([candidate.prompt, ...candidate.body].join(" "));

  if (!questionTextValue) {
    return null;
  }

  if (candidate.options.length >= 2) {
    const explicitLetters = rawAnswer
      .split(/[,; ]+/)
      .map((part) => part.trim().toUpperCase())
      .filter((part) => /^[A-D]$/.test(part));
    const correctLetters = new Set([
      ...explicitLetters,
      ...(candidate.coloredAnswers || []),
    ]);

    if (correctLetters.size > 1) {
      return {
        id: candidate.id,
        question: questionTextValue,
        answer: candidate.options.filter((option) => correctLetters.has(option.letter)).map((option) => option.text).join("; "),
        type: "multiSelect",
        items: candidate.options.map((option) => ({
          text: `${option.letter}. ${option.text}`,
          correct: correctLetters.has(option.letter),
        })),
        section: "import",
        source: "import",
      };
    }

    let correctIndex = -1;
    if (correctLetters.size === 1) {
      const [letter] = correctLetters;
      correctIndex = candidate.options.findIndex((option) => option.letter === letter);
    }

    if (correctIndex < 0 && rawAnswer) {
      const normalizedAnswer = normalizeComparable(rawAnswer);
      correctIndex = candidate.options.findIndex((option) => {
        const normalizedText = normalizeComparable(option.text);
        return normalizedText === normalizedAnswer || normalizedText.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedText);
      });
    }

    if (correctIndex < 0) {
      skipped.push(`${candidate.id}: ${questionTextValue}`);
      return null;
    }

    return {
      id: candidate.id,
      question: questionTextValue,
      answer: candidate.options[correctIndex].text,
      choices: candidate.options.map((option) => option.text).slice(0, 4),
      correctIndex,
      section: "import",
      source: "import",
    };
  }

  if (rawAnswer) {
    const tfAnswer = isTrueFalseAnswer(rawAnswer);
    if (tfAnswer !== null) {
      return {
        id: candidate.id,
        question: questionTextValue,
        answer: tfAnswer ? "Prawda" : "Fałsz",
        type: "trueFalse",
        items: [{ text: questionTextValue, answer: tfAnswer }],
        section: "import",
        source: "import",
      };
    }

    return {
      id: candidate.id,
      question: questionTextValue,
      answer: rawAnswer,
      answerLabel: rawAnswer,
      accepted: [rawAnswer],
      type: "text",
      section: "import",
      source: "import",
    };
  }

  skipped.push(`${candidate.id}: ${questionTextValue}`);
  return null;
}

function parseImportedQuiz(text, fileName) {
  return parseImportedQuizData({ text, coloredTexts: [] }, fileName);
}

function applyColoredAnswers(candidates, coloredTexts) {
  const normalizedColored = coloredTexts
    .map((text) => normalizeComparable(text))
    .filter((text) => text.length >= 3);

  candidates.forEach((candidate) => {
    candidate.coloredAnswers = [];
    candidate.options.forEach((option) => {
      const optionText = normalizeComparable(option.text);
      const optionLetterText = normalizeComparable(`${option.letter} ${option.text}`);
      const isColored = normalizedColored.some((colored) => (
        optionText.includes(colored)
        || colored.includes(optionText)
        || optionLetterText.includes(colored)
        || colored.includes(optionLetterText)
      ));
      if (isColored) {
        candidate.coloredAnswer = option.letter;
        candidate.coloredAnswers.push(option.letter);
      }
    });
  });
}

function parseImportedQuizData(pdfData, fileName) {
  const text = typeof pdfData === "string" ? pdfData : pdfData.text;
  const coloredTexts = typeof pdfData === "string" ? [] : pdfData.coloredTexts || [];
  const lines = text
    .split(/\n+/)
    .map(normalizePlainText)
    .filter(Boolean);
  const candidates = [];
  const answerKeys = {};
  let current = null;

  const finishCurrent = () => {
    if (current) {
      candidates.push(current);
      current = null;
    }
  };

  lines.forEach((line) => {
    const answerKeyMatch = line.match(/^(?:klucz|odpowiedzi)?\s*(\d+(?:[.,]\d+)*)\s*[:.\-) ]\s*([A-D]|prawda|fałsz|falsz|true|false)\b$/i);
    if (answerKeyMatch && line.length <= 32) {
      answerKeys[answerKeyMatch[1].replace(",", ".")] = answerKeyMatch[2];
      return;
    }

    const questionMatch = line.match(/^(?:pytanie\s*)?(\d+(?:[.,]\d+)*)\s*[\).:-]?\s+(.{6,})$/i);
    if (questionMatch && !/^(rozdział|chapter|strona)\b/i.test(line)) {
      finishCurrent();
      current = {
        id: questionMatch[1].replace(",", "."),
        prompt: questionMatch[2],
        body: [],
        options: [],
        answer: "",
      };
      return;
    }

    if (!current) {
      return;
    }

    const inlineAnswer = line.match(/^(?:poprawna\s+odpowied[źz]|odpowied[źz]|answer|correct answer)\s*[:.-]\s*(.+)$/i);
    if (inlineAnswer) {
      current.answer = inlineAnswer[1];
      return;
    }

    const optionMatch = line.match(/^([A-Da-d])\s*[\).:-]\s+(.+)$/);
    if (optionMatch) {
      current.options.push({
        letter: optionMatch[1].toUpperCase(),
        text: optionMatch[2].replace(/^[✓*]\s*/, ""),
      });
      if (/^[✓*]/.test(optionMatch[2])) {
        current.answer = optionMatch[1].toUpperCase();
      }
      return;
    }

    if (current.options.length) {
      const lastOption = current.options[current.options.length - 1];
      lastOption.text = `${lastOption.text} ${line}`;
      return;
    }

    current.body.push(line);
  });

  finishCurrent();
  applyColoredAnswers(candidates, coloredTexts);

  const skipped = [];
  const questions = candidates
    .map((candidate) => createImportedQuestion(candidate, answerKeys, skipped))
    .filter(Boolean);

  return {
    fileName,
    questions,
    skipped,
    extractedCandidates: candidates.length,
  };
}

window.QuizImporter = {
  parse: parseImportedQuiz,
  parseData: parseImportedQuizData,
};

function getQuizStatsLabel(questions) {
  const count = questions.length;
  if (count === 1) {
    return "1 pytanie";
  }
  return `${count} pytań`;
}

function renderQuizLibrary() {
  quizLibrary.innerHTML = "";

  quizCatalog.forEach((entry) => {
    const button = document.createElement("button");
    button.className = "quiz-card-button";
    button.type = "button";
    const badge = document.createElement("span");
    badge.className = "quiz-card-badge";
    badge.textContent = entry.badge;
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const description = document.createElement("span");
    description.textContent = entry.description;
    const count = document.createElement("small");
    count.textContent = getQuizStatsLabel(entry.questions);
    button.append(badge, title, description, count);
    button.addEventListener("click", () => selectQuiz(entry.id));
    quizLibrary.append(button);
  });
}

function showLibrary() {
  state.activeQuizId = null;
  quizWorkspace.hidden = true;
  scoreboard.hidden = true;
  chooseQuizButton.hidden = true;
  libraryPanel.hidden = false;
  questionText.textContent = "";
  answerGrid.innerHTML = "";
  feedback.hidden = true;
}

function showQuizWorkspace() {
  libraryPanel.hidden = true;
  quizWorkspace.hidden = false;
  scoreboard.hidden = false;
  chooseQuizButton.hidden = false;
}

function setQuizData(nextData, quizId = null) {
  data = nextData;
  state.activeQuizId = quizId;
  state.current = null;
  state.currentIndex = null;
  state.currentRecord = null;
  state.answered = 0;
  state.correct = 0;
  state.history = [];
  resetPools();
  showQuizWorkspace();
  updateScore();
  drawQuestion({ pushHistory: false });
}

function selectQuiz(quizId) {
  const entry = quizCatalog.find((item) => item.id === quizId);
  if (!entry) {
    return;
  }
  setQuizData([...entry.questions], entry.id);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function refreshOrder() {
  state.order = shuffle(data.map((_, index) => index));
  state.cursor = 0;
}

function resetPools() {
  refreshOrder();
  state.remaining = data.map((_, index) => index);
}

function getNextIndex() {
  if (state.mode === "finite") {
    if (!state.remaining.length) {
      return null;
    }

    const candidates = state.remaining.filter((index) => index !== state.currentIndex);
    const pool = candidates.length ? candidates : state.remaining;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (state.mode === "worst") {
    const worstIndexes = getWorstIndexes();
    if (!worstIndexes.length) {
      return null;
    }

    const candidates = worstIndexes.filter((index) => index !== state.currentIndex);
    const pool = candidates.length ? candidates : worstIndexes;
    const shortlist = pool.slice(0, Math.min(8, pool.length));
    return shortlist[Math.floor(Math.random() * shortlist.length)];
  }

  if (state.cursor >= state.order.length) {
    refreshOrder();
  }

  const index = state.order[state.cursor];
  state.cursor += 1;
  return index;
}

function drawQuestion({ pushHistory = true, index = null, record = null } = {}) {
  if (!data.length) {
    questionText.textContent = "Brak pytań do wyświetlenia.";
    return;
  }

  const nextIndex = index ?? getNextIndex();
  if (nextIndex === null) {
    showFinishedState();
    return;
  }

  if (pushHistory && state.currentIndex !== null) {
    state.history.push({
      index: state.currentIndex,
      record: { ...state.currentRecord },
    });
  }

  const item = data[nextIndex];
  state.current = item;
  state.currentIndex = nextIndex;
  state.currentRecord = record
    ? { ...record }
    : {
        answered: false,
        correct: false,
        removedFromPool: !state.remaining.includes(nextIndex),
        statApplied: false,
      };

  setFormattedText(questionText, item.question);
  if (item.image) {
    questionImage.src = item.image;
    questionImage.alt = `Podgląd pytania ${item.id}`;
    questionImage.hidden = false;
  } else {
    questionImage.removeAttribute("src");
    questionImage.alt = "";
    questionImage.hidden = true;
  }
  questionNumber.textContent = `Pytanie ${item.id}`;
  updatePoolLabel();
  feedback.hidden = true;
  feedback.innerHTML = "";
  feedback.className = "feedback";
  answerGrid.innerHTML = "";
  answerGrid.className = "answer-grid";
  checkButton.hidden = true;
  checkButton.disabled = false;

  if (item.type === "trueFalse") {
    renderTrueFalse(item);
    finalizeQuestionRender();
    return;
  }

  if (item.type === "multiSelect") {
    renderMultiSelect(item);
    finalizeQuestionRender();
    return;
  }

  if (item.type === "matching") {
    renderMatching(item);
    finalizeQuestionRender();
    return;
  }

  if (item.type === "text") {
    renderTextInput(item);
    finalizeQuestionRender();
    return;
  }

  renderSingleChoice(item);
  finalizeQuestionRender();
}

function showFinishedState() {
  state.current = null;
  state.currentIndex = null;
  state.currentRecord = null;
  questionNumber.textContent = state.mode === "worst" ? "Brak statystyk" : "Koniec puli";
  poolSize.textContent = state.mode === "worst" ? "0 pytań z błędami" : "0 pytań zostało";
  questionText.textContent = state.mode === "worst"
    ? "Nie ma jeszcze pytań, które idą najgorzej."
    : "Przerobione wszystkie pytania w tym trybie.";
  questionImage.hidden = true;
  answerGrid.innerHTML = "";
  feedback.hidden = false;
  feedback.className = "feedback good";
  feedback.textContent = state.mode === "worst"
    ? "Odpowiedz błędnie na kilka pytań w innym trybie, a tutaj pojawi się osobna powtórka."
    : "Możesz zresetować wynik albo przełączyć tryb, żeby zacząć od nowa.";
  checkButton.hidden = true;
  updateNavigationState();
}

function getSingleChoiceOptions(item) {
  const imageShowsOriginalAnswers = item.image?.endsWith(".webp");

  if (state.difficulty !== "hard" || imageShowsOriginalAnswers || !HARD_DISTRACTORS[item.id]) {
    return item.choices.map((choice, index) => ({
      choice,
      correct: index === item.correctIndex,
    }));
  }

  const correctChoice = item.choices[item.correctIndex] ?? item.answer;
  const hardChoices = [correctChoice, ...HARD_DISTRACTORS[item.id]];
  const seen = new Set();
  const choices = [];

  hardChoices.forEach((choice) => {
    if (!seen.has(choice)) {
      seen.add(choice);
      choices.push(choice);
    }
  });

  item.choices.forEach((choice) => {
    if (choices.length < 4 && !seen.has(choice)) {
      seen.add(choice);
      choices.push(choice);
    }
  });

  return choices.slice(0, 4).map((choice) => ({
    choice,
    correct: choice === correctChoice,
  }));
}

function renderSingleChoice(item) {
  const choiceOrder = shuffle(getSingleChoiceOptions(item));

  choiceOrder.forEach(({ choice, correct }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    setFormattedText(button, choice);
    button.dataset.testid = correct ? "correct-answer" : "wrong-answer";
    button.dataset.correct = String(correct);
    button.addEventListener("click", () => checkAnswer(button));
    answerGrid.append(button);
  });
}

function renderTrueFalse(item) {
  answerGrid.className = "task-list";
  const table = document.createElement("div");
  table.className = "tf-table";
  table.innerHTML = '<div class="tf-head"></div><div class="tf-head">Prawda</div><div class="tf-head">Fałsz</div>';

  item.items.forEach((row, index) => {
    const label = document.createElement("div");
    label.className = "tf-statement";
    setFormattedText(label, row.text);
    table.append(label);

    [true, false].forEach((value) => {
      const cell = document.createElement("label");
      cell.className = "choice-control centered";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `tf-${item.id}-${index}`;
      input.value = String(value);
      cell.append(input);
      table.append(cell);
    });
  });

  answerGrid.append(table);
  checkButton.hidden = false;
}

function renderMultiSelect(item) {
  answerGrid.className = "task-list";
  item.items.forEach((row, index) => {
    const label = document.createElement("label");
    label.className = "choice-control";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.index = String(index);
    const text = document.createElement("span");
    setFormattedText(text, row.text);
    label.append(input, text);
    answerGrid.append(label);
  });
  checkButton.hidden = false;
}

function renderMatching(item) {
  if (item.id === "2.16") {
    renderDragDropMatching(item);
    return;
  }

  answerGrid.className = "task-list";
  item.items.forEach((row, index) => {
    const line = document.createElement("label");
    line.className = "matching-row";
    const prompt = document.createElement("span");
    setFormattedText(prompt, row.prompt);
    const select = document.createElement("select");
    select.dataset.index = String(index);
    select.append(new Option("Wybierz...", ""));
    item.options.forEach((option) => select.append(new Option(option, option)));
    line.append(prompt, select);
    answerGrid.append(line);
  });
  checkButton.hidden = false;
}

function getDragChip(value) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "drag-chip";
  chip.draggable = true;
  chip.dataset.value = value;
  chip.textContent = value;
  chip.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", value);
    event.dataTransfer.effectAllowed = "move";
    chip.classList.add("dragging");
  });
  chip.addEventListener("dragend", () => {
    chip.classList.remove("dragging");
  });
  chip.addEventListener("pointerdown", (event) => {
    if (chip.disabled || event.pointerType === "mouse") {
      return;
    }
    startPointerDrag(event, chip);
  });
  chip.addEventListener("click", () => {
    if (chip.disabled) {
      return;
    }
    answerGrid.querySelectorAll(".drag-chip.selected").forEach((selected) => {
      selected.classList.remove("selected");
    });
    chip.classList.add("selected");
  });
  return chip;
}

function startPointerDrag(event, chip) {
  const value = chip.dataset.value;
  const ghost = chip.cloneNode(true);
  ghost.className = "drag-chip drag-ghost";
  ghost.style.left = `${event.clientX}px`;
  ghost.style.top = `${event.clientY}px`;
  document.body.append(ghost);
  chip.classList.add("dragging");

  const move = (moveEvent) => {
    ghost.style.left = `${moveEvent.clientX}px`;
    ghost.style.top = `${moveEvent.clientY}px`;
    const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest?.(".drop-zone");
    answerGrid.querySelectorAll(".drop-zone.drop-hover").forEach((zone) => zone.classList.remove("drop-hover"));
    if (target) {
      target.classList.add("drop-hover");
    }
  };

  const finish = (upEvent) => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", finish);
    const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest?.(".drop-zone");
    if (target) {
      moveChipToZone(value, target);
    }
    answerGrid.querySelectorAll(".drop-zone.drop-hover").forEach((zone) => zone.classList.remove("drop-hover"));
    chip.classList.remove("dragging");
    ghost.remove();
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", finish, { once: true });
}

function findDragChip(value) {
  return [...answerGrid.querySelectorAll(".drag-chip")]
    .find((chip) => chip.dataset.value === value);
}

function moveChipToZone(value, zone) {
  const chip = findDragChip(value);
  if (!chip || zone.classList.contains("disabled")) {
    return;
  }

  const existingValue = zone.dataset.value;
  const bank = answerGrid.querySelector(".drag-bank");
  if (existingValue) {
    const existingChip = findDragChip(existingValue);
    if (existingChip && bank) {
      existingChip.hidden = false;
      bank.append(existingChip);
    }
  }

  zone.dataset.value = value;
  zone.textContent = value;
  chip.hidden = true;
  chip.classList.remove("selected");
  zone.classList.add("filled");
}

function clearDropZone(zone) {
  const value = zone.dataset.value;
  const bank = answerGrid.querySelector(".drag-bank");
  if (!value || !bank || zone.classList.contains("disabled")) {
    return;
  }

  const chip = findDragChip(value);
  if (chip) {
    chip.hidden = false;
    bank.append(chip);
  }
  zone.dataset.value = "";
  zone.textContent = "Upuść tutaj";
  zone.classList.remove("filled");
}

function renderDragDropMatching(item) {
  answerGrid.className = "task-list drag-task";

  const bank = document.createElement("div");
  bank.className = "drag-bank";
  shuffle(item.options).forEach((option) => {
    bank.append(getDragChip(option));
  });

  const slots = document.createElement("div");
  slots.className = "drop-list";
  item.items.forEach((row, index) => {
    const line = document.createElement("div");
    line.className = "drop-row";
    const prompt = document.createElement("span");
    setFormattedText(prompt, row.prompt);
    const zone = document.createElement("div");
    zone.role = "button";
    zone.tabIndex = 0;
    zone.className = "drop-zone";
    zone.dataset.index = String(index);
    zone.dataset.value = "";
    zone.textContent = "Upuść tutaj";

    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      zone.classList.add("drop-hover");
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drop-hover");
    });
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("drop-hover");
      const value = event.dataTransfer.getData("text/plain");
      moveChipToZone(value, zone);
    });
    zone.addEventListener("click", () => {
      const selected = answerGrid.querySelector(".drag-chip.selected");
      if (selected) {
        moveChipToZone(selected.dataset.value, zone);
      } else {
        clearDropZone(zone);
      }
    });
    zone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        zone.click();
      }
    });

    line.append(prompt, zone);
    slots.append(line);
  });

  answerGrid.append(bank, slots);
  checkButton.hidden = false;
}

function renderTextInput(item) {
  answerGrid.className = "task-list";
  const label = document.createElement("label");
  label.className = "text-answer";
  label.innerHTML = "<span>Odpowiedź</span>";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = item.answerLabel || item.answer;
  input.autocomplete = "off";
  label.append(input);
  answerGrid.append(label);
  checkButton.hidden = false;
  input.focus();
}

function finalizeQuestionRender() {
  if (state.currentRecord?.answered) {
    restoreAnsweredView();
  }
  updateNavigationState();
}

function restoreAnsweredView() {
  answerGrid.querySelectorAll("button, input, select").forEach((control) => {
    control.disabled = true;
  });
  answerGrid.querySelectorAll(".answer-button").forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
  });
  checkButton.disabled = true;
  feedback.hidden = false;
  feedback.className = `feedback ${state.currentRecord.correct ? "good" : "bad"}`;
  feedback.textContent = state.currentRecord.correct
    ? "To pytanie było już ocenione jako poprawne. Użyj resetu odpowiedzi, jeśli chcesz podejść jeszcze raz."
    : "To pytanie było już ocenione jako błędne. Użyj resetu odpowiedzi, jeśli chcesz podejść jeszcze raz.";
}

function checkAnswer(selectedButton) {
  if (!state.currentRecord || state.currentRecord.answered) {
    return;
  }

  const buttons = [...answerGrid.querySelectorAll(".answer-button")];
  if (buttons.some((button) => button.disabled)) {
    return;
  }

  const isCorrect = selectedButton.dataset.correct === "true";
  scoreCurrentQuestion(isCorrect);

  buttons.forEach((button) => {
    button.disabled = true;
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
  });

  if (!isCorrect) {
    selectedButton.classList.add("wrong");
  }

  feedback.hidden = false;
  feedback.classList.add(isCorrect ? "good" : "bad");
  setFormattedText(
    feedback,
    isCorrect ? "Dobrze." : `Nie tym razem. Poprawna odpowiedź:\n${state.current.answer}`,
  );

  updateScore();
  updateNavigationState();
}

function normalizeInput(value) {
  return value.toLowerCase().replace(/\s+/g, "").replaceAll(",", ".");
}

function checkStructuredAnswer() {
  if (!state.currentRecord || state.currentRecord.answered) {
    return;
  }

  const item = state.current;
  let result;

  if (item.type === "trueFalse") {
    result = checkTrueFalse(item);
  } else if (item.type === "multiSelect") {
    result = checkMultiSelect(item);
  } else if (item.type === "matching") {
    result = checkMatching(item);
  } else if (item.type === "text") {
    result = checkText(item);
  } else {
    return;
  }

  if (!result.complete) {
    feedback.hidden = false;
    feedback.className = "feedback bad";
    feedback.textContent = "Uzupełnij wszystkie wymagane odpowiedzi.";
    return;
  }

  scoreCurrentQuestion(result.correct);

  checkButton.disabled = true;
  feedback.hidden = false;
  feedback.className = `feedback ${result.correct ? "good" : "bad"}`;
  setFormattedText(feedback, result.message);
  updateScore();
  updateNavigationState();
}

function scoreCurrentQuestion(isCorrect) {
  state.currentRecord.answered = true;
  state.currentRecord.correct = isCorrect;
  state.currentRecord.statApplied = true;
  state.answered += 1;
  if (isCorrect) {
    state.correct += 1;
  }

  if (state.mode === "finite" && state.currentIndex !== null && !state.currentRecord.removedFromPool) {
    state.remaining = state.remaining.filter((index) => index !== state.currentIndex);
    state.currentRecord.removedFromPool = true;
    updatePoolLabel();
  }

  if (state.currentIndex !== null) {
    updateQuestionStats(state.currentIndex, isCorrect);
    updatePoolLabel();
  }
}

function checkTrueFalse(item) {
  let complete = true;
  let correct = true;
  const rows = [...answerGrid.querySelectorAll(".tf-statement")];
  const details = [];

  item.items.forEach((row, index) => {
    const checked = answerGrid.querySelector(`input[name="tf-${item.id}-${index}"]:checked`);
    if (!checked) {
      complete = false;
      return;
    }
    const value = checked.value === "true";
    const rowCorrect = value === row.answer;
    correct = correct && rowCorrect;
    rows[index].classList.add(rowCorrect ? "row-correct" : "row-wrong");
    details.push({
      text: row.text,
      selected: value,
      answer: row.answer,
      correct: rowCorrect,
    });
  });

  if (complete) {
    answerGrid.querySelectorAll("input").forEach((input) => {
      input.disabled = true;
    });
  }

  const message = correct
    ? "Dobrze."
    : `Nie tym razem. Poprawny zestaw:\n${details.map((row) => `${row.text}\nTwoja: ${row.selected ? "Prawda" : "Fałsz"} | Poprawna: ${row.answer ? "Prawda" : "Fałsz"}`).join("\n\n")}`;
  return { complete, correct, message };
}

function checkMultiSelect(item) {
  const inputs = [...answerGrid.querySelectorAll('input[type="checkbox"]')];
  const selectedAny = inputs.some((input) => input.checked);
  if (!selectedAny) {
    return { complete: false, correct: false, message: "" };
  }

  let correct = true;
  inputs.forEach((input) => {
    const row = item.items[Number(input.dataset.index)];
    const rowCorrect = input.checked === row.correct;
    correct = correct && rowCorrect;
    const choice = input.closest(".choice-control");
    if (input.checked && row.correct) {
      choice.classList.add("row-correct");
    } else if (input.checked || row.correct) {
      choice.classList.add("row-wrong");
    }
    input.disabled = true;
  });
  const message = correct
    ? "Dobrze."
    : `Nie tym razem. Poprawne odpowiedzi:\n${item.items.filter((row) => row.correct).map((row) => row.text).join("\n")}`;
  return { complete: selectedAny, correct, message };
}

function checkMatching(item) {
  let complete = true;
  let correct = true;
  const zones = [...answerGrid.querySelectorAll(".drop-zone")];

  if (zones.length) {
    zones.forEach((zone) => {
      const row = item.items[Number(zone.dataset.index)];
      const value = zone.dataset.value;
      if (!value) {
        complete = false;
        return;
      }
      const rowCorrect = value === row.answer;
      correct = correct && rowCorrect;
      zone.closest(".drop-row").classList.add(rowCorrect ? "row-correct" : "row-wrong");
    });

    if (complete) {
      answerGrid.querySelectorAll(".drag-chip, .drop-zone").forEach((control) => {
        if (control.classList.contains("drag-chip")) {
          control.disabled = true;
          control.draggable = false;
        } else {
          control.classList.add("disabled");
          control.setAttribute("aria-disabled", "true");
        }
      });
    }

    const message = correct
      ? "Dobrze."
      : `Nie tym razem. Poprawne dopasowanie:\n${item.items.map((row) => `${row.prompt} -> ${row.answer}`).join("\n")}`;
    return { complete, correct, message };
  }

  const selects = [...answerGrid.querySelectorAll("select")];

  selects.forEach((select) => {
    const row = item.items[Number(select.dataset.index)];
    if (!select.value) {
      complete = false;
      return;
    }
    const rowCorrect = select.value === row.answer;
    correct = correct && rowCorrect;
    select.closest(".matching-row").classList.add(rowCorrect ? "row-correct" : "row-wrong");
  });

  if (complete) {
    selects.forEach((select) => {
      select.disabled = true;
    });
  }

  const message = correct
    ? "Dobrze."
    : `Nie tym razem. Poprawne dopasowanie:\n${item.items.map((row) => `${row.prompt} -> ${row.answer}`).join("\n")}`;
  return { complete, correct, message };
}

function checkText(item) {
  const input = answerGrid.querySelector("input");
  const value = normalizeInput(input.value);
  if (!value) {
    return { complete: false, correct: false, message: "" };
  }

  const accepted = item.accepted.map(normalizeInput);
  const correct = accepted.includes(value);
  input.disabled = true;
  input.closest(".text-answer").classList.add(correct ? "row-correct" : "row-wrong");
  return {
    complete: Boolean(value),
    correct,
    message: correct ? "Dobrze." : `Nie tym razem. Poprawna odpowiedź: ${item.answerLabel || item.answer}`,
  };
}

function updateScore() {
  answered.textContent = String(state.answered);
  const percent = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
  accuracy.textContent = `${percent}%`;
}

function updatePoolLabel() {
  if (state.mode === "finite") {
    poolSize.textContent = `${state.remaining.length} pytań zostało`;
  } else if (state.mode === "worst") {
    const count = getWorstIndexes().length;
    poolSize.textContent = `${count} pytań z błędami`;
  } else {
    poolSize.textContent = `${data.length} pytań w puli`;
  }
}

function updateNavigationState() {
  previousButton.disabled = state.history.length === 0;
  resetAnswerButton.disabled = !state.current;
  nextButton.disabled = state.mode === "finite" && state.remaining.length === 0 && state.currentRecord?.answered;
  endlessMode.classList.toggle("active", state.mode === "endless");
  finiteMode.classList.toggle("active", state.mode === "finite");
  worstMode.classList.toggle("active", state.mode === "worst");
  normalDifficulty.classList.toggle("active", state.difficulty === "normal");
  hardDifficulty.classList.toggle("active", state.difficulty === "hard");
}

function resetScore() {
  if (!data.length) {
    return;
  }

  state.answered = 0;
  state.correct = 0;
  state.history = [];
  resetPools();
  updateScore();
  drawQuestion({ pushHistory: false });
}

function resetCurrentAnswer() {
  if (!state.current || !state.currentRecord) {
    return;
  }

  if (state.currentRecord.answered) {
    state.answered = Math.max(0, state.answered - 1);
    if (state.currentRecord.correct) {
      state.correct = Math.max(0, state.correct - 1);
    }

    if (state.currentRecord.statApplied && state.currentIndex !== null) {
      revertQuestionStats(state.currentIndex, state.currentRecord.correct);
      state.currentRecord.statApplied = false;
    }

    if (state.mode === "finite" && state.currentRecord.removedFromPool && state.currentIndex !== null) {
      if (!state.remaining.includes(state.currentIndex)) {
        state.remaining.push(state.currentIndex);
      }
      state.currentRecord.removedFromPool = false;
    }
  }

  updateScore();
  drawQuestion({ pushHistory: false, index: state.currentIndex });
}

function goToPreviousQuestion() {
  const previous = state.history.pop();
  if (!previous) {
    updateNavigationState();
    return;
  }

  drawQuestion({ pushHistory: false, index: previous.index, record: previous.record });
}

function setMode(mode) {
  if (state.mode === mode) {
    return;
  }

  state.mode = mode;
  if (!data.length) {
    updateNavigationState();
    return;
  }

  state.answered = 0;
  state.correct = 0;
  state.history = [];
  resetPools();
  updateScore();
  drawQuestion({ pushHistory: false });
}

function setDifficulty(difficulty) {
  if (state.difficulty === difficulty) {
    return;
  }

  state.difficulty = difficulty;
  if (state.currentIndex !== null) {
    drawQuestion({ pushHistory: false, index: state.currentIndex, record: state.currentRecord });
  } else {
    updateNavigationState();
  }
}

async function handlePdfImport(event) {
  const file = event.target?.files?.[0] || event;
  if (!file) {
    return;
  }

  useImportedQuiz.disabled = true;
  exportImportedQuiz.disabled = true;
  importPreview.hidden = true;
  importPreview.innerHTML = "";
  setImportStatus(`Czytam PDF: ${file.name}...`);

  try {
    const pdfData = await extractPdfData(file);
    const report = parseImportedQuizData(pdfData, file.name);
    importedReport = report;
    importedQuiz = report.questions;
    renderImportPreview(report);

    if (!report.questions.length) {
      setImportStatus("Nie znalazłem pytań z odpowiedziami. Ten PDF może być skanem albo mieć nietypowy układ, którego importer jeszcze nie rozpoznaje.", true);
      return;
    }

    setImportStatus(`Gotowe: ${report.questions.length} pytań z ${report.extractedCandidates} wykrytych kandydatów.`);
    useImportedQuiz.disabled = false;
    exportImportedQuiz.disabled = false;
  } catch (error) {
    importedReport = null;
    importedQuiz = null;
    setImportStatus(error.message || "Nie udało się przetworzyć PDF-a.", true);
  }
}

function useImportedQuestions() {
  if (!importedQuiz?.length) {
    return;
  }

  importCounter += 1;
  const title = importedReport?.fileName?.replace(/\.pdf$/i, "") || `Import ${importCounter}`;
  const entry = {
    id: `import-${Date.now()}-${importCounter}`,
    title,
    badge: "Własny import",
    description: `Zestaw wygenerowany z pliku ${importedReport?.fileName || "PDF"}.`,
    questions: [...importedQuiz],
  };
  quizCatalog.push(entry);
  renderQuizLibrary();
  setImportStatus(`Dodano zestaw: ${getQuizStatsLabel(entry.questions)}.`);
  selectQuiz(entry.id);
}

function exportImportedQuestions() {
  if (!importedReport?.questions?.length) {
    return;
  }

  const payload = {
    source: importedReport.fileName,
    count: importedReport.questions.length,
    questions: importedReport.questions,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${importedReport.fileName.replace(/\.pdf$/i, "") || "quiz"}-quiz.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function handlePdfDrop(event) {
  event.preventDefault();
  fileDrop.classList.remove("drag-over");
  const file = [...event.dataTransfer.files].find((item) => item.type === "application/pdf" || item.name.toLowerCase().endsWith(".pdf"));
  if (file) {
    handlePdfImport(file);
  }
}

nextButton.addEventListener("click", drawQuestion);
resetButton.addEventListener("click", resetScore);
checkButton.addEventListener("click", checkStructuredAnswer);
previousButton.addEventListener("click", goToPreviousQuestion);
resetAnswerButton.addEventListener("click", resetCurrentAnswer);
endlessMode.addEventListener("click", () => setMode("endless"));
finiteMode.addEventListener("click", () => setMode("finite"));
worstMode.addEventListener("click", () => setMode("worst"));
normalDifficulty.addEventListener("click", () => setDifficulty("normal"));
hardDifficulty.addEventListener("click", () => setDifficulty("hard"));
pdfInput.addEventListener("change", handlePdfImport);
fileDrop.addEventListener("dragover", (event) => {
  event.preventDefault();
  fileDrop.classList.add("drag-over");
});
fileDrop.addEventListener("dragleave", () => fileDrop.classList.remove("drag-over"));
fileDrop.addEventListener("drop", handlePdfDrop);
useImportedQuiz.addEventListener("click", useImportedQuestions);
exportImportedQuiz.addEventListener("click", exportImportedQuestions);
chooseQuizButton.addEventListener("click", showLibrary);

state.stats = loadStats();
renderQuizLibrary();
updateScore();
updateNavigationState();
showLibrary();
