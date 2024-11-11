import * as sim from "lib-simulation-wasm";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Stage, Layer, Circle, RegularPolygon } from 'react-konva';
import Konva from 'konva';
// @ts-ignore
import FPSStats from "react-fps-stats";

const Animal = ({ animal, dim, optimal }: { animal: sim.Animal; dim: number[]; optimal: number | undefined; }) => {
    let color = 'white';

    if (optimal && animal.satiation === optimal) {
        color = 'red';
    }
    
    return (
        <RegularPolygon
            x={animal.x * dim[0]}
            y={animal.y * dim[1]}
            sides={3}
            radius={10}
            width={0.03 * dim[0]}
            rotation={animal.rotation * 90}
            fill={color}
            shadowBlur={5}
            opacity={color == "red" ? 1 : 0.4}
        />
    );
}

const Food = ({ food, dim }: { food: sim.Food, dim: number[]; }) => {
    return (
        <Circle
            x={food.x * dim[0]}
            y={food.y * dim[1]}
            fill="rgb(0, 255, 128)"
            radius={(0.01 / 2.0) * dim[0]}
        />
    )
}
const SimulationCanvas = ({ sim, addResult }: { sim: sim.Simulation | null; addResult: (result: string | undefined) => void; }) => {

    const viewport: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
    const viewLayer: MutableRefObject<Konva.Layer | null> = useRef(null);
    const [_gem, setGen] = useState(0);
    const [dim, setDim] = useState<number[]>([800, 800]);

    useEffect(() => {
        console.log("A", viewport.current);
        if (viewport.current === null) {
            return;
        }
        console.log("B");
        const viewportWidth = viewport.current.width;
        const viewportHeight = viewport.current.height;

        const viewportScale = window.devicePixelRatio || 1;

        viewport.current.width = viewportWidth * viewportScale;
        viewport.current.height = viewportHeight * viewportScale;

        viewport.current.style.width = viewportWidth + 'px';
        viewport.current.style.height = viewportHeight + 'px';


        const ctxt = viewport.current.getContext("2d");
        console.log("Context: ", ctxt);
        if (ctxt !== null) {
            ctxt.fillStyle = 'rgb(0, 0, 0)';

            ctxt.scale(viewportScale, viewportScale);
        }

        setDim([viewportWidth, viewportHeight])
        console.log("updating animation");
    }, [viewport.current]);

    useEffect(
        () => {
            if (!sim || !viewLayer.current) {
                return () => {};
            }
            console.log("Animating");
            
            const anim = new Konva.Animation(
                (_frame) => {
                    if (!sim) {
                        return;
                    }
                    const result = sim.step();
                    if (result !== undefined) {
                        addResult(result)
                    }

                    setGen((gen) => (gen + 1) % 2500);
                },
                [viewLayer.current]
            );

            anim.start();

            return () => anim.stop();
        },
        [sim, viewLayer.current]
    )

    // find the animal with the highest satiation
    const maxSatiation = sim?.world().animals.reduce((acc, animal) => {
        return Math.max(acc, animal.satiation);
    }, 0);

    return <>
        <FPSStats graphWidth={100} />
        <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer ref={viewLayer}>
                {sim && dim && sim.world().animals.map((animal, idx) => <Animal key={idx} animal={animal} dim={dim} optimal={maxSatiation} />)}
                {sim && dim && sim.world().foods.map(food => <Food key={`${food.x}-${food.y}`} food={food} dim={dim} />)}
            </Layer>
        </Stage>
    </>
};

export { SimulationCanvas };