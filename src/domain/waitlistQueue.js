import { DomainError } from "./errors.js";

export class Queue {
  #head = null;
  #tail = null;
  #count = 0;

  enqueue(value) {
    if (value === undefined) {
      throw new DomainError("Queue values cannot be undefined.", "VALIDATION");
    }

    const node = { value, next: null };

    if (this.#tail === null) {
      this.#head = node;
    } else {
      this.#tail.next = node;
    }

    this.#tail = node;
    this.#count += 1;
    return this.#count;
  }

  dequeue() {
    if (this.#head === null) {
      return undefined;
    }

    const value = this.#head.value;
    this.#head = this.#head.next;
    this.#count -= 1;

    if (this.#head === null) {
      this.#tail = null;
    }

    return value;
  }

  peek() {
    return this.#head?.value;
  }

  get size() {
    return this.#count;
  }
}
