import { taxonomy } from "@/app/data/taxonomyData";
import GroupBox from "./GroupBox";
import TaxonomyTooltip from "./TaxonomyTooltip";
import styles from "./taxonomy.module.css";

// Server Component: maps over the top-level taxonomy groups. The tree is wrapped
// in a single client-side tooltip handler (delegated hover).
export default function TaxonomyMap() {
  return (
    <TaxonomyTooltip>
      <div className={styles.map}>
        {taxonomy.map((group, i) => (
          <GroupBox key={i} group={group} depth={0} path={[]} />
        ))}
      </div>
    </TaxonomyTooltip>
  );
}
