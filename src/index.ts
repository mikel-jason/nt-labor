import { Node, Link, Algorithm } from "./entities";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { parseNetwork, ParseResult } from "./parsing";

let choices: string[] = fs.readdirSync(path.resolve(__dirname, `../data`));
inquirer
  .prompt([
    {
      type: "list",
      name: "filename",
      message: "Which network do you want to calculate?",
      choices
    },
    {
      type: "number",
      name: "iterationLimit",
      message: "Iteration limit (leave blank if none)"
    },
  ])
  .then(answers => {
    if (
      answers.iterationLimit &&
      answers.iterationLimit != NaN &&
      Number.isInteger(answers.iterationLimit) &&
      answers.iterationLimit < 1
    ) {
      console.log(
        "Invalid step limit provided. Please restart and enter a limit >1"
      );
      process.exit();
    }
    let parseResult = parseNetwork(answers.filename);
    runAlogithmWithData(parseResult, answers.iterationLimit);
  });

function runAlogithmWithData(data: ParseResult, limit: number): void {
  let alg = new Algorithm(data.nodes, data.links);
  if (limit && limit != NaN) {
    alg.run(limit);
  } else {
    alg.run();
  }

  console.log();
  console.log(`Total number of iterations: ${alg.iterations.length}`);
  console.log();

  let lastIteration = alg.iterations[alg.iterations.length - 1];
  for (let [_, node] of Object.entries(lastIteration.nodes)) {
    console.log(
      `=== ${node.name} ===\nOwn root value: ${node.rootValue}\nRoot value of estimated root: ${node.estimatedRoot}\nDistance to root: ${node.distanceToRoot}\nNext hop: ${node.nextHop}\n`
    );
  }
}
