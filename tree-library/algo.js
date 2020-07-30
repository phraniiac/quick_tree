import { TreeModel } from './datastructure';
import _ from 'lodash';
// import { findRenderedComponentWithType } from 'react-dom/test-utils';

// NOTE for BFS implementations.
// We can eliminate the inner loop and let it run for all the elements in queue,
// but not removing for consistency of the algorithm. Maybe we can use
// the no. of nodes at each height later?
// An example use case is if you want to expand the tree for top 3 height, and not below that.

// Also none of the searching algorithms, BFS/DFS have a visited check,. We assume the tree is 
// infact a tree and not a cyclic graph.
// TODO: Make the title to be usable as React Node, remove search dependency from "title" key.
/**
 * 
 * @param {*} nodeList 
 */
export const buildTree = (nodeList, metaFunc) => {
    /**
     * Assuming node list of structure
     *  {
     *      "id": string,
     *      "parentId": string,
     *      "taskName": string,         // TODO: Generalize.
     *                                  
     *  }
     * 
     *  metaFunc - a method which is customizable and can attach meta properties to the node.
     * defaulting it to 
     */
    // Mapping for TaskID -> Index in response Array. 
    // For fast lookup of details of each ID.

    const idMapping = nodeList.reduce((acc, el, i) => {
        acc[el.id] = i;
        return acc;
    }, {});

    let idMapMaps = {}

    // Mapping for ParentID -> ListOfChildrenIDs - O(N)
    nodeList.forEach(task => {
        if (!(task.parentId in idMapMaps)) {
            idMapMaps[task.parentId] = {}
        }
        idMapMaps[task.parentId][task.id] = true;
    });

    // BFS to create the tree - O(N)
    let root = nodeList[idMapping[Object.keys(idMapMaps["null"])[0]]]
    root = new TreeModel(root.taskName, root.id, root.parentId)
    if (metaFunc) {
        root.addMeta(metaFunc(nodeList[idMapping[Object.keys(idMapMaps["null"])[0]]]));
    }
    let q = [root];
    while (q.length) {
        let len_q = q.length;
        for (let i = 0; i < len_q; i++) {
            let curr = q.shift();
            if (curr.key in idMapMaps) {
                _.forEach(Object.keys(idMapMaps[curr.key]), child => {
                    let thisTreeModel = new TreeModel(nodeList[idMapping[child]].taskName,
                        nodeList[idMapping[child]].id,
                        nodeList[idMapping[child]].parentId);
                    if (metaFunc) {
                        thisTreeModel.addMeta(metaFunc(nodeList[idMapping[child]]));
                    }
                    curr.addChildren(thisTreeModel);

                    q.push(thisTreeModel);
                });
            }
        }
    }
    return root;
}

/**
 * 
 * @param {TreeModel} root - Tree (TreeModel) root.
 * @param {string} key - Key (string) to be searched for. (Key is UUID.)
 * 
 * @returns TreeModel if key exists/ else null.
 */
