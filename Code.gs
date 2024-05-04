const UP = "up";
const DN = "dn";
const LT = "lt";
const RT = "rt";

// backwards
const BK = {
  [UP]: DN, [DN]: UP,
  [LT]: RT, [RT]: LT,
};

function debug() {
  console.log(dlxsolve([
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [0, 0, 0, 1],
    [0, 1, 0, 0],
  ]));
}

function dlxsolve(mat) {
  // https://arxiv.org/pdf/cs/0011047

  // init arrays by index
  let head = { headOfHeads: true };
  let colArrays = [[head]], rowArrays = [[head]];
  for (let i=0; i<mat.length; i++) {
    for (let j=0; j<mat[i].length; j++) {
      let x = mat[i][j];
      if (x) {
        // header row
        let colHead = rowArrays[0][j+1] = rowArrays[0][j+1] || { head: true, n: 0 };

        let node = { i, j, colHead };
        rowArrays[i+1] = rowArrays[i+1] || [];
        rowArrays[i+1][j+1] = node;

        colArrays[j+1] = colArrays[j+1] || [];
        colArrays[j+1][0] = colHead;
        colArrays[j+1][i+1] = node;

        colHead.n += 1;
      }
    }
  }

  // init doubly linked lists
  for (let [arrays, fw] of [[rowArrays, RT], [colArrays, DN]]) {
    let bk = BK[fw];
    for (let j in arrays) {
      let array = arrays[j];
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
  }

  // main algorithm

  function iterFrom(node, fw, nodeFn) {
    let next = node[fw];
    while (next != node) {
      let ret = nodeFn(next, fw);
      if (ret) {
        return ret;
      }
      next = next[fw];
    }
  }

  function excise(node, fw) {
    let bk = BK[fw];
    node[bk][fw] = node[fw];
    node[fw][bk] = node[bk];
  }

  function restore(node, fw) {
    let bk = BK[fw];
    node[bk][fw] = node;
    node[fw][bk] = node;
  }

  function coverCol(colHead) {
    excise(colHead, RT);
    iterFrom(colHead, DN, inCol => {
      iterFrom(inCol, RT, inRow => {
        excise(inRow, DN);
        inRow.colHead.n -= 1;
      });
    });
  }

  function uncoverCol(colHead) {
    iterFrom(colHead, UP, inCol => {
      iterFrom(inCol, LT, inRow => {
        restore(inRow, UP);
        inRow.colHead.n += 1;
      });
    });
    restore(colHead, LT);
  }

  function cover(head, solution=[]) {
    if (head.rt == head) {
      return solution;
    }

    let min = Infinity;
    let nextCol;
    iterFrom(head, RT, colHead => {
      let { n } = colHead;
      if (n < min) {
        min = n;
        nextCol = colHead;
      }
    });

    coverCol(nextCol);
    let ret = iterFrom(nextCol, DN, choice => {
      solution.push(choice);
      iterFrom(choice, RT, node => coverCol(node.colHead));

      if (cover(head, solution)) {
        return solution;
      }

      iterFrom(choice, LT, node => uncoverCol(node.colHead));
      solution.pop();
    });
    uncoverCol(nextCol);

    if (ret) {
      return ret;
    }
  }

  let solution = cover(head);
  if (solution) {
    let solutionArray = [];
    for (let node of solution) {
      solutionArray[node.i] = [true];
    }
    return solutionArray
  } else {
    throw new Error("No solution found!")
  }
}