import { SkalaPerbandinganType } from "../administrator/data-algrthm";

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
  };
  randomIndex: Record<number, number> = {
    1: 0.00,
    2: 0.00,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49,
  };
  // var@kriteria
  private criteria: string[] = [];
  // var@skala-perbandingan
  private pairwiseMatrix: Record<string, SkalaPerbandinganType> = {};
  pairwiseMatrixInTotal: Record<string, number> = {};
  pairwiseMatrixInNormalized: Record<string, number> = {};
  pairwiseMatrixInWeight: Record<string, number> = {};
  pairwiseMatrixInConsistency: Record<string, number> = {};
  // var@consistency
  consistencyInTotal: Record<string, number> = {};
  consistencyInLamda: Record<string, number> = {};
  consistencyLamdaMax: number = 0;
  consistencyIndex: number = 0;
  consistencyRatio: number = 0;


  constructor(init: {
    criteria: string[];
  }) {
    this.criteria = init.criteria;
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

  PairwiseComparisonFields(): string[][] {
    return this.criteria.map((row) => {
      const columns = this.criteria.map((column) => {
        return `${row}@${column}`;
      });

      return [...columns];
    });
  }

  StorePairwiseMatrix(pairwiseMatrix: Record<string, SkalaPerbandinganType>) {
    // Total nilai skala perbandingan berpasangan secara vertical;
    // let pairwiseInTotal: string[] = [];
    for (let row = 0; row < this.criteria.length; row++) {
      let rowInTotal: number = 0;
      for (let col = 0; col < this.criteria.length; col++) {
        rowInTotal += Number(pairwiseMatrix[`${this.criteria[col]}@${this.criteria[row]}`]["nilai"]);
      }

      this.pairwiseMatrixInTotal[this.criteria[row]] = rowInTotal;
      // pairwiseInTotal.push(rowInTotal.toFixed(3));
    }

    this.pairwiseMatrix = pairwiseMatrix;
    return this;
  }

  NormalizationPairwiseMatrix() {
    let pairwiseInNormalization: Record<string, number> = {};
    for (let row = 0; row < this.criteria.length; row++) {
      const rowInNormalization: Record<string, number> = {};
      let weight: number = 0;
      for (let column = 0; column < this.criteria.length; column++) {
        const key = `${this.criteria[row]}@${this.criteria[column]}`;

        const unnormalizedMatrix = Number(this.pairwiseMatrix[key]["nilai"]);
        const criteriaInTotal = Number(this.pairwiseMatrixInTotal[`${this.criteria[column]}`]);
        const normalizedMatrix = (unnormalizedMatrix / criteriaInTotal);

        rowInNormalization[key] = normalizedMatrix;

        weight += normalizedMatrix;
      }

      pairwiseInNormalization = {
        ...pairwiseInNormalization,
        ...rowInNormalization
      }

      this.pairwiseMatrixInWeight[this.criteria[row]] = (weight / this.criteria.length);
    }

    this.pairwiseMatrixInNormalized = pairwiseInNormalization;
  }

  ConsistencyRasio() {
    let pairwiseMatrixInConsistency: Record<string, number> = {};
    const consistencyInTotal: Record<string, number> = {};
    const consistencyInLamda: Record<string, number> = {};

    for (let row = 0; row < this.criteria.length; row++) {
      const rowInConsistency: Record<string, number> = {};
      let rowInTotal: number = 0;
      for (let column = 0; column < this.criteria.length; column++) {
        const key = `${this.criteria[row]}@${this.criteria[column]}`;

        const pairwiseMatrix = Number(this.pairwiseMatrix[key]["nilai"]);
        const weight = Number(this.pairwiseMatrixInWeight[this.criteria[column]]);

        rowInConsistency[key] = (pairwiseMatrix * weight);
        rowInTotal += (pairwiseMatrix * weight);
      }

      pairwiseMatrixInConsistency = {
        ...pairwiseMatrixInConsistency,
        ...rowInConsistency,
      }

      consistencyInTotal[this.criteria[row]] = rowInTotal;
      consistencyInLamda[this.criteria[row]] = (rowInTotal / (Number(this.pairwiseMatrixInWeight[this.criteria[row]])));
    }

    this.pairwiseMatrixInConsistency = pairwiseMatrixInConsistency;
    this.consistencyInTotal = consistencyInTotal;
    this.consistencyInLamda = consistencyInLamda;

    let lamdaMax: number = 0;
    for (const key in this.consistencyInLamda) {
      lamdaMax += Number(this.consistencyInLamda[key]);
    }

    this.consistencyLamdaMax = (lamdaMax / Object.keys(this.consistencyInLamda).length);
    this.consistencyIndex = (Number(this.consistencyLamdaMax) - this.criteria.length) / (this.criteria.length - 1);
    this.consistencyRatio = this.consistencyIndex / this.randomIndex[this.criteria.length];
  }

  Validate() {
    this.NormalizationPairwiseMatrix();
    this.ConsistencyRasio();
  }
}