import * as React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Notification } from '@/components/Notification';

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {children}
      <Footer />
      <Notification className=" top-15 mt-0 w-full  max-w-[15rem] p-4 " />
    </>
  );
}
