## 1. **Plugin Teams (many) – Stream-Aligned**

* **Nature**: Each plugin is its own vertical slice of business capability (e.g., LibraryPanel, ControlPanel, Canvas UI, analytics plugin, etc.).
* **Structure**: Small 2–6 person teams. Could be 1 team per “family” of plugins if they’re related.
* **Focus**:

  * Develop orchestration logic (sequences/movements/beats).
  * Provide plugin UI panels (React exports for slots).
  * Own CI/CD pipelines for their plugin.
* **Topology fit**: **Stream-aligned** (aligned to business feature streams).

---

## 2. **Host SDK Team – Platform Team**

* **Nature**: They build the “gateway” SDK that plugins depend on.
* **Structure**: Platform-minded engineers who focus on developer experience, APIs, docs, and runtime guardrails.
* **Focus**:

  * Maintain the SDK as the stable API surface.
  * Work closely with plugin teams (inner platform model).
  * Enforce CIA/SPA contracts and Valence validations.
* **Topology fit**: **Platform team**, supporting all plugin teams by abstracting complexity.

---

## 3. **Thin Host Team – Enabling / E2E Testing**

* **Nature**: They own the thin shell (slots, manifest loader, fallbacks).
* **Structure**: Fewer devs, more **E2E test engineers** with orchestration knowledge.
* **Focus**:

  * Own end-to-end testing harness (Playwright, Cypress, etc.).
  * Ensure plugins integrate cleanly via manifest.
  * Maintain fallback panels for legacy.
* **Topology fit**: Hybrid of **Enabling team** (helps plugins succeed in E2E integration) and **Ops-like** test specialists.

---

## 4. **Components Team – UX/UI Designers + Frontend Specialists**

* **Nature**: Custodians of the **RenderX design system**.
* **Structure**: Cross-functional (designers + FE engineers).
* **Focus**:

  * Build & maintain core component library (buttons, forms, cards, etc.).
  * Define UX flows and styling guidelines.
  * Provide reusable components for plugin teams.
* **Topology fit**: **Complicated Subsystem** team (deep UI/UX expertise not every team needs).

---

## 5. **Conductor / Orchestration Core Team – Complicated Subsystem**

* **Nature**: Specialists maintaining the **MusicalConductor** core (sequences, beats, SPA/CIA guardrails).
* **Focus**:

  * Sequence engine scalability (timing, resource management).
  * Maintain the SPAValidator & runtime guardrails.
  * Work with Host SDK team to ensure stable API contracts.
* **Topology fit**: **Complicated Subsystem team** (requires deep orchestration/algorithm knowledge).

---

## 6. **Valence / Architecture Governance Team – Enabling**

* **Nature**: They don’t build features but enforce structure.
* **Focus**:

  * Maintain validators & profiles (sequence-required-fields, import rules, etc.).
  * Work with plugin teams to codify rules.
  * Provide automation in CI/CD pipelines.
* **Topology fit**: **Enabling team** (helps other teams improve architecture without owning streams).

---

## 7. **Product Integration / Solution Teams**

* **Nature**: Business-facing integrators who assemble multiple plugins + host into actual solutions.
* **Focus**:

  * Assemble plugin bundles for business use cases.
  * Coordinate release trains across plugin teams.
  * Own product demos, adoption, customer-facing rollout.
* **Topology fit**: **Stream-aligned** but at a higher aggregation level.
