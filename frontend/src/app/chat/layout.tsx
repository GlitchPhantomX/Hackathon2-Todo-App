import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chat Assistant | TodoMaster',
  description: 'Chat with your AI task assistant',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}