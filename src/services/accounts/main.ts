// 'use server';

// import { Authentication, SignUpValuesType } from "./auth";

// export async function DoSignUp(data: SignUpValuesType) {
//   const [signup, errsignup] = await Authentication.SignUp(data);
//   if (errsignup) {
//     return false;
//   }

//   console.log(signup.message);

//   return true;
// }