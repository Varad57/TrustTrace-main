export default function Layout({ header, bottomNav, children }) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-dark-bg">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 safe-top">
        {header}
      </div>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-24">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        {bottomNav}
      </div>
    </div>
  )
}
