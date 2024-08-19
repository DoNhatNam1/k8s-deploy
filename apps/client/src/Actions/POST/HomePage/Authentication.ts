"use server";

import { prisma } from "@shared/configs";
import { AccountType, SignupType } from '@shared/types'
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";


let path = process.env.NEXT_PUBLIC_HOSTNAME_PATH
let key = new TextEncoder().encode(String(process.env.SECRET_KEY));

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10 sec from now")
    .sign(key);
}

export async function encryptData(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5 minutes from now")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(InputData: AccountType, splitHostName: string) {
  let user = null;

  switch (InputData.role) {
    case "Admin":
      user = await prisma.tbAdmin.findFirst({
        where: {
          phone_number: InputData.phone_number,
          password: InputData.password,
        },
      });
      break;

    case "Agency":
      user = await prisma.tbAgencyAccount.findFirst({
        where: {
          phone_number: InputData.phone_number,
          password: InputData.password,
        },
      });
      break;

    case "SubAccount":
      user = await prisma.tbSubAccount.findFirst({
        where: {
          phone_number: InputData.phone_number,
          password: InputData.password,
        },
      });
      break;

    default:
      return { success: false, message: 'Sai thông tin đăng nhập, vui lòng thử lại!', redirect: false};
  }

  if (user === null || user.urlhost !== splitHostName) {
    return { success: false, message: 'Sai thông tin đăng nhập, vui lòng thử lại!', redirect: false};
  }

  const expires = new Date(Date.now() + 10 * 1000);
  const token = await encrypt({ user, expires });

  cookies().set(`${process.env.COOKIES_TOKEN_NAME}`, token, { expires, httpOnly: true });

  return { success: true, message: 'Đăng nhập thành công', redirect: `http://${splitHostName}.${path}/dashboard`};
}


export async function checkSignUpData(InputData: SignupType) {
  const expires = new Date(Date.now() + 5 * 60 * 1000);
    const dataSignup = await encryptData({ InputData, expires })
  const query = await prisma.tbAgencyAccount.findUnique({
    where: {
      phone_number: InputData.phone_number,
    }
  });

  if (query) {
    return { success: false, message: 'Số điện thoại này đã có tài khoản tồn tại!' };
  }

  if (cookies().get(`${process.env.COOKIES_SIGNUP_STEP_ONE_DATA_NAME}`)) {
    cookies().delete(`${process.env.COOKIES_SIGNUP_STEP_ONE_DATA_NAME}`);
  }

  cookies().set({
    name: `${process.env.COOKIES_SIGNUP_STEP_ONE_DATA_NAME}`,
    sameSite: 'lax',
    secure: true,
    value: dataSignup,
    httpOnly: true,
    path: '/signup/choose-bussiness',
    expires: expires,
  });

  return { success: true, message: 'Dữ liệu đăng ký hợp lệ' };
}

export async function getSignUpStepOne() {
  const data = cookies().get(`${process.env.COOKIES_SIGNUP_STEP_ONE_DATA_NAME}`)?.value;
  if (!data) return null;
  return await decrypt(data);
}

// export async function signup(InputData: SignupType){

// }

export async function logout() {
  // Destroy the session
  cookies().set(`${process.env.COOKIES_TOKEN_NAME}`, "", { expires: new Date(0) });

  redirect(`http://${path}`);
}

export async function getSession() {
  const token = cookies().get(`${process.env.COOKIES_TOKEN_NAME}`)?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get(`${process.env.COOKIES_TOKEN_NAME}`)?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: `${process.env.COOKIES_TOKEN_NAME}`,
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

