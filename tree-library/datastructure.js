import _ from "lodash";

export class TreeModel {

    constructor(title, key, parentId) {
        this.title = title;
        this.key = key;
        this.parentId = parentId;
        this.childrenKeyMap = {};
        this.children = [];
        // this.children = null;
    }

    get isLeaf() {
        return this.children.length === 0;
    }

    addChildren(child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
        this.childrenKeyMap[child.key] = true;
    }

    addMeta(meta) {
        // Try to keep this property low.
        this.meta = meta;

        _.forEach(meta, (v, k) => {
            this[k] = v;
        })
    }

    updateMeta(node) {
        _.forEach(node.meta, (v, k) => {
            this[k] = v;
        })
    }
}

export const getJSTreeObj = (node) => {
    let {children, ...treeObj} = node;

    if (node.children) {
        treeObj["children"] = [];
    }
    return treeObj;
}

export const makeJSTree = (root) => {
    if (!root) {
        return;
    }

    let newroot = getJSTreeObj(root);

    if (root.children) {
        _.forEach(root.children, child => {
            newroot.children.push(makeJSTree(child));
        });
    }
    return newroot;
}