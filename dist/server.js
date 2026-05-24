import express, {} from "express";
import { Pool } from "pg";
import config from "./config";
const app = express();
const port = config.port;
// Middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
const pool = new Pool({
    connectionString: config.connection_string
});
const initDB = async () => {
    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(20) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            age INT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log("Database Connected Successfully");
    }
    catch (error) {
        console.log(error);
    }
};
initDB();
app.get("/user", (req, res) => {
    //   res.send("hello world");
    res.status(200).json({
        message: "Express sever",
        author: "Next level",
    });
});
app.post("/api/users", async (req, res) => {
    //   console.log(req.body);
    const { name, email, password, age } = req.body;
    try {
        const result = await pool.query(`
      INSERT INTO users (name,email,password,age)
      VALUES ($1,$2,$3,$4)
      RETURNING *
    `, [name, email, password, age]);
        // console.log(result);
        res.status(201).json({
            success: true,
            message: "User Created Successfully!",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(599).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT * FROM users`);
        res.status(200).json({
            success: true,
            message: "User retrived successfully",
            data: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.get("/api/users/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query(`
      SELECT * FROM users
      WHERE id = $1;
        `, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                // data: {},
            });
        }
        res.status(200).json({
            success: true,
            message: "User retrived successfully",
            data: result.rows[0],
        });
        console.log(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { name, password, age, is_active } = req.body;
        // console.log( id,name, password, age, is_active);
        const result = await pool.query(`UPDATE users
    SET name =COALESCE($1,name),
    password = COALESCE($2,password),
    age =  COALESCE($3,age),
    is_active =  COALESCE($4,is_active)
    WHERE id = $5 RETURNING *`, [name, password, age, is_active, id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                // data: {},
            });
        }
        // console.log(result);
        res.status(200).json({
            success: true,
            message: "User Updated successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`DELETE FROM users
      WHERE id=$1`, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                // data: {},
            });
        }
        res.status(200).json({
            success: true,
            message: "User Deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.listen(port, () => {
    console.log(`app is listening port ${port}`);
});
//# sourceMappingURL=server.js.map