import { taxonomy } from "@/app/data/taxonomyData";
import TaxonomyMasonry from "./TaxonomyMasonry";
import TaxonomyTooltip from "./TaxonomyTooltip";
import TaxonomyPopover from "./TaxonomyPopover";
import TaxonomyIntro from "./TaxonomyIntro";

// Maps the taxonomy tree. TaxonomyMasonry packs the boxes (greedy shortest-column
// masonry); TaxonomyTooltip is the single delegated hover handler; TaxonomyPopover
// is the single delegated click handler that opens the per-protocol action box.
// TaxonomyIntro is the dismissible caution overlay shown on load.
export default function TaxonomyMap() {
  return (
    <>
      <TaxonomyTooltip>
        <TaxonomyPopover>
          <TaxonomyMasonry groups={taxonomy} />
        </TaxonomyPopover>
      </TaxonomyTooltip>
      <TaxonomyIntro />
    </>
  );
}
