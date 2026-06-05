import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CareerOS Assessment - Discover Your Best Path',
  description: 'A thoughtful assessment to help you understand what careers actually fit who you are.',
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#F8F5EE',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
