import './globals.css'

export const metadata = {
  title: 'Affiliate Content Dashboard',
  description: 'Dashboard para auditoria contratual de entregas de afiliados',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
