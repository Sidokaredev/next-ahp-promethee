import { DataAlternatifType } from "../administrator/pendaftar";

type UsualCriterion = {
  tipe: "Tipe I",
}
type UShapeCriterion = {
  tipe: "Tipe II",
  q: number;
}
type VShapeCriterion = {
  tipe: "Tipe III",
  p: number;
}
type LevelCriterion = {
  tipe: "Tipe IV",
  q: number;
  p: number;
}
type LinearCriterionWithIndifference = {
  tipe: "Tipe V",
  q: number;
  p: number;
}
type GaussianCriterion = {
  tipe: "Tipe VI",
  s: number;
}

export type FnPreferensiType = UsualCriterion | UShapeCriterion | VShapeCriterion | LevelCriterion | LinearCriterionWithIndifference | GaussianCriterion;

export type PrometheeInit = {
  namaKriteria: string;
  keyProp: string;
  keyFn?: (data: unknown) => number;
  // tipeFnPreferensi: UsualCriterion | UShapeCriterion | VShapeCriterion | LevelCriterion | LinearCriterionWithIndifference | GaussianCriterion;
  tipeFnPreferensi: {
    id: number,
    tipe: string,
    q: string | null,
    p: string | null,
    s: string | null,
  };
  kategori: "maksimasi" | "minimasi";
  weight: number;
}

type ColumnMatrixType = {
  nama: string;
  nilai: number;
}
export type RowMatrixType = {
  id: number; // id pendaftar
  nama: string;
  matrix: ColumnMatrixType[];
}
type DifferenceMatrixType = Record<string, RowMatrixType[]>;

export type IndexPreferenceMatrix = {
  id: number;
  nama: string;
  aggregatedMatrix: {
    nama: string;
    aggregated: number;
  }[]
}[];
export type LeavingFlowType = {
  id: number;
  nama: string;
  leavingFlow: number;
}[];
export type EnteringFlowType = {
  id: number;
  nama: string;
  enteringFlow: number;
}[];
export type NetFlowType = {
  id: number;
  nama: string;
  netFlow: number;
}[];

export class PrometheeUnstable {
  // props
  initProps: PrometheeInit[] = [];
  static fnPreferensi: Record<string, string> = {
    "Tipe I": "Usual Criterion",
    "Tipe II": "U-shape Criterion",
    "Tipe III": "V-shape Criterion",
    "Tipe IV": "Level Criterion",
    "Tipe V": "Linear Criterion with Indifference",
    "Tipe VI": "Gaussian Criterion",
  }
  kategoriFn: Record<"maksimasi" | "minimasi", (A: number, B: number) => number> = {
    "maksimasi": (A: number, B: number) => A - B,
    "minimasi": (A: number, B: number) => B - A,
  }

  alternatives: DataAlternatifType[] = [];
  differenceMatrix: DifferenceMatrixType = {};
  fnPreferenceMatrix: Record<string, RowMatrixType[]> = {};
  indexPreferenceMatrix: {
    nama: string;
    aggregatedMatrix: {
      nama: string;
      aggregated: number;
    }[]
  }[] = [];
  leavingFlowValues: {
    nama: string;
    leavingFlow: number;
  }[] = [];
  enteringFlowValues: {
    nama: string;
    enteringFlow: number;
  }[] = [];

  constructor(alternatives: DataAlternatifType[], init: PrometheeInit[]) {
    this.alternatives = alternatives;
    this.initProps = init;
  }

