function newList() {
  let head = { head: true };
  let tail = head;
  return { head, tail };
}

const DIR = {
  VERT: ["up", "dn"],
  HORZ: ["lt", "rt"],
};

function insertList(list, node, dir) {
  const [ bk, fw ] = dir;
  node[bk] = list.tail;
  list.tail[fw] = node;
  list.tail = node;
  list.head.n += 1;
  return list;
}

function dlxsolve(mat) {

  // initialize doubly linked lists
  let cols = [], rows = [];
  mat.forEach((row, i) => row.forEach((x, j) => {
    if (x) {
      let node = { x };
      rows[i] = appendList(rows[i] || newList(), node, DIR.VERT);
      cols[j] = appendList(cols[j] || newList(), node, DIR.HORZ);
    }
  }));

  
}