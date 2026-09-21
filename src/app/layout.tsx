import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { SimulationProvider } from '@/context/SimulationContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { SimulationBar } from '@/components/layout/SimulationBar';
import { BuyModal } from '@/components/trade/BuyModal';
import { SellModal } from '@/components/trade/SellModal';
import { ToastContainer } from '@/components/ui/ToastContainer';
import LayoutShell from './LayoutShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kinetix Virtual Trading | Indian Equities Simulator',
  description:
    'A high-performance virtual stock trading platform with historical date/time simulation, portfolio tracking, and atomic execution.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0B0F17] text-gray-100 min-h-screen flex flex-col antialiased`}>
        <SimulationProvider>
          <LayoutShell>{children}</LayoutShell>
          <BuyModal />
          <SellModal />
          <ToastContainer />
        </SimulationProvider>
      </body>
    </html>
  );
}
