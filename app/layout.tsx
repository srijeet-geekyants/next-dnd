import './globals.css'

export const metadata = {
  title: 'Trello 2.0 App',
  description: 'Trello 2.0 App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
