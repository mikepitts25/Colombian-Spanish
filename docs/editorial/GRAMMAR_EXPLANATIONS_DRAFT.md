# Short grammar notes — editorial draft

Status: AI preparation for B04.4, version1, 2026-10-18. These are proposed bilingual explanations attached to exact existing teaching phrases, not accepted content or an implemented feature. No app strings, answer variants, mission versions, release ledger or learning events change. The owner/editor still selects the pilot scope and accepts the actual language; these four notes are a review candidate, not a new curriculum.

## Candidate notes

### G01 — A short request

Attachment: [First Morning](../../src/missions/firstMorning.ts), mission `first-morning-medellin` version1, node `request`, exercise `morning-coffee` version1. Existing accepted-answer list in this **draft pack**: `Un café, por favor` and `Quisiera un café, por favor`. An engine answer list is not editorial acceptance.

English draft: “For this request, you can name what you want: «Un café, por favor». The longer option in this exercise is «Quisiera un café, por favor». Learn the whole phrase first; you do not need to conjugate a new verb to make this request.”

Spanish draft: “Para esta petición puedes nombrar lo que quieres: «Un café, por favor». La opción más larga de este ejercicio es «Quisiera un café, por favor». Aprende primero la frase completa; no necesitas conjugar otro verbo para hacer esta petición.”

Editor checks: Is each option natural for the selected interaction and register? Does the English explain the intended force without making one wording obligatory or promising politeness regardless of tone/context? Keep the two answer strings unchanged unless the pack is deliberately revised and re-reviewed. This note teaches a usable chunk, not a full account of subjunctive tense or all ways to order.

### G02 — Asking how someone is

Attachment: [Conversation deck](../../src/data/decks/conversation.ts), deck `deck-conversation`, card `1100`, front `¿Cómo estás?`, meaning `How are you?`.

English draft: “«¿Cómo estás?» asks how the other person is. In this question, «cómo» has an accent. Write both question marks: «¿» at the start and «?» at the end.”

Spanish draft: “«¿Cómo estás?» pregunta cómo está la otra persona. En esta pregunta, «cómo» lleva tilde. Escribe los dos signos de interrogación: «¿» al principio y «?» al final.”

Editor checks: Confirm beginner wording, the greeting's context and any link to the pronoun note below. Keep the punctuation explanation separate from the exercise's actual normalization rules: the [current production engine](../../src/exercises/production.ts) tolerates outer sentence punctuation, but preserves accents/internal punctuation. A grammar note must not imply that a tolerant answer matcher teaches an alternative spelling. RAE/ASALE describes interrogative [cómo](https://www.rae.es/dpd/c%C3%B3mo) and paired [question signs](https://www.rae.es/dpd/signos%20de%20interrogaci%C3%B3n%20y%20exclamaci%C3%B3n); these references support the narrow spelling claims, not pilot or regional acceptance.

### G03 — Keeping the form of address consistent

Attachment: the same existing `deck-conversation` / `1100` phrase `¿Cómo estás?`. This note may follow G02; it does not add a second assessment or event.

English draft: “«Estás» is the form used with «tú» here, even when «tú» is not written. A version with «usted» is «¿Cómo está usted?». Keep the address form and verb together. Which form fits the relationship needs context; do not choose it from a country label alone.”

Spanish draft: “Aquí «estás» es la forma que corresponde a «tú», aunque no aparezca escrito. Una versión con «usted» es «¿Cómo está usted?». Mantén la concordancia entre el tratamiento y el verbo. La elección depende del contexto y de la relación; no basta con mirar el nombre de un país.”

Editor checks: The usted sentence is a **proposed contrast**, not an existing new card, accepted answer or release addition. Confirm whether that contrast belongs in the pilot at all. Review Colombian relationship/region/age context explicitly, including familiar uses of usted and local tú/vos choices; do not label usted universally distant or formal, or present a single national rule. No vos conjugation is generated from a missing tú table. RAE/ASALE [usted](https://www.rae.es/dpd/usted) supports third-person grammatical agreement when addressing the listener; it does not establish the chosen café relationship or local preference. Actual pronoun/verb acceptance remains an editor decision.

### G04 — One completed past event

Attachment: [Conversation deck](../../src/data/decks/conversation.ts), deck `deck-conversation`, card `1165`, front `Me olvidé`, meaning `I forgot`, exact example `Me olvidé de llamarte ayer. | I forgot to call you yesterday.`

English draft: “«Me olvidé de llamarte ayer» means «I forgot to call you yesterday». Here «olvidé» describes a completed past event and has an accent on «é». Learn «me olvidé de» with the action that follows: «llamarte» means «to call you» in this example.”

Spanish draft: “«Me olvidé de llamarte ayer» cuenta algo que ocurrió en el pasado. Aquí «olvidé» lleva tilde en la «é». Aprende «me olvidé de» junto con la acción que sigue: en este ejemplo, «llamarte» significa hacerte una llamada.”

Editor checks: Confirm tense/translation, beginner readability and the relationship implied by «te». This is one example, not a rule that all past events take this tense or that all uses of olvidar require «me» and «de». RAE/ASALE [olvidar(se)](https://www.rae.es/dpd/olvidar) distinguishes the pronominal construction with de from other valid constructions. Do not reject those other constructions merely because this note focuses on one phrase. This past-event card is outside the current café mission; owner/editor must select it for the pilot or defer it. No new mission step is proposed.

## Acceptance and integration handoff

For each G01–G04, the qualified reviewer supplies an actual accept/correct/defer decision, exact final bilingual text, source phrase/version identity, intended audience/context, attribution and date. Blank acceptance is not approval. Record which contrast/example is accepted too; accepting the attached card does not automatically accept a new note. Recheck source hashes below before applying decisions. Changed source text invalidates this attachment review until reconciled.

AI can apply supplied corrections, prepare version-bound content records and validation, implement the agreed display, and verify bilingual large-text/hint/retry/offline behavior. The display must have its own focused design review before runtime work: choose when the note is shown, preserve optional help, and record assistance if a note reveals an assessed answer before an attempt. Reading an explanation alone must not create a recall, listening or speaking result. No reward, grammar mastery or new scheduling credit follows merely from opening a note.

Do not silently replace the current mission explanation fields: `ProductionExercise.explanation` is currently a single string, while mission correction/prompt text is localized. The later implementation must deliberately choose the existing appropriate surface or a reviewed bilingual contract; this packet defines no new runtime schema or migration. Production release/content validation still follows [the release workflow](RELEASE_WORKFLOW.md), including review of non-card grammar, and cannot be inferred from card fingerprints or cited references alone.

Recommended future bundles: (1) actual editorial decisions and selected attachments; (2) reviewed bilingual display/help contract and implementation; (3) automated answer/event/version checks plus available iOS/Android and separately signed/physical accessibility acceptance. Source verification and formatting validate this packet's preparation only. Learner understanding/usefulness belongs to the pilot, not a source-link check.

## Source snapshot

Whole-file SHA256 at preparation, base `1b9762f` (these are source snapshots, not new release-content acceptance fingerprints):

- `src/missions/firstMorning.ts`: `41abf47a381bec5b0097aaa9880e57c865c2d45c27f965b17a14296bd98b0982`

- `src/data/decks/conversation.ts`: `4d379adce0a296d651bcc6cf54c84c05f60adbb8b28b9ff599e1c2dfd08ccff2`

- `src/exercises/production.ts`: `8967d8c1c4cf3556362e387f2a0571f04082eb683a447fb96016cade74b8bce6`
