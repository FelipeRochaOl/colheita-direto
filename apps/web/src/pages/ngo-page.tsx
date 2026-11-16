import { PageSection } from '@colheita/ui-web';
import { DonationBoard } from '../features/donations/components/donation-board';

export function NgoPage() {
  return (
    <PageSection title="Doações de alimentos">
      <DonationBoard />
    </PageSection>
  );
}
