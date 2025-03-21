import { useState } from 'react';
import TripForm from './components/TripForm.jsx';
import MapView from './components/MapView.jsx';
import LogSheet from './components/LogSheet.jsx';

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Trip Planner</h1>
        <p className="mt-2 text-gray-600">Plan your route and view HOS-compliant logs</p>
      </header>
      <main className="space-y-8">
        <TripForm onSubmit={setResult} />
        {result && (
          <div className="space-y-20">
            <MapView route={result.route} />
            <LogSheet logs={result.logs} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;