# Christmas App Store listing and review notes draft

**Draft for the proposed free-only release.** Use this copy when the owner approves the C0 scope, the editor accepts both café visits and all listed material, and the signed candidate delivers the same content and routes. Confirm the final screen labels against that build.

## Store listing

### English (U.S.)

**Name**

Colombian Spanish

**Subtitle**

Café visits and flashcards

**Promotional text**

Order a coffee in a guided café visit, then come back to ask for water. Review 61 free cards for everyday Spanish in Colombia.

**Description**

Start with a morning greeting at Ana’s café. Type a polite order, choose what to say when coffee is unavailable, and thank Ana. Finish Breakfast at Ana’s café to open Back at Ana’s café, where you’ll ask for water and confirm your order.

The free starter collection includes 61 flashcards in four decks: 13 greetings, 32 food and drink words, 15 travel words, and one conversation phrase, “Gracias.”

Reveal English meanings, review cards on a schedule based on how well you remember them, and try short recognition quizzes. Save phrases you want to revisit or create your own cards. The starter cards include generated pronunciation audio.

Use the app in English or Spanish on iPhone or iPad.

**Keywords**

`language,beginner,vocabulary,travel,greetings,coffee,practice,quiz,pronunciation`

### Español

**Nombre**

Colombian Spanish

**Subtítulo**

Frases y tarjetas de repaso

**Texto promocional**

Pide un café en una visita guiada y vuelve para pedir agua. Repasa 61 tarjetas gratis de español cotidiano de Colombia.

**Descripción**

Empieza con un saludo en la cafetería de Ana. Escribe un pedido cortés, elige qué decir si se acabó el café y dale las gracias a Ana. Completa Desayuno en la cafetería de Ana para abrir De vuelta en la cafetería de Ana, donde podrás pedir agua y confirmar tu pedido.

La colección gratuita incluye 61 tarjetas en cuatro grupos: 13 saludos, 32 palabras de comida y bebida, 15 palabras de viaje y una frase de conversación, «Gracias».

Revela los significados en inglés, repasa las tarjetas según qué tan bien las recuerdes y prueba cuestionarios breves de reconocimiento. Guarda las frases que quieras repasar o crea tus propias tarjetas. Las tarjetas iniciales incluyen audio generado para practicar la pronunciación.

Usa la aplicación en inglés o en español en iPhone o iPad.

**Palabras clave**

`idioma,principiantes,vocabulario,viajes,saludos,café,práctica,cuestionario`

### URLs for both localizations

- [Support URL candidate](https://colibricodellc.com/#contact)
- [Privacy policy URL candidate](https://colibricodellc.com/privacy-policy/#colombian-spanish)

The two public pages responded and contained the expected sections on November 25, 2026. Confirm that the support page serves both localizations and that the privacy policy and store disclosures match the signed build’s actual use of RevenueCat, diagnostics, and Expo Updates.

Use Apple’s Spanish (Mexico) localization for the Spanish draft if the owner selects the Colombia storefront. Apple lists it as Colombia’s default and an additional U.S. storefront language. [Apple’s storefront localizations](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/)

## App Review notes

App Store Connect provides one Notes field for the version. The Spanish text below is an alternate translation.

### English

Colombian Spanish offers a free starter collection and two guided café visits. A fresh install can open the learning flow without an account or payment.

1. Launch the app and choose English or Español. Follow the first-practice prompt to Breakfast at Ana’s café. From Home, open the café visit entry and select the same title.
2. In the visit, type “Buenos días” and “Un café, por favor” when prompted. Choose the offered water when coffee is unavailable, then type “Gracias” to finish.
3. Return to the café visits and open Back at Ana’s café after completing the first visit. Type a greeting and “Agua, por favor,” confirm the water order, and thank Ana.
4. Open Study to review the starter flashcards. The fresh-install catalogue contains 61 bundled cards across Greetings, Food and Drink, Travel, and Conversation Phrases. The café exercises use typed responses and on-screen choices. Pronunciation playback on the starter cards uses generated audio.

### Español

Colombian Spanish ofrece una colección inicial gratuita y dos visitas guiadas a una cafetería. En una instalación nueva, puedes empezar a practicar sin abrir una cuenta ni pagar.

1. Abre la aplicación y elige Español o English. Sigue la invitación inicial hasta Desayuno en la cafetería de Ana. Desde Inicio, abre la sección de visitas a la cafetería y selecciona ese mismo título.
2. Cuando se te indique, escribe «Buenos días» y «Un café, por favor». Si se acabó el café, elige el agua que te ofrecen. Luego escribe «Gracias» para terminar.
3. Después de completar la primera visita, vuelve a la sección y abre De vuelta en la cafetería de Ana. Escribe un saludo y «Agua, por favor», confirma el pedido de agua y dale las gracias a Ana.
4. Abre Estudiar para repasar las tarjetas iniciales. Una instalación nueva incluye 61 tarjetas distribuidas en Saludos, Comida y Bebida, Viajes y Frases de Conversación. En las visitas escribirás respuestas o elegirás una opción en pantalla. El audio de pronunciación de las tarjetas iniciales es generado.

## Release sign-off

- **Scope and editorial.** The proposed [C0 inventory](../editorial/christmas-c0-candidate.json) includes Breakfast at Ana’s café v2 (`first-morning-medellin`) and Back at Ana’s café v1 (`back-at-anas-cafe`), in that order. The free visit dependency set is `0010` (buenos días), `0024` (café), `0025` (agua), and `1148` (Gracias). Freeze the exact content and confirm human acceptance of both visit versions, all 61 cards, both listing locales, every listed pronunciation clip, and distribution rights for the clips, voices and artwork.
- **Signed candidate.** Verify the free path on a fresh install in both languages, the unlock rule for the second visit, and learner-data and existing-access behavior after upgrading. Confirm that the exact candidate’s first-use and audio behavior match the listing. Rework the copy if any visit, deck, or clip leaves the accepted scope.
- **Store setup.** Confirm the marketing version, build, store name, availability, Spanish storefront localization, age rating, content rights, privacy disclosures, support URLs and the App Review contact. Use the localized screenshots from the accepted iPhone and iPad builds. Add a localized What’s New field if App Store Connect requires it for this version. Keep manual release control and obtain owner approval for submission. [Apple’s platform version fields](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/) · [Apple’s app and compliance fields](https://developer.apple.com/help/app-store-connect/reference/app-information/app-and-compliance-information/)
