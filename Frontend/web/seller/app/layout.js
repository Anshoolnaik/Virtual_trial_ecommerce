import './globals.css';

export const metadata = {
  title: 'Vogue Seller Portal',
  description: 'Manage your fashion store on Vogue',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
