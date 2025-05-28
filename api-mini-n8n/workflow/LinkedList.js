class Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  add(value) {
    if (!this.head) {
      this.head = new Node(value);
      this.tail = this.head;
      return;
    }

    if (!this.head.next) {
      const next = new Node(value);
      this.head.next = next;
      this.tail = next;
      return;
    }

    const oldNext = this.tail;
    const newNext = new Node(value);
    oldNext.next = newNext;
    this.tail = newNext;
  }

  show() {
    if (!this.head) return null;

    let start = this.head;

    while (start != null) {
      if (start.value instanceof LinkedList) {
        start = start.value.head;
      } else {
        console.log(start.value);
        start = start.next;
      }
    }
  }
}

module.exports = {
  LinkedList,
};
