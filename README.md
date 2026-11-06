# SENSUS – Bliżej Siebie

Strona z ćwiczeniami oddechowymi i narzędziami do pracy ze sobą dla SENSUS.
Strona: https://odnajdzspokoj.com (Cloudflare Pages, wdrażana automatycznie z gałęzi `main`). Statyczna strona bez etapu budowania.

## Co jest w środku

- **Oddech**: techniki z poradnika SENSUS (podwójne westchnienie, dłuższy wydech, oddech przed trudną rozmową, pudełkowy, 4-7-8) z animacją rytmu, liczeniem powtórzeń i tłem dźwiękowym generowanym w przeglądarce.
- **Medytacje i sceny natury**: wieczorne wyciszenie z napisami (włącz/wyłącz) i wyłącznikiem czasowym; 8 scen do wyboru (deszcz, burza, rzeka, strumień, ptaki w lesie, ognisko, noc i świerszcze, jezioro) z animowanym tłem i pasującym dźwiękiem. Te same sceny można włączyć w ćwiczeniach oddechowych.
- **Narzędzia**: uziemienie 5-4-3-2-1, technika STOP, motylek, strząśnij napięcie, jeden mały krok, dziennik myśli.
- **Czy to już za dużo?**: sygnały przeciążenia z podpowiedziami ćwiczeń.
- **Wyzwanie 14 dni**: postęp zapisywany lokalnie w przeglądarce (bez logowania i bez cookies).
- **Wsparcie**: oferta SENSUS, kontakt, informacje o bezpieczeństwie i telefony wsparcia w kryzysie.

## Pliki

- `index.html` – cała strona
- `assets/` – logo i ikony
- `assets/scenes.js` – sceny natury (filmy, animacje zapasowe i dźwięki)
- `assets/scenes/` – zapętlone filmy scen (720p, bez dźwięku) i ich kadry startowe
- `manifest.webmanifest` – pozwala dodać stronę do ekranu głównego telefonu

Ćwiczenia są zapisane jako dane (`TECH` i `TOOLS` w `index.html`), więc nową technikę dodaje się jednym wpisem.

© 2026 SENSUS. Wszelkie prawa zastrzeżone.
