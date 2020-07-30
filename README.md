# Quick Tree JS

A library to create, manipulate and extract information from an M-Nary Tree. This tree can be used to model a file system, distributed tracing tasks, and so forth.
The produced tree model can be passed in UI frameworks to render, or in JS backend frameworks to perform operations like searching etc.

I wrote this library because of I couldn't find any library general and fast enough to fulfill both frontend and backend requirements in projects I was working on.

#### Requirement

> The library can build a tree using array of nodes, where each node should have a `key` and a `parent_key`. See `buildTree` method for more details.

Some use cases which are addressed -

1. Meta values can be stored as key-value pairs in each node.
1. Get a rooted subtree from the tree.
1. Get all nodes with matching Meta-Val (key-value pairs) from a subtree(can be root as well).
   - Returns siblings and child nodes with matching condition.
1. Perform a string search on nodes, and refine/filter the tree only keeping the matched nodes. (If a parent matches, the children are included).
1. Extract a plain javascript object of the tree structure.

## Table of Contents

1. Installation
1. Usage
1. Contribute

### Installation

```cli
npm i --save quick_tree
```

### Usage

The library offers 2 exports written under -

```js
// algo
import { algo } from "quick_tree";

// data_structure
import { data_structure } from "quick_tree";
```

### DataStructure Definitions
We have only one data structure, a TreeNode (Defined as `TreeModel`).
This model is the basis of all the operations that we will perform in algo section.

The `buildTree` method in `algo` returns a TreeModel instance which is the root of the tree and
should ideally be cached/stored in memory/placed in redux store. 


### Algo Methods

##### buildTree

Signature
```js
export const buildTree = (nodeList, metaFunc)
    /**
     * Assuming node list of structure
     *  {
     *      "id": string,
     *      "parentId": string,
     *      "taskName": string,
     *
     *  }
     *
     *  metaFunc - a method which is customizable and can attach meta properties to the node.
     *
     **/
    /**
     *  the metaFunc is applied as follows -
     * */
    
    thisTreeModel.addMeta(metaFunc(nodeList[idMapping[child]]));
    
    /**
     * Hence all the related meta can be saves into the each node in nodelist, and it will be
     * mapped to the node with the help of metaFunc. You can choose to manipulate the values
     * before mapping.
     * For ex - If we want to store a nodeStatus for each of the node, we can do using this.
     * Check `getTreeNodesIDsMatchedMetaVals` for further intuition.
     **/
```
Returns - TreeModel (Root of the constructed tree)

##### getNodeFromKey
Signature
``` js
/**
 * 
 * @param {TreeModel} root - Tree (TreeModel) root.
 * @param {string} key - Key (string) to be searched for. (Key is UUID.)
 * 
 * @returns TreeModel if key exists/ else null.
 */
export const getNodeFromKey = (root, key) => {
```
This method performs level order search (BFS) to get the Node which matches the key, and returns that subtree.
> Worst Case Time Complexity - O(N)

> Worst Case Space Complexity - O(max Width at any height)

##### getRefinedTreeSearchTerm
Signature
``` js
/**
 * 
 * 
 * @param {TreeModel}   root - Root of the tree.
 * @param {string}      searchTerm - string of search term.
 * 
 * Ideally call this method with a minimum string length of 3 maybe.? As per use case.
 * Searches for a term in the title of the Node. Will return a refined tree,
 * with only the branches which reach to a matched Node, and matched node's children
 * as we stop searching the subtree after that.
 * 
 * @returns null / TreeModel.
 */
export const getRefinedTreeSearchTerm = (root, searchTerm) => {
```
We perform DFS in this case. BFS would have worked as well, but using DFS it is easier to keep the heirarchy from root to a particular matched node. 

*As we want the heirarchy because we are refining the tree, not individually returning the 
matched nodes.*

> Worst Case Time Complexity - O(N)

> Worst Case Space Complexity - O(max Height of the tree)


##### getSiblingsForAKey
``` js
/**
 * 
 * We implement this algorithm considering we don't have pointers to parents.
 * In any case, JS doesn't allow pointers and we would have to search for parentNode using ParentKey
 * in a String -> Node Map.
 * 
 * The result will include the node.key itself as well.
 * 
 * @param {TreeNode} root Any Subtree. Ideally should be the root so we won't miss key. 
 * @param {String} key Key to be searched of siblings for.
 */
export const getSiblingsForKey = (root, searchKey) => {
```

We used BFS with 2 queues, so as to retain the nodes at each level while matching each of them for the key.

> Worst Case Time Complexity - O(N)

> Worst Case Space Complexity - O(max Width of the tree) - Safe to assume upper bound as O(2 * Max Width)


##### getTreeNodesIDsMatchedMetaVals

``` js
/**
 * This function returns all the nodes, with a limit, that match the provided criteria of meta object.
 * Do note that we do a BFS, so as to return top level matched nodes, rather than deep child nodes.
 * @param {TreeNode} root This wll be the root at which to begin the search.
 * @param {Object} metaObj This will be key value pairs to be used for matching.
 */

export const getTreeNodesIDsMatchedMetaVals = (root, metaObj, limit = 50) => {
```

A use case can be to find all nodes in a subtree with `nodeStatus=Val`, and metaVal for nodes can be
``` js
{ "nodeStatus": "FAILED",.. }
{ "nodeStatus": "PASSED",.. }
{ "nodeStatus": "ACTIVE",.. }
{ "nodeStatus": "SKIPPED",.. }
```

> Do note that we dont return the subtree, but the individual nodes with this method. For returning the whole subtree, there is a different method.


##### getNodeIdFromPath
``` js
/**
 * 
 * This method tries to match a path from root to a node.
 * If the node exists, we return key of that node., else null.
 * 
 * @param {TreeNode} root Root of the tree.
 * @param {String} path A path expected from root, if it doesn't exists, we will return null
 * 
 */
export const getNodeIDFromPath = (root, path) => {
```
We try to validate the heirarchy of the treenode using this method.

> Worst Case Time Complexity - O(Length of the path)

> Worst Case Space Complexity - O(1) (Not considering inputs for space)


##### getSubtreeWithMatchedMeta
```js
/**
 * This method returns a subtree with matched meta vals.
 **/
export const getSubtreeWithMatchedMeta = (root, metaObj) => {
```
This is somewhat similar to searching for a node, but for meta vals. Since the matched nodes can be huge, you can provide a limit for stopping the search after crossing the matches.

We dont put a limit because this returns the highest(most near to the root), and terminates the search for that subtree.

### Contribute
All contributions are welcome.


