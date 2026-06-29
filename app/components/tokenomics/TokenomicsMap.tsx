"use client";

import { tokenomics, type Concept, type Category, type Tier } from "@/app/data/tokenomicsData";
import TokenomicsTooltip from "./TokenomicsTooltip";
import styles from "./tokenomics.module.css";

const KIND_LABEL: Record<NonNullable<Category["kind"]>, string> = {
  policy: "policy · what",
  mechanism: "mechanism · how",
};

function ConceptChip({ concept }: { concept: Concept }) {
  return (
    <div className={styles.concept} data-term={concept.name} data-def={concept.def}>
      <span className={styles.conceptName}>{concept.name}</span>
      {concept.options && (
        <span className={styles.options}>
          {concept.options.map((opt, i) => (
            <span key={opt} className={styles.option}>
              {opt}
              {i < concept.options!.length - 1 && (
                <span className={styles.optionSep}> · </span>
              )}
            </span>
          ))}
        </span>
      )}
      {concept.crossRef && <span className={styles.crossRef}>{concept.crossRef}</span>}
    </div>
  );
}

function CategoryCard({ category, accent }: { category: Category; accent: string }) {
  const isPipeline = category.span === "full";
  return (
    <section
      className={`${styles.card}${isPipeline ? ` ${styles.cardFull}` : ""}`}
      data-accent={category.accent ?? accent}
    >
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{category.title}</h3>
        {category.kind && (
          <span className={styles.kind} data-kind={category.kind}>
            {KIND_LABEL[category.kind]}
          </span>
        )}
        {category.note && <span className={styles.cardNote}>{category.note}</span>}
      </header>
      <div className={isPipeline ? styles.pipelineGrid : styles.concepts}>
        {category.concepts.map((c) => (
          <ConceptChip key={c.name} concept={c} />
        ))}
      </div>
    </section>
  );
}

function TierRow({ tier }: { tier: Tier }) {
  return (
    <section id={tier.id} className={styles.tier} data-accent={tier.accent}>
      <div className={styles.rail}>
        <h2 className={styles.railLabel}>{tier.label}</h2>
        <p className={styles.railBlurb}>{tier.blurb}</p>
      </div>
      <div className={styles.cards}>
        {tier.categories.map((cat) => (
          <CategoryCard key={cat.title} category={cat} accent={tier.accent} />
        ))}
      </div>
    </section>
  );
}

// Top strip: the four lifecycle stages as connected pills that scroll to their
// swimlane. Mirrors the directional arrows in the original hand-drawn taxonomy.
function Lifecycle() {
  return (
    <nav className={styles.lifecycle} aria-label="Token lifecycle">
      {tokenomics.map((tier, i) => (
        <div key={tier.id} className={styles.lifecycleItem}>
          <a href={`#${tier.id}`} className={styles.lifecyclePill} data-accent={tier.accent}>
            {tier.label}
          </a>
          {i < tokenomics.length - 1 && (
            <span className={styles.lifecycleArrow} aria-hidden>
              →
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

export default function TokenomicsMap() {
  return (
    <TokenomicsTooltip>
      <div className={styles.map}>
        <header className={styles.intro}>
          <p className={styles.introText}>
            A token&apos;s life runs top to bottom: it is{" "}
            <strong>created</strong>, <strong>handed out</strong>, comes to{" "}
            <strong>hold value</strong>, and is then{" "}
            <strong>governed</strong>. Hover any concept for a definition; click
            to freeze the tooltip.
          </p>
        </header>
        <Lifecycle />
        <div className={styles.tiers}>
          {tokenomics.map((tier) => (
            <TierRow key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </TokenomicsTooltip>
  );
}
