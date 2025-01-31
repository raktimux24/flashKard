export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">FlashKard</h1>
        <p className="text-gray-600">Smart flashcard learning system</p>
      </header>
      
      <section className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Create New Card</h2>
          {/* Add card creation form here */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Cards</h2>
          {/* Add card list here */}
        </div>
      </section>
    </main>
  )
} 