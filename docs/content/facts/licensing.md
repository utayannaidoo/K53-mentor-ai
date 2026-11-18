# Fact base — Learner's licence conditions and the eye test

Verified 18 November 2026 for the guides `learners-licence-eye-test` and
`learner-driver-freeway-rules`. Sources in the ranking this folder uses: the Act and its
regulations first, then government service pages, then the Motus manual and research.

- **[REG 99]** National Road Traffic Regulations, reg 99 (categories of learner's licence),
  <https://source.acts.co.za/national-road-traffic-act-1996/r225_99__categories_of_learner.php>
- **[REG 102]** reg 102 (eyesight standard), as reproduced by the Optometric Association of
  South Africa, <http://oasa.org.za/Regulation102.php>. The full table is also in
  `motus-manual-11ed.md` §6.
- **[GOV-LL]** gov.za, *Apply for a learner's licence*,
  <https://www.gov.za/services/driving-licence/apply-learners-licence>
- **[GOV-RN]** gov.za, *Renew driving licence*,
  <https://www.gov.za/services/driving-licence/renew-driving-licence>
- **[KZN-RN]** KwaZulu-Natal Department of Transport, licence renewal,
  <http://www.kzntransport.gov.za/licencing/licences/licence_renewal.htm>
- **[TAMENTI]** Tamenti et al., "Stakeholder perspectives on vision screening for drivers in
  Gauteng", *Health SA Gesondheid* (2025), <https://pmc.ncbi.nlm.nih.gov/articles/PMC11886461/>.
  Interviews with 15 managers and 15 examiners at 15 Gauteng DLTCs, August–October 2021.
- **[MOTUS]** *Official Motus Learner's and Driver's Manual*, 11th ed. (see `motus-manual-11ed.md`).

## Learner's licence conditions

- A learner's licence holder must drive under the **direct personal supervision** of a person
  **seated next to them**, or immediately behind them where that isn't possible, who holds a
  licence — other than a learner's or similar licence — for that class of vehicle [REG 99(2)].
- The supervision requirement does **not** apply to a vehicle with no passenger seating or to a
  **motorcycle** [REG 99(2)].
- A motorcycle learner's licence does not allow carrying **another person** on a public road
  [REG 99(2)].
- A learner's licence does not allow carrying **persons for reward**, other than the supervisor
  [REG 99(2)].
- Reg 99 sets **no restriction on which public roads** a learner may use — freeways included.
  The freeway regulation (reg 323, in `rules.md`) doesn't list learners either. Motus says
  outright that a learner may drive on a freeway when accompanied by a holder of a valid
  licence of the same category [MOTUS p.64].
- Valid for **24 months** and **cannot be extended** [GOV-LL].
- If the vehicle needs a professional driving permit, the supervisor must hold one too [GOV-LL].

## The eye test — when and who

- The eye test is part of the **learner's licence application**, done at the testing centre —
  or you may have it done by a **qualified optometrist** and submit the form at the centre
  [GOV-LL]. It is not one of the 64 test questions.
- It is repeated at every **driving licence card renewal**: "you will undergo eye testing and
  your fingerprints will be taken" — or an optometrist's report can be submitted instead
  [GOV-RN]. KZN recommends an optometrist's test **not older than 3 months**; that is a
  provincial recommendation, so confirm with the centre [KZN-RN].
- A driving licence card is valid for **five years** from its date of issue [KZN-RN].
- Screening at the DLTC is done on a machine (older centres used Snellen charts, then the
  Orthorator; current units are the Live Capture Unit and Live Enrolment Unit), which displays
  an **"illiterate E"** [TAMENTI]. Motus calls it the tumbling-E optotype: a capital E turned to
  face different ways, so the reader reports direction, not a letter [MOTUS p.96]. The app's own
  research for `src/lib/vision/acuity.ts` records that the DLTC tests **each eye on its own and
  both together**.
- Gauteng DLTC staff reported screening machines **offline**, sometimes for two to three days
  (network faults, fibre theft, power cuts) [TAMENTI]. Participant reports, not measured
  downtime — say "staff reported", never quote a rate.

## The standard (regulation 102)

| Codes | Acuity, with or without correction | Field of vision |
|---|---|---|
| A1, A, B, EB | **6/12 in each eye** — or, where one eye is under 6/12 or blind, **6/9 in the other** | 70° temporal in each eye; or, where one eye is under 70° or blind, 115° total horizontal |
| C1, C, EC1, EC | **6/9 in each eye** — no one-eye alternative | 70° temporal in each eye |

[REG 102; cross-checked against TAMENTI]

- Codes C1/C/EC1/EC are the heavy codes taught as Code 10 and Code 14
  (`which-licence-code-8-10-14` guide).
- **Worked examples** (derived directly from the table):
  - 6/12 left, 6/36 right → **fails** codes A1/A/B/EB. The right eye is under 6/12, so the left
    must reach 6/9, and 6/12 doesn't. This is the case the widely repeated "6/12 in one eye"
    wording gets wrong.
  - 6/6 left, 6/36 right → **passes** codes A1/A/B/EB: the left eye clears 6/9. Fails the heavy
    codes, which need 6/9 in each eye.
  - 6/12 in both eyes → passes codes A1/A/B/EB, fails the heavy codes.
- Snellen notation: on the Motus chart 6/6 is 0% acuity loss, 6/12 is 15%, 6/60 is 80% — the
  larger the second number, the weaker the eye [MOTUS p.96].
- "With or without refractive correction" — glasses or contact lenses count [REG 102].
- In South Africa the only vision-related licence restriction is for **spectacles or contact
  lenses** [TAMENTI].
- A person who fails the standard may, **at their own expense**, be tested by a **registered
  optometrist or ophthalmologist**; the centre must accept that result if it accurately states
  the Snellen acuity and the field in degrees. If the result is still below the standard, the
  centre may not issue a licence **for the code applied for** [REG 102].
- When a driver is found visually unfit, managers described the licence code being
  **downgraded** rather than the person being refused outright, where they consent [TAMENTI].
- The minimum vision requirements have **not been revised since 1998** [TAMENTI]. Reg 102
  replaced the earlier reg 241 [REG 102].
