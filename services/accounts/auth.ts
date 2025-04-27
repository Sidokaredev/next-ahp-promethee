// import { z } from "zod";
// import { v4 as uuidv4 } from "uuid";
// /**
//  * Type
//  */
// type SignUpValuesType = z.infer<typeof SignUpSchema>;
// type fieldErrors = {
//   [fieldName: string]: string[] | undefined;
// }
// /**
//  * Schema
//  */
// export const SignUpSchema = z.object({
//   nama_lengkap: z.string().min(3),
//   universitas: z.string().min(10),
//   jurusan: z.string().min(3),
//   nim: z.string().min(3),
//   nomor_telepon: z.number(),
//   email: z.string().email(),
//   password: z.string().min(6),
//   confirm_password: z.string().min(6),
// }).refine(data => data.confirm_password === data.password);

// export class Authentication {
//   constructor() {

//   }

//   static async SignIn() {

//   }

//   static async SignUp(data: SignUpValuesType) {
//     const validate = SignUpSchema.safeParse(data);
//     if (!validate.success) {
//       const errorMsg = validate.error.flatten().fieldErrors;
//       return errorMsg;
//     };

//     const userId = uuidv4();

//   }
// }