  ScoreDifferenceMatrix() {
    const deviasiBerpasangan: Record<string, RowMatrixType[]> = {};

    for (const props of this.initProps) {
      const key = props.keyProp as keyof DataAlternatifType;
      const { namaKriteria, kategori, keyFn } = props;
      const rowMatrix: RowMatrixType[] = [];

      for (const rowAlt of this.alternatives) {
        const columnMatrix: ColumnMatrixType[] = [];

        for (const columnAlt of this.alternatives) {
          const A = keyFn ? keyFn(rowAlt[key]) : rowAlt[key] as number;
          const B = keyFn ? keyFn(columnAlt[key]) : columnAlt[key] as number;

          const nilai = this.kategoriFn[kategori](A, B);
          columnMatrix.push({
            nama: columnAlt["nama_lengkap"],
            nilai,
          });
        }

        rowMatrix.push({
          id: rowAlt.id,
          nama: rowAlt["nama_lengkap"],
          matrix: columnMatrix
        });
      }

      deviasiBerpasangan[namaKriteria] = rowMatrix;
    }

    return deviasiBerpasangan;
  }
  ScoreFnPreferenceMatrix(differenceMatrix: Record<string, RowMatrixType[]>) {
    const fnPreferenceMatrix: Record<string, RowMatrixType[]> = {};

    for (const props of this.initProps) {
      const { namaKriteria, tipeFnPreferensi } = props;
      const rowMatrixValues: RowMatrixType[] = [];

      const rowMatrix = differenceMatrix[namaKriteria];
      for (const row of rowMatrix) {
        const columnMatrix: ColumnMatrixType[] = [];

        for (const column of row["matrix"]) {
          const fnPreferenceValue = this.ScoreFnPreference(column.nilai, tipeFnPreferensi);

          columnMatrix.push({
            nama: column.nama,
            nilai: fnPreferenceValue,
          })
        }

        rowMatrixValues.push({
          id: row.id,
          nama: row.nama,
          matrix: columnMatrix,
        })
      }

      fnPreferenceMatrix[namaKriteria] = rowMatrixValues;
    }

    return fnPreferenceMatrix;
  }
  ScorePreferenceIndex(preferenceMatrix: Record<string, RowMatrixType[]>) {
    const aggregatedIndexPreference: {
      id: number;
      nama: string;
      aggregatedMatrix: {
        nama: string;
        aggregated: number;
      }[]
    }[] = [];

    for (let rowIdx = 0; rowIdx < this.alternatives.length; rowIdx++) {
      const aggregatedMatrix: {
        nama: string;
        aggregated: number;
      }[] = [];

      for (let columnIdx = 0; columnIdx < this.alternatives.length; columnIdx++) {
        let aggregatedFnPreference: number = 0;

        for (const props of this.initProps) {
          const { namaKriteria, weight } = props;

          const value = preferenceMatrix[namaKriteria][rowIdx]["matrix"][columnIdx]["nilai"]
          aggregatedFnPreference += (value * weight);
        }

        aggregatedMatrix.push({
          nama: this.alternatives[columnIdx]["nama_lengkap"],
          aggregated: aggregatedFnPreference,
        })

      }

      aggregatedIndexPreference.push({
        id: this.alternatives[rowIdx]["id"],
        nama: this.alternatives[rowIdx]["nama_lengkap"],
        aggregatedMatrix
      })
    }

    return aggregatedIndexPreference;
  }
  ScoreLeavingFlow(indexPreferenceMatrix: IndexPreferenceMatrix) {
    const rowLeavingFlow: {
      id: number;
      nama: string;
      leavingFlow: number;
    }[] = [];

    for (const row of indexPreferenceMatrix) {
      let columnTotal: number = 0;

      for (const column of row.aggregatedMatrix) {
        columnTotal += column.aggregated
      }

      const leavingFlowValue = 1 / (indexPreferenceMatrix.length - 1) * columnTotal;
      rowLeavingFlow.push({
        id: row.id,
        nama: row.nama,
        leavingFlow: leavingFlowValue,
      })
    }

    return rowLeavingFlow;
  }
  ScoreEnteringFlow(indexPreferenceMatrix: IndexPreferenceMatrix) {
    const rowEnteringFlow: {
      id: number;
      nama: string;
      enteringFlow: number;
    }[] = [];

    for (let row = 0; row < indexPreferenceMatrix.length; row++) {
      let columnTotal: number = 0;

      for (let column = 0; column < indexPreferenceMatrix.length; column++) {
        columnTotal += indexPreferenceMatrix[column]["aggregatedMatrix"][row]["aggregated"];
      }

      const enteringFlowValue = 1 / (indexPreferenceMatrix.length - 1) * columnTotal;
      rowEnteringFlow.push({
        id: indexPreferenceMatrix[row]["id"],
        nama: indexPreferenceMatrix[row]["nama"],
        enteringFlow: enteringFlowValue,
      })
    }

    return rowEnteringFlow;
  }
  ScoreNetFlow(leavingFlow: {
    id: number;
    nama: string;
    leavingFlow: number;
  }[], enteringFlow: {
    id: number;
    nama: string;
    enteringFlow: number;
  }[]) {
    const netFlowValues: {
      id: number;
      nama: string;
      netFlow: number;
    }[] = [];

    for (let l = 0; l < leavingFlow.length; l++) {

      const enteringFlowObj = enteringFlow.find(enter => enter.id == leavingFlow[l].id);
      if (!enteringFlowObj) {
        throw new Error(`entering flow with id ${leavingFlow[l]["id"]} doesnt exist`);
      }

      const netFlow: number = leavingFlow[l]["leavingFlow"] - enteringFlowObj["enteringFlow"];
      // for (let e = 0; e < enteringFlow.length; e++) {
      //   netFlow = leavingFlow[l]['leavingFlow'] - enteringFlow[e]["enteringFlow"];
      // }


      netFlowValues.push({
        id: leavingFlow[l]["id"],
        nama: leavingFlow[l]["nama"],
        netFlow
      })
    }

    return netFlowValues;
  }
  // utils
  ScoreFnPreference(value: number, fnPreference: {
    id: number,
    tipe: string,
    q: string | null,
    p: string | null,
    s: string | null,
  }): number {
    switch (fnPreference.tipe) {
      case "Tipe I":
        return value <= 0 ? 0 : 1;

      case "Tipe II":
        return value <= Number(fnPreference.q) ? 0 : 1;

      case "Tipe III":
        return value <= 0 ? 0 : // d <= 0
          (value > 0 && value < Number(fnPreference.p)) ? (value / Number(fnPreference.p)) : // 0 < d < p
            1; // d >= p

      case "Tipe IV":
        return value <= Number(fnPreference.q) ? 0 : // d <= q
          (value > Number(fnPreference.q) && value <= Number(fnPreference.p)) ? 0.5 : // q < d <= p
            1; // d > p

      case "Tipe V":
        return value <= Number(fnPreference.q) ? 0 :
          (value > Number(fnPreference.q) && value < Number(fnPreference.p)) ? ((value - Number(fnPreference.q)) / (Number(fnPreference.p) - Number(fnPreference.q))) :
            1;

      case "Tipe VI":
        const euler = 2.71828
        return 1 - Math.pow(euler, -((Math.pow(value, 2)) / (2 * (Math.pow(Number(fnPreference.s), 2)))));

      default:
        const err = new Error("Tipe Fungsi Preferensi Tidak Terdefinisi", { cause: `fungsi preferensi tidak terdefinisi` });
        err.name = "tidak terdefinisi";
        throw err;
    }
  }
}