# Quiz ML

Statyczna aplikacja do nauki z quizem ML oraz importerem PDF w przeglądarce.

## Funkcje

- tryby: Nieskończony, Bez powtórek, Najgorsze,
- trudność odpowiedzi: Normal i Hard,
- pytania ABCD, Prawda/Fałsz, tekstowe, dopasowania oraz drag and drop dla 2.16,
- importer PDF oparty o `pdf.js`,
- eksport zaimportowanych pytań do JSON.

## Import PDF

Importer działa w przeglądarce. Najlepiej rozpoznaje PDF-y, w których pytania i odpowiedzi mają czytelny tekst, np.:

```text
1.1 Treść pytania
A. Odpowiedź pierwsza
B. Odpowiedź druga
C. Odpowiedź trzecia
D. Odpowiedź czwarta
Odpowiedź: B
```

Obsługiwane są też pytania typu Prawda/Fałsz oraz pytania otwarte z linią `Odpowiedź: ...`.

## Netlify

Repo zawiera `netlify.toml`. Netlify powinno publikować folder:

```text
outputs/quiz-app
```

