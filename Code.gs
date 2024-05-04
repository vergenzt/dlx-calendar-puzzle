const DIR = {
  VERT: ["up", "dn"],
  HORZ: ["lt", "rt"],
};

function dlxsolve(mat) {

  // init arrays by index
  let colArrays = [], rowArrays = [];
  let head = rowArrays[0][0] = { headOfHeads: true };
  for (let i=0; i<mat.length; i++) {
    for (let j=0; j<mat[i].length; j++) {
      let x = mat[i][j];
      if (x) {
        // header row
        rowArrays[0] = rowArrays[0] || [];
        rowArrays[0][j+1] = rowArrays[0][j+1] || { head: true };

        let node = { i, j };
        rowArrays[i+1] = rowArrays[i+1] || [];
        rowArrays[i+1][j+1] = node;
        colArrays[j+1] = colArrays[j+1] || [];
        colArrays[j+1][i+1] = node;
      }
    }
  }

  // init doubly linked lists
  for (let [array, dir] of [[colArrays, DIR.VERT], [rowArrays, DIR.HORZ]]) {
    let [bk, fw] = dir;
    let frst, next, prev;
    for (let i in array) {
      next = array[i];
      frst = frst || next;
      if (prev) {
        next[bk] = prev;
        prev[fw] = next;
      }
      prev = next;
    }
    // wrap around
    frst[bk] = next;
    next[fw] = frst;
  }

  let removals = [];
  let choices = [];

  function remove(node, dir) {
    let [bk, fw] = dir;
    node[bk][fw] = node[fw];
    node[fw][bk] = node[bk];
    return [node, dir];
  };
  
  while (true) {

    if (!head.rt) {
      return "found a solution"; // todo: return it
    }
    
    // while no row from next col to choose, backtrack
    while (!head.rt?.dn) {
      // TODO
    }

    // choose row from next col
    let chosen = head.rt.dn;
    choices.push(chosen);
    
    let removal = [];

    // for each nodeLt in chosen row
    let nextLt = chosen;
    do {
      // for each nodeUp in nodeLt's column
      let nextUp = nextLt;
      do {
        // remove nodeUp from its row
        removal.push([node, DIR.HORZ]);
        node.lt.rt = node.rt;
        node.rt.lt = node.lt;
        node = node.up;
      }
      while (nextUp != nextLt);

      // remove nodeLt from its column
      removal.push([node, DIR.VERT]);
      nextLt.up.dn = nextLt.dn;
      nextLt.dn.up = nextLt.up;
      nextLt = nextLt.lt;
    }
    while (nextLt != chosen);

  }
}