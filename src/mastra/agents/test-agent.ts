import { taraAgent } from "./tara";

async function run() {

  const response = await taraAgent.generate(
    "How much did I spend on food?"
  );

  console.log(response.text);
}

run();