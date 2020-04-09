[![Node.js: 12.9.1](https://img.shields.io/badge/node-12.9.1-green.svg)](https://nodejs.org)
[![npm: 6.14.4](https://img.shields.io/badge/npm-6.14.4-green.svg)](https://npmjs.com)

# Overview

This project realises a simulation of a decentralised layer 2 algorithm. Nodes are tasked to find the next hop on the most cost-efficient route to a root node. The root node is determined as the (known) node with the minimum *root value*.

# Installation

Clone the repo and run `npm install` to install the required dependencies.

# Usage

## Running the application

Run `npm start` to comile and run the application. It will then ask you to select a network definition (see [Defining a network](#defining-a-network)) and for an interation limit. If you just press enter and leave the limit blank, the application will execute the algorithm until it has converged. If you provide a limit, the application will either stop on convergance or when the iteration limit is reached.

## Results

The algorithm's results are displayed in the console. It lists all detected nodes and links and if links are reversed to represent an undirected graph. Then, it shows the total number of interations calculated and lists for each node:

* Its own root value
* The root value of the node it assumes to be the root
* Its distance to that root node
* Its next hop on the best way to the root node

To see intermediate results, check with setting an interation limit.

**Note:** The application tells you if there is a known mistake in the network definition, e.g. defining a link with a node which has not been defined.

## Defining a network

The app reads data from files in the *data* folder. Put any definition of a network in single file. 

### Defining a node

A node is defined by a name and a root value. Add one line per node with ` name = root value`. 
The exact regular expression to match a node is:

``` /^\s*(?!\/\/)\s*(?<name>[A-Z][A-Z0-9]*)\s*[=:]\s*(?<rootValue>\d+)/gim ```

### Defining a link

A link is defined by the two node names it connects and its cost weight. Add one line per link with `from - to = cost`. You can also use the colon instead of the equals. The exact regular expression to match a link is:

``` /^\s*(?!\/\/)\s*(?<from>[A-Z][A-Z0-9]*)\s*-\s*(?<to>[A-Z][A-Z0-9]*)\s*[=:]\s*(?<cost>\d+)/gim ```.

**Note:** Only unsigned integers >0 are valid cost weights.

### Making links undirected

To declare all links as undirected (meaning that `A - C : 3;` represents a link from `A` to `C` as well as from `C` to `A` with the same cost of `3`), simply add a line `undirected` to a data file (see [example_1_undirected.txt](/data/example_1_undirected.txt)).

### Comments
Add `//` in front of a line to comment it out.

### Invalid network definitions

The application stops when one of the following cases occurs:

* A link between two nodes is defined twice, even if the cost weight is the same in both definitions.
* When trying to reverse links due to an undirected graph and the reversed link is already defined with a different cost weight. E.g. `A - B : 4;` and `B - A : 5;` crashes, but `A - B : 4;` and `B - A : 4;` is ok.

# References

* [:de: The project's description](https://sto-www.de/dhbw/vorlesungen/spanning-tree)