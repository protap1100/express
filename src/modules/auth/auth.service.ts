import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginUserInfoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );
  // console.log(user);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential!");
  }
  const user = userData.rows[0];
  // console.log(user);
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credential!");
  }
  //generate token

  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    email: user.email,
  };
  const accessToken = jwt.sign(jwtPayLoad, config.secret as string, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(jwtPayLoad, config.refresh_secret as string, {
    expiresIn: "365d",
  });
  return { accessToken, refreshToken };
};

const generateRefreshToken = async (token: string) => {
  console.log(token);
  if (!token) {
    throw new Error("Unauthorized");
  }
  const decoded = jwt.verify(
    token as string,
    config.refresh_secret as string,
  ) as JwtPayload;

  console.log("Decoded", decoded);

  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email =$1`,
    [decoded.email],
  );
  // console.log(userData);
  const user = userData.rows[0];
  // console.log(user);
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }

  if (!user.is_active) {
    throw new Error("Forbidden access");
  }

  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    email: user.email,
  };
  const accessToken = jwt.sign(jwtPayLoad, config.secret as string, {
    expiresIn: "1d",
  });
  return { accessToken };
};

export const authService = {
  loginUserInfoDB,
  generateRefreshToken,
};
