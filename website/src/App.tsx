import { useEffect, useState } from 'react'
import { Simulation } from "lib-simulation-wasm";
import { SimulationCanvas } from './SimulationCanvas';
import { ResultsView, Result} from './ResultsView';
import './App.css'

function App() {
  const [sim, setSim] = useState<Simulation | null>(null);
  const [generation, setGeneration] = useState(0);
  const [results, setResults] = useState<Result[]>([]);

  const addResult = (result: string | undefined) => {
    if (result === undefined) {
      return;
    }
    // format: "min=0.00 max=0.00 avg=0.00"
    const parts = result.split(" ");
    const min = parseFloat(parts[0].split("=")[1]);
    const max = parseFloat(parts[1].split("=")[1]);
    const avg = parseFloat(parts[2].split("=")[1]);
    // get last generation

    setResults(r => {
      let g;
      if (r.length > 0) {
        let last = r[r.length - 1];
        g = last.generation + 1;
      } else {
        g = 1;
      }
      return [...r, { generation: g, min, max, avg }];
    }
    );
    setGeneration(g => g + 1);
  }

  useEffect(() => {
    console.log("Sim: ", sim);
    if (sim === null) {
      console.log("Starting sim");
      const simulation = new Simulation();
      setSim(simulation);
    }
  }, [sim])
  const train = (times: number) => {
    console.log("Train n: ", times);
    const results = sim?.train_n(times);
    if (results === undefined) {
      return;
    }
    for (let i = 0; i < results.length; i++) {
      addResult(results[i]);
    }
  }
  return (
    <>
      <h1>Simulating Evolution</h1>
      <div className="card">
        <button onClick={() => addResult(sim?.train())}>
          Train Generation {generation} {"=>"} {generation+1}
        </button>
        <button onClick={() => train(100)}>
          x100 (very slow)
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <SimulationCanvas sim={sim} addResult={addResult} />
      <ResultsView results={results} sim={sim} />
      <p className="read-the-docs">
        Click on the x100 button to run a simulation for 100 generations. The simulation will run slowly, but you can see the results in the charts above.
      </p>
    </>
  )
}

export default App
