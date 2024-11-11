use lib_simulation as sim;
use rand::prelude::*;
use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub struct Simulation {
    rng: ThreadRng,
    sim: sim::Simulation
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let mut rng = thread_rng();
        let sim = sim::Simulation::random(&mut rng);

        Self {rng, sim}
    }

    pub fn world(&self) -> World    {
        World::from(self.sim.world())
    }

    pub fn step(&mut self) -> Option<String> {
        if let Some(stats) = self.sim.step(&mut self.rng) {
            Some(format!(
                "min={:.2}, max={:.2}, avg={:.2}",
                stats.min_fitness,
                stats.max_fitness,
                stats.avg_fitness,
            ))
        } else {
            None
        }
    }

    pub fn train(&mut self) -> String {
        let stats = self.sim.train(&mut self.rng);

        format!(
            "min={:.2}, max={:.2}, avg={:.2}",
            stats.min_fitness,
            stats.max_fitness,
            stats.avg_fitness,
        )
    }

    pub fn train_n(&mut self, amount: usize) -> Vec<String> {
        (0..amount)
            .map(|_| self.train())
            .collect()
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct World {
    #[wasm_bindgen(getter_with_clone)]
    pub animals: Vec<Animal>,

    #[wasm_bindgen(getter_with_clone)]
    pub foods: Vec<Food>,
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Animal {
    pub x: f32,
    pub y: f32,
    pub rotation: f32,
    pub satiation: usize 
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Food {
    pub x: f32,
    pub y: f32
}

impl From<&sim::World> for World {
    fn from(world: &sim::World) -> Self {
        let animals = world.animals().iter().map(Animal::from).collect();
        let foods = world.foods().iter().map(Food::from).collect();
        Self { animals, foods }
    }
}

impl From<&sim::Animal> for Animal {
    fn from(animal: &sim::Animal) -> Self {
        Self {
            x: animal.position().x,
            y: animal.position().y,
            rotation: animal.rotation().angle(),
            satiation: animal.satiation()
        }
    }
}

impl From<&sim::Food> for Food {
    fn from(food: &sim::Food) -> Self {
        Self {
            x: food.position().x,
            y: food.position().y
        }
    }
}

#[wasm_bindgen]
pub fn whos_that_dog() -> String {
    "Snoop Doggg".into()
}

