export interface Link {
  nodeName: string;
  cost: number;
}

export class Node {
  readonly name: String;
  readonly rootValue: number;
  estimatedRoot: number;
  distanceToRoot: number;
  nextHop: String;

  constructor(name: String, rootValue: number) {
    this.name = name;
    this.rootValue = rootValue;
    this.distanceToRoot = 0;
    this.estimatedRoot = rootValue;
    this.nextHop = "-";
  }
}

class Iteration {
  public nodes: {[key:string]: Node};

  constructor(nodes: {[key:string]: Node}) {
    this.nodes = nodes;
  }

  public getNodeByName(name: string) {
    return this.nodes[name];
  }

  /**
   * Copies the iteration by value instead of by reference;
   */
  public createCopy() {
    let nodesCopy = JSON.parse(JSON.stringify(this.nodes));
    return new Iteration(nodesCopy);
  }
}

export class Algorithm {
  public iterations: Iteration[];
  public nodes: {[key:string]: Node};
  public links: {[key:string]: Link[]};

  constructor(nodes: {[key:string]: Node}, links: {[key:string]: Link[]}) {
    this.nodes = nodes;
    this.links = links;
    this.createFirstIteration(nodes);
  }

  public getLinksForNode(name: string) {
    return this.links[name];
  }

  private createFirstIteration(nodes: {[key:string]: Node}): void {
    this.iterations = [];
    this.iterations.push(new Iteration(nodes));
  }

  public run(stepLimit?: number) {
    if (stepLimit) {
      while (this.iterations.length < stepLimit) {
        this.runIterationStep();
      }
    } else {
      while (
        this.iterations.length < 2 ||
        JSON.stringify(this.iterations[this.iterations.length - 1]) !=
          JSON.stringify(this.iterations[this.iterations.length - 2])
      ) {
        this.runIterationStep();
      }
    }
  }

  public runIterationStep() {
    let lastIteration = this.iterations[this.iterations.length - 1];
    let newIteration = lastIteration.createCopy();

    for (let [sourceNodeName, sourceNode] of Object.entries(lastIteration.nodes)) {
      let nodeLinks = this.getLinksForNode(sourceNodeName);
      if (!nodeLinks) continue;
      nodeLinks.forEach((link) => {
        let linkCost = link.cost;
        let targetNodeName = link.nodeName;

        // skip if no link
        if (linkCost == null) {
          return true;
        }

        let node = lastIteration.getNodeByName(sourceNodeName);
        let connectedNode = lastIteration.getNodeByName(targetNodeName);

        // skip if own root is better
        if (node.estimatedRoot < connectedNode.estimatedRoot) {
          return true;
        }

        // adjust node in new iteration
        let newCost = linkCost + connectedNode.distanceToRoot;
        let newNode = newIteration.getNodeByName(sourceNodeName);

        if (
          connectedNode.estimatedRoot < node.estimatedRoot ||
          newCost < node.distanceToRoot
        ) {
          newNode.estimatedRoot = connectedNode.estimatedRoot;
          newNode.distanceToRoot = newCost;
          newNode.nextHop = connectedNode.name;
          // newNode.estimatedRoot = -1;
          // newNode.distanceToRoot = -20;
        }
      });
    };

    this.iterations.push(newIteration);
  }
}
