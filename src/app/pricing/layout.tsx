import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans | Dfence Prep — Defence Exam Preparation',
  description: 'Choose your defence exam preparation plan. Get AI-powered daily defence news, unlimited MCQs, mock tests, and strategic analysis for CDS, NDA, AFCAT, SSB Interview. Plans starting at just ₹30.',
  keywords: [
    'defence exam preparation pricing',
    'defence exam coaching fees',
    'NDA preparation online',
    'CDS preparation cost',
    'AFCAT preparation plan',
    'best defence coaching India',
    'affordable defence coaching',
    'dfenceprep plans',
  ],
  alternates: {
    canonical: 'https://dfenceprep.com/pricing',
  },
  openGraph: {
    title: 'Pricing Plans | Dfence Prep — Defence Exam Preparation',
    description: 'Plans starting at ₹30. AI-powered preparation for CDS, NDA, AFCAT with daily defence news, mock tests, and SSB training.',
    type: 'website',
    url: 'https://dfenceprep.com/pricing',
    siteName: 'Dfence Prep',
    locale: 'en_IN',
    images: [{ url: 'https://dfenceprep.com/hero-army.png', alt: 'Dfence Prep Pricing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dfence Prep Pricing | Defence Exam Plans from ₹30',
    description: 'AI-powered defence exam prep. Plans from ₹30. CDS, NDA, AFCAT, SSB coverage.',
    images: ['https://dfenceprep.com/hero-army.png'],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
