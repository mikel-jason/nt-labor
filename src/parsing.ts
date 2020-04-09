import { Node, Link } from "./entities";
import fs from "fs";
import path from "path";

export interface ParseResult {
  nodes: { [key: string]: Node };
  links: { [key: string]: Link[] };
}

export function parseNetwork(filename: string): ParseResult {
  let nodes: { [key: string]: Node } = {};
  let data = fs
    .readFileSync(path.resolve(__dirname, `../data/${filename}`))
    .toString();
  let nodeRegex: RegExp = /^\s*(?!\/\/)\s*(?<name>[A-Z][A-Z0-9]*)\s*[=:]\s*(?<rootValue>\d+)/gim;
  let linkRegex: RegExp = /^\s*(?!\/\/)\s*(?<from>[A-Z][A-Z0-9]*)\s*-\s*(?<to>[A-Z][A-Z0-9]*)\s*[=:]\s*(?<cost>\d+)/gim;

  console.log("Detected nodes:");
  for (const match of data.matchAll(nodeRegex)) {
    let name = match.groups.name;
    let rootValue = Number(match.groups.rootValue);
    console.log(`Name: ${name}, root value: ${rootValue}`);
    nodes[name] = new Node(name, rootValue);
  }

  let links: { [key: string]: Link[] } = {};
  console.log();
  console.log("Detected links:");
  for (const match of data.matchAll(linkRegex)) {
    let from = match.groups.from;
    let to = match.groups.to;
    let cost = Number(match.groups.cost);

    if (from === to) {
      console.log(`Ignoring link from ${from} to itself!`);
    }

    if (cost < 1) {
      console.log(`Link from ${from} to ${to} has no valid cost value (>0)`);
      continue;
    }

    if (from && to && cost && cost != NaN && nodes[from] && nodes[to]) {
      if (!links[from]) links[from] = [];
      if (links[from].filter(link => link.nodeName === to).length) {
        console.error(`Duplicate Link from ${from} to ${to}!`);
        process.exit();
      }
      links[from].push({ nodeName: to, cost });
      console.log(`${from} -> ${to} (Cost: ${cost})`);
    } else {
      console.log(
        `Cannot handle ${match[0]}. Looks like at least one of the nodes to not exist.`
      );
    }
  }

  if (data.match(/^\s*(?!\/\/)\s*undirected$/gim)) {
    console.log();
    console.log("Detected undirected option. Adding reverse links.");
    for (let [source, lnks] of Object.entries(links)) {
      lnks.forEach((link) => {
        if (!links[link.nodeName]) {
          links[link.nodeName] = [];
        }
        if (
          links[link.nodeName].filter((elem) => elem.nodeName == source)
            .length == 1
        ) {
          if (
            links[link.nodeName].filter((elem) => elem.nodeName == source)[0]
              .cost != link.cost
          ) {
            console.error(
              `Invalid input: Cannot reverse link from ${source} to ${link.nodeName}`
            );
            process.exit();
          }
        }
        links[link.nodeName].push({ nodeName: source, cost: link.cost });
      });
    }
  }

  return { nodes, links };
}
