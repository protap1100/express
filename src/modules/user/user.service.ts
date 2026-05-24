import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserInfoDB = async (payLoad: IUser) => {
  const { name, email, password, age } = payLoad;
  const result = await pool.query(
    `
          INSERT INTO users (name,email,password,age)
          VALUES ($1,$2,$3,$4)
          RETURNING *
        `,
    [name, email, password, age],
  );
  return result;
};

const getAllUserFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM users`);
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM users
      WHERE id = $1`,
    [id],
  );
  return result;
};

const updateUserFromDB = async (id: string,payLoad:IUser) => {
  const { name, password, age, is_active } = payLoad;
  // console.log( id,name, password, age, is_active);
  const result = await pool.query(
    `UPDATE users
    SET name =COALESCE($1,name),
    password = COALESCE($2,password),
    age =  COALESCE($3,age),
    is_active =  COALESCE($4,is_active)
    WHERE id = $5 RETURNING *`,
    [name, password, age, is_active, id],
  );
  return result;
};

const deleteUserFromDB = async (id: string) => {
  // console.log( id,name, password, age, is_active);
 const result = await pool.query(
      `DELETE FROM users
      WHERE id=$1`,
      [id],
    );
  return result;
};

export const userService = {
  createUserInfoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
  updateUserFromDB,
  deleteUserFromDB
};
