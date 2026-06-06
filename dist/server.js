

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
          CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(20) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            age INT,
            role VARCHAR(10) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        address TEXT,
        phone VARCHAR(15),
        gender VARCHAR(15),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserInfoDB = async (payLoad) => {
  const { name, email, password, age, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
          INSERT INTO users (name,email,password,age,role)
          VALUES ($1,$2,$3,$4,COALESCE($5,'user'))
          RETURNING * 
        `,
    [name, email, hashPassword, age, role]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUserFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM users`);
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT * FROM users
      WHERE id = $1`,
    [id]
  );
  return result;
};
var updateUserFromDB = async (id, payLoad) => {
  const { name, password, age, is_active } = payLoad;
  const result = await pool.query(
    `UPDATE users
    SET name =COALESCE($1,name),
    password = COALESCE($2,password),
    age =  COALESCE($3,age),
    is_active =  COALESCE($4,is_active)
    WHERE id = $5 RETURNING *`,
    [name, password, age, is_active, id]
  );
  return result;
};
var deleteUserFromDB = async (id) => {
  const result = await pool.query(
    `DELETE FROM users
      WHERE id=$1`,
    [id]
  );
  return result;
};
var userService = {
  createUserInfoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
  updateUserFromDB,
  deleteUserFromDB
};

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserInfoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUser = async (req, res) => {
  try {
    console.log("controller", req.user);
    const result = await userService.getAllUserFromDB();
    res.status(200).json({
      success: true,
      message: "User retrived successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromDB(id);
    res.status(200).json({
      success: true,
      message: "User retrived successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, password, age, is_active } = req.body;
    const result = await userService.updateUserFromDB(id, req.body);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found"
        // data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "User Updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDB(id);
    return res.status(200).json({
      success: true,
      message: "User Deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    console.log(roles);
    try {
      const token = req.headers.authorization;
      console.log(token);
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access!!"
        });
      }
      const decoded = jwt.verify(
        token,
        config_default.secret
      );
      console.log("Decoded", decoded);
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email =$1`,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden access"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var userRole = {
  admin: "admin",
  agent: "agent",
  user: "user"
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/", userController.createUser);
router.get("/", auth_default(userRole.admin, userRole.user), userController.getAllUser);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
var userRoute = router;

// src/modules/profile/profile.route.ts
import { Router as Router2 } from "express";

// src/modules/profile/profile.service.ts
var createProfileIntoDB = async (payload) => {
  const { user_id, bio, address, phone, gender } = payload;
  const user = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
        
        `,
    [user_id]
  );
  if (user.rows.length === 0) {
    throw new Error("User not exist");
  }
  const result = await pool.query(
    `
    INSERT INTO profiles(user_id,bio,address,phone,gender) VALUES($1,$2,$3,$4,$5) 
    RETURNING *`,
    [user_id, bio, address, phone, gender]
  );
  return result;
};
var profileService = {
  createProfileIntoDB
};

// src/modules/profile/profile.controller.ts
var createProfile = async (req, res) => {
  try {
    const result = await profileService.createProfileIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Profile Created Successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var profileController = {
  createProfile
};

// src/modules/profile/profile.route.ts
var router2 = Router2();
router2.post("/", profileController.createProfile);
var profileRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserInfoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credential!");
  }
  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    email: user.email
  };
  const accessToken = jwt2.sign(jwtPayLoad, config_default.secret, {
    expiresIn: "1d"
  });
  const refreshToken2 = jwt2.sign(jwtPayLoad, config_default.refresh_secret, {
    expiresIn: "365d"
  });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  console.log(token);
  if (!token) {
    throw new Error("Unauthorized");
  }
  const decoded = jwt2.verify(
    token,
    config_default.refresh_secret
  );
  console.log("Decoded", decoded);
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email =$1`,
    [decoded.email]
  );
  const user = userData.rows[0];
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
    email: user.email
  };
  const accessToken = jwt2.sign(jwtPayLoad, config_default.secret, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = {
  loginUserInfoDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserInfoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      // inProduction true;
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(201).json({
      success: true,
      message: "User Logged in Successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(req.cookies.refreshToken);
    res.status(201).json({
      success: true,
      message: "User Logged in Successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
router3.post("/refresh-token", authController.refreshToken);
var authRoute = router3;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method ->${req.method} - URL ->${Date.now()} - Time:-> ${req.url} 
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
import CookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(CookieParser());
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.get("/user", (req, res) => {
  res.status(200).json({
    message: "Express sever",
    author: "Next level"
  });
});
app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = async () => {
  await initDB();
  app_default.listen(port, () => {
    console.log(`app is listening port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map