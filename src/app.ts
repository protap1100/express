import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { userRoute } from "./modules/user/user.route";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/user", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express sever",
    author: "Next level",
  });
});

app.use("/api/users",userRoute);



export default app
