import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserInfoDB = async (payload: {
  email: string;
  password: string;
}) => {
    const { email,password} = payload;

    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `,[email]);
        // console.log(user);
        if(userData.rows.length ===0){
            throw new Error("Invalid Credential!");
        }
        const user  = userData.rows[0];
        // console.log(user);
        const matchPassword = await bcrypt.compare(password,user.password);
        if(!matchPassword){
            throw new Error("Invalid Credential!");
        }
        //generate token

        const jwtPayLoad = {
            id : user.id,
            name : user.name,
            role: user.role,
            is_active : user.is_active,
            email : user.email,
        }
        const accessToken = jwt.sign(jwtPayLoad,config.secret as string,{expiresIn: "1d"});
        return {accessToken};
    };

export const authService = {
  loginUserInfoDB,
};
