import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { userRoute } from "./modules/user/user.route";
import { profileRoute } from "./modules/profile/profile.route";
import { authRoute } from "./modules/auth/auth.route";
import logger from "./middleware/logger";
import CookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
const app: Application = express();


// Middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(CookieParser());
var corsOptions = {
  origin: 'http://localhost:3000',
}
app.use(cors(corsOptions));

app.get("/user", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express sever",
    author: "Next level",
  });
});

app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler);



export default app;
