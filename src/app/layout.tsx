import Footer from "@/components//Footer";
import Navbar from "@/components/Header";
import './globals.css'


export const metadata = {
  title: 'Tyrent - Your Digital House Hunting Partner',
  description: 'Find and book your perfect apartment with verified listings, virtual tours, and secure payments.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
          <main className="pt-18">
              {children}
          </main>
        <Footer />
      </body>
    </html>
  )
}