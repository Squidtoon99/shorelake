import { Line, LineChart, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { Simulation } from "lib-simulation-wasm";
import { useEffect, useState } from "react";

export type Result = {
    generation: number,
    min: number,
    max: number,
    avg: number,
}

const ResultsView = ({ results, sim }: { results: Result[]; sim: Simulation | null}) => {
    const [animals_data, setAnimalsData] = useState<{id: number, x: number, y: number, rotation: number, satiation: number}[]>([]);
    

    useEffect(() => {
        if (sim === undefined) {
            return;
        }
        
        const interval = setInterval(() => {
            const d = sim?.world().animals?.map((a, i) => {
                return {
                    id: i,
                    x: a.x,
                    y: a.y,
                    rotation: a.rotation,
                    satiation: a.satiation,
                };
            });
            if (d === undefined) {
                return;
            }
            setAnimalsData(d.sort((a, b) => a.satiation - b.satiation));
        }, 1000);

        return () => clearInterval(interval);
    }, [sim])
    return <div>
        <h2>Results</h2>
        <div id="generation-title">Current Generation: {results.length}</div>
        <h2>Generation Progress</h2>
        <LineChart width={800} height={400} data={results} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="avg" stroke="#888400" dot={false} />
            <Line type="monotone" dataKey="min" stroke="#8084d8" dot={false} />
            <Line type="monotone" dataKey="max" stroke="#0089d8" dot={false} />
            <XAxis dataKey="generation" />
            <YAxis />
            <Legend/>
            <Tooltip />
        </LineChart>
        <h2>Food Consumption</h2>
        <BarChart width={800} height={400} data={animals_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Bar dataKey="satiation" fill="#888400" />
            <XAxis dataKey="id" />
            <YAxis />
            <Tooltip wrapperStyle={{ backgroundColor: "transparent" }} />
            <Legend />
        </BarChart>
    </div>
};

export {ResultsView};