export const getNodeFromKey = (root, key) => {

    if (!root || !("key" in root)) {
        return null;
    }
    // We search using Level-Order(BFS). Complexity worst Case - O(N)
    let q = [root];

    while (q.length) {
        // nodes at this height.
        let len_q = q.length;
        for (let i = 0; i < len_q; i++) {
            let el = q.shift();

            if (el.key == key) return el;

            if (el.children) {
                el.children.forEach(child => {
                    q.push(child);
                });
            }
        }
    }
    return null
}


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
    if (!root) {
        return [];
    }

    if (!searchTerm || searchTerm.length == 0) {
        return root;
    }

    searchTerm = searchTerm.toLowerCase();
    let keysMatched = new Set();

    const dfsSearchMatchFound = (root, searchTerm, keys_yet) => {

        // check if this node directly matches.
        if (root.title.toLowerCase().indexOf(searchTerm) > -1) {
            keys_yet.forEach(element => {
                keysMatched.add(element);
            });
            keysMatched.add(root.key);
            return root;
        }

        let newRoot = new TreeModel(root.title, root.key, root.parentId);
        if (root.children) {
            newRoot.updateMeta(root);

            root.children.forEach(child => {
                let newChild = dfsSearchMatchFound(child, searchTerm, [child.key, ...keys_yet]);
                if (newChild != null) {
                    newRoot.addChildren(newChild);
                }
            });
        }

        return newRoot.children.length > 0 ? newRoot : null
    }

    let res = dfsSearchMatchFound(root, searchTerm, [root.key]);

    if (!res) {
        return [[], keysMatched];
    }

    return [res, keysMatched];
}

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

    let metaRoot = new TreeModel();
    metaRoot.addChildren(root);

    let currQ = [metaRoot];
    let toProcessQueue = [];

    let foundParent = null;
    let resElements = [];


    // Level Order search, with 2 queues to keep history of parents.
    while (currQ.length) {

        let lenq = currQ.length;
        for (let i = 0; i < lenq; ++i) {
            let ele = currQ.shift();
            let lastElements = toProcessQueue.length;
            if (ele.children) {
                // eslint-disable-next-line no-loop-func
                ele.children.forEach(child => {
                    if (child.key == searchKey) {
                        foundParent = ele;
                    }
                    toProcessQueue.push(child);
                });
            }
            if (foundParent) {
                // Extract the elements from toProcessQueue.
                // from index lastElements.
                resElements.push(...toProcessQueue.slice(lastElements));

                // break the Search.
                break;
            }
        }
        if (foundParent) {
            break;
        }
        currQ = _.cloneDeep(toProcessQueue);
        toProcessQueue = [];
    }

    return resElements;
}

/**
 * This function returns all the nodes, with a limit, that match the provided criteria of meta object.
 * Do note that we do a BFS, so as to return top level matched nodes, rather than deep child nodes.
 * @param {TreeNode} root This wll be the root at which to begin the search.
 * @param {Object} metaObj This will be key value pairs to be used for matching.
 */

export const getTreeNodesIDsMatchedMetaVals = (root, metaObj, limit = 7) => {

    let currQ = [root];

    let resElements = [];

    while (currQ.length && limit) {
        let lenQ = currQ.length;

        for (let i = 0; i < lenQ; i++) {
            let ele = currQ.shift();

            let match = true;
            _.forEach(metaObj, (v, k) => {
                if (ele[k] != v) {
                    match = false;
                }
            });

            if (match) {
                resElements.push(ele);
                limit -= 1;
            }

            if (ele.children) {
                _.forEach(ele.children, child => {
                    currQ.push(child);
                })
            }
        }

        if (!limit) break;
    }

    return resElements;
}

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
    if (!root || root.length == 0) {
        return null;
    }

    if (path == "" || path == "/") {
        return root.key;
    }

    let tokens = path.toLowerCase().split("/");
    let resNode = null;
    let ptr = 0;

    while (!resNode && ptr < tokens.length) {
        if (root.title.toLowerCase() == tokens[ptr]) {
            ptr += 1;
            if (ptr == tokens.length) {
                resNode = root;
                break;
            }
            let arr = _.filter(root.children, (child) => child.title.toLowerCase() == tokens[ptr])
            if (!arr.length) break;
            root = arr[0];
        }
    }
    return resNode;
}

export const getSubtreeWithMatchedMeta = (root, metaObj) => {
    if (!root) {
        return [];
    }

    if (!metaObj || metaObj.length == 0) {
        return root;
    }

    let keysMatched = new Set();

    const dfsSearchMatchFound = (root, metaObj, keys_yet) => {

        // check if this node directly matches.

        let match = true;
        _.forEach(metaObj, (v, k) => {
            if (root[k] != v) {
                match = false;
            }
        })

        if (match) {
            _.forEach(keys_yet, key => {
                keysMatched.add(key);
            })
            keysMatched.add(root.key);
        }

        let newRoot = new TreeModel(root.title, root.key, root.parentId);
        if (root.children) {
            newRoot.updateMeta(root);
            _.forEach(root.children, child => {
                let newChild = dfsSearchMatchFound(child, metaObj, [child.key, ...keys_yet]);
                if (newChild != null) {
                    newRoot.addChildren(newChild);
                }
            });
        }

        return (newRoot.children.length || match) > 0 ? newRoot : null
    }

    let res = dfsSearchMatchFound(root, metaObj, [root.key]);

    if (!res) {
        return [[], keysMatched];
    }

    return [res, keysMatched];
}

