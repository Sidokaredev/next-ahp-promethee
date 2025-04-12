export class AHP {
  scales: Record<number, string> = {
    1: "Sama penting",
    3: "Sedikit lebih penting",
    5: "Jelas lebih penting",
    7: "Sangat penting",
    9: "Sangat ekstrim penting",
    2: "Antara sama penting dan sedikit lebih penting",
    4: "Antara sedikit penting dan jelas lebih penting",
    6: "Antara jelas lebih penting dan sangat penting",
    8: "Antara sangat penting dan sangat ekstrim penting",
  }
  private criteria: string[] = [];
  private pairwiseMatrix: number[][] = [];
  constructor(init: {
    criteria: string[];
    pairwiseComparisonMatrix: number[][];
  }) {
    this.criteria = init.criteria;
    this.pairwiseMatrix = init.pairwiseComparisonMatrix;
  }

  PairwiseComparison(): string[][] {
    return this.criteria.reduce((prev, val, idx) => {
      const comparedCriteria = this.criteria.slice(idx);
      if (comparedCriteria.length <= 1) return prev
      comparedCriteria.forEach((_, i) => {
        if (i == 0 || i == comparedCriteria.length) return
        prev.push([val, comparedCriteria[i]]);
      });
      return prev;
    }, [] as string[][]);
  }

  SetPairwiseMatrix(pairwiseScale: Map<string[], number>): void {
    const rows = this.criteria.length;
    const columns = this.criteria.length;
    const scaleIterator = pairwiseScale.entries();
    for (let i = 0; i < rows; i++) {
      let data: number[] = [];
      for (let j = 0; j < columns; j++) {
        if (i == j) {
          data.push(1);
          continue;
        }
        if (j < (i + 1)) {
          data.push(this.pairwiseMatrix[j][i])
        }
      }
    }
  }

  Draft() {
    // const pairwiseComparison = criteria.reduce((prev, val, idx) => {
    //   criteria.forEach((column, i) => {
    //     prev.push([val, column]);
    //     // console.log(`[${val}] dibandingkan [${column}]`)
    //   })
    //   return prev;
    // }, [] as string[][]);

    const criteriaLength = 4
    const pairwisematrix: number[][] = [
      // [1, 1/5, 3, 4],
      // [5, 1, 9, 7],
      // [1/3, 1/9, 1, 2],
      // [1/4, 1/7, 1/2, 1]
      [4.000, 1.305, 9.800, 15.400],
      [14.750, 4.000, 36.500, 52.000],
      [1.722, 0.575, 4.000, 6.111],
      [1.381, 0.391, 3.036, 4.000]
    ];

    const squaringMatrix: number[][] = [];

    for (let idx = 0; idx < criteriaLength; idx++) {
      // console.log(`column ke ${idx}: ${pairwisematrix[idx]}`)
      let rowWeightPerColumn: number[] = [];
      for (let rowIndex = 0; rowIndex < pairwisematrix.length; rowIndex++) {
        let perColumn: number = 0;
        for (let columnIndex = 0; columnIndex < pairwisematrix[idx].length; columnIndex++) {
          perColumn += pairwisematrix[idx][columnIndex] * pairwisematrix[columnIndex][rowIndex];
          // console.log(`M[${idx}][${columnIndex}] x M[${columnIndex}][${rowIndex}]`);
        }
        // console.log('-----------------------')
        // console.log("total per column: ", perColumn);
        rowWeightPerColumn.push(Number(perColumn.toFixed(3)));
      }
      // console.log(`nilai per row: ${rowWeightPerColumn}`)
      squaringMatrix.push(rowWeightPerColumn);
    }

    // console.log(squaringMatrix);

    let divider: number = 0
    const totalSquaringMatrix = squaringMatrix.map(row => {
      let total: number = 0
      row.forEach(value => {
        total += value
      })

      divider += total;
      return total;
    })

    console.log(totalSquaringMatrix)
    console.log(`divider : ${divider}`);
    totalSquaringMatrix.forEach((value, index) => {
      console.log(`K${index + 1} => ${((value / divider) * 1).toFixed(3)}`)
    })
  }
}