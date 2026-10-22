<script setup lang="ts">
import SpiritText from '~/shared/SpiritText.vue';
import type { Adversary } from '~/types/domain';

defineProps<{ adversary: Adversary; level: number }>();
</script>

<template>
  <article class="community-sheet" aria-label="Full community adversary card">
    <header class="sheet-header">
      <p class="sheet-eyebrow">Spirit Island · Community adversary</p>
      <h2>{{ adversary.name }}</h2>
      <div class="sheet-byline">
        <span>By {{ adversary.creator }}</span>
        <span>Base difficulty {{ adversary.difficulty }}</span>
      </div>
    </header>

    <div class="sheet-foundation">
      <section v-if="adversary.lossCondition" class="sheet-rule sheet-loss">
        <h3>Additional loss condition</h3>
        <p>
          <strong>{{ adversary.lossCondition.title }}.</strong>{{ ' ' }}
          <SpiritText :text="adversary.lossCondition.description" />
        </p>
      </section>
      <section class="sheet-rule sheet-escalation">
        <h3>Escalation</h3>
        <p>
          <strong>{{ adversary.escalationAbility.title }}.</strong>{{ ' ' }}
          <SpiritText :text="adversary.escalationAbility.description" />
        </p>
      </section>
      <section v-for="rule in adversary.specialRules ?? []" :key="rule.title" class="sheet-rule">
        <h3>Special rule · {{ rule.title }}</h3>
        <p><SpiritText :text="rule.description" /></p>
      </section>
    </div>

    <div class="sheet-level-heading">
      <h3>Adversary levels</h3>
      <p>Rules are cumulative. Level {{ level }} is selected.</p>
    </div>
    <ol class="sheet-levels">
      <li
        v-for="row in adversary.levels"
        :key="row.id"
        class="sheet-level"
        :class="{ 'sheet-level-selected': row.level === level }"
        :aria-current="row.level === level ? 'step' : undefined"
      >
        <div class="sheet-level-number">
          <span class="sheet-micro-label">Level</span>
          <span class="sheet-numeral">{{ row.level }}</span>
        </div>
        <div class="sheet-level-rule">
          <h4>{{ row.title }}</h4>
          <p><SpiritText :text="row.description" /></p>
        </div>
        <div class="sheet-level-stats">
          <span><b>Difficulty</b> {{ row.difficulty }}</span>
          <span><b>Fear</b> {{ row.fearCards }}</span>
        </div>
      </li>
    </ol>

    <footer class="sheet-footer">
      <span>Compiled from the creator's published rules</span>
      <a
        v-if="adversary.sourceUrl"
        :href="adversary.sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        View original source ↗
      </a>
    </footer>
  </article>
</template>

<style scoped>
.community-sheet {
  overflow: hidden;
  border: 1px solid #a17c4b;
  border-radius: 0.75rem;
  background: #eee2c7;
  color: #302b25;
  box-shadow:
    0 18px 45px #0005,
    inset 0 0 0 5px #eee2c7,
    inset 0 0 0 6px #a17c4b;
  font-size: 0.93rem;
  line-height: 1.5;
}

.sheet-header {
  padding: 1.4rem 1.6rem 1.2rem;
  background: #253e3a;
  color: #f3e9d2;
  border-bottom: 5px solid #ab874f;
}

.sheet-eyebrow,
.sheet-micro-label {
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.sheet-eyebrow {
  color: #d1bc90;
}
.sheet-header h2 {
  margin: 0.3rem 0 0.5rem;
  color: #fff7e6;
  font-size: clamp(1.45rem, 4vw, 2rem);
  line-height: 1.15;
}

.sheet-byline {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.3rem 1rem;
  color: #e1d5bb;
  font-size: 0.78rem;
}

.sheet-foundation {
  padding: 0.9rem 1.5rem;
}
.sheet-rule {
  padding: 0.6rem 0;
  border-bottom: 1px solid #c7b99a;
}
.sheet-rule:last-child {
  border-bottom: 0;
}
.sheet-rule h3,
.sheet-level-heading h3 {
  color: #345d55;
  font-size: 0.75rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.sheet-loss h3 {
  color: #8a3f35;
}
.sheet-escalation h3 {
  color: #8a6030;
}
.sheet-rule p {
  margin-top: 0.22rem;
}
.sheet-rule strong {
  color: #26251f;
}

.sheet-level-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.2rem 1rem;
  padding: 0.75rem 1.5rem;
  border-top: 3px double #967c58;
  border-bottom: 1px solid #b6a481;
  background: #e4d2aa;
}
.sheet-level-heading p {
  font-size: 0.73rem;
  color: #625440;
}

.sheet-level {
  display: grid;
  grid-template-columns: 3.3rem minmax(0, 1fr) 6rem;
  gap: 0.8rem;
  padding: 0.95rem 1.5rem;
  border-bottom: 1px solid #c7b99a;
}
.sheet-level:nth-child(even) {
  background: #e8d9b9;
}
.sheet-level-selected {
  box-shadow: inset 5px 0 #2d6961;
  background: #d6e1d5 !important;
}
.sheet-level-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4b6258;
}
.sheet-numeral {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.1;
}
.sheet-level-rule h4 {
  margin-bottom: 0.3rem;
  color: #2d514c;
  font-size: 0.92rem;
}
.sheet-level-rule p {
  line-height: 1.5;
}
.sheet-level-stats {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: #544936;
}
.sheet-level-stats b {
  display: block;
  font-family: var(--font-display);
  font-size: 0.59rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sheet-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 0.9rem 1.5rem 1.1rem;
  color: #665b48;
  font-size: 0.72rem;
}
.sheet-footer a {
  color: #225a53;
  font-weight: 700;
  text-decoration: underline;
}

@media (max-width: 520px) {
  .sheet-header,
  .sheet-foundation,
  .sheet-level-heading,
  .sheet-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .sheet-level {
    grid-template-columns: 2.2rem minmax(0, 1fr);
    gap: 0.45rem 0.7rem;
    padding: 0.85rem 1rem;
  }
  .sheet-level-stats {
    grid-column: 2;
    flex-direction: row;
    gap: 1rem;
  }
  .sheet-numeral {
    font-size: 1.45rem;
  }
}
</style>
