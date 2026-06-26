import { taxonomy } from "@/app/data/taxonomyData";
import TaxonomyMasonry from "./TaxonomyMasonry";
import TaxonomyTooltip from "./TaxonomyTooltip";

// Maps the taxonomy tree. TaxonomyMasonry packs the boxes (greedy shortest-column
// masonry); TaxonomyTooltip is the single delegated hover handler for the tree.
export default function TaxonomyMap() {
  return (
    <TaxonomyTooltip>
      <TaxonomyMasonry groups={taxonomy} />
    </TaxonomyTooltip>
  );
}
