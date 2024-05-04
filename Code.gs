const UP = Symbol("up");
const DN = Symbol("dn");
const LT = Symbol("lt");
const RT = Symbol("rt");

// backwards
const BK = {
  UP: DN, DN: UP,
  LT: RT, RT: LT,
};

// orthogonality
const ORT = {
  DN: RT, RT: DN,
  UP: LT, LT: UP,
}


function dlxsolve(mat) {
  // https://arxiv.org/pdf/cs/0011047

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
  for (let [array, fw] of [[colArrays, DN], [rowArrays, RT]]) {
    let bk = BK[fw];
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

  function coverCol(node) {
    iterFrom(node, DN, inCol => {
      excise(inCol, RT);
      iterFrom(inCol, RT, inRow => {
        excise(inRow, DN);
      });
    });
  }

  function uncoverCol(node) {
    iterFrom(node, UP, inCol => {
      restore(inCol, LT);
      iterFrom(inCol, RT, inRow => {
        excise(inRow, DN);
      });
    });
  }

  function cover(head, solution=[]) {
    let nextCol = head.rt;
    if (nextCol == head) {
      return solution;
    }

    coverCol(nextCol);
    iterFrom(nextCol, DN, choice => {
      solution.push(choice);
      iterFrom(choice, RT, coverCol);

      if (cover(head, solution)) {
        return solution;
      }

      iterFrom(choice, LT, uncoverCol);
      solution.pop();
    });
    uncoverCol(nextCol);
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