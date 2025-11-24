import { NodeBase } from "./node-base";

export class Node {
    value: NodeBase;
    next: Node | null;

    constructor(value: NodeBase, next: Node | null) {
        this.value = value;
        this.next = next;
    }
}

export class LinkedList {
    head: Node | null;
    tail: Node | null;

    constructor() {
        this.head = null;
        this.tail = null;
    }

    add(value: NodeBase) {
        if (!this.head) {
            this.head = new Node(value, null);
            this.tail = null;
            return;
        }

        if (!this.head.next) {
            const next = new Node(value, null);
            this.head.next = next;
            this.tail = next;
            return;
        }

        const oldNext = this.tail;
        const newNext = new Node(value, null);
        if (oldNext) {
            oldNext.next = newNext;
        }
        this.tail = newNext;
    }

    show() {
        if (!this.head) return null;

        let start: Node | null | LinkedList = this.head;

        while (start != null) {
            if (start.value instanceof LinkedList) {
                start = start.value.head;
            } else {
                start = start.next;
            }
        }
    }
}

