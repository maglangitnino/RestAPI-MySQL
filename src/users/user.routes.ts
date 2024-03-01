import express, { Request, Response } from "express";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll();

        if (!allUsers || allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "No users found." });
        }

        return res.status(StatusCodes.OK).json({ total_users: allUsers.length, users: allUsers });
        } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});

userRouter.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user: UnitUser | null = await database.findOne(userId); // Corrected type

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `User with ID ${userId} not found.` });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});

userRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide username, email, and password." });
        }

        const existingUser = await database.findByEmail(email);
        if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "This email has already been registered." });
        }

        const newUser = await database.create({ username, email, password }); // Corrected argument
        return res.status(StatusCodes.CREATED).json({ newUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide email and password." });
        }

        const user = await database.findByEmail(email);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "No user found with the provided email." });
        }

        const validPassword = await database.comparePassword(email, password);
        if (!validPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Incorrect password." });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});

userRouter.put('/user/:id', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.params.id;

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide username, email, and password." });
        }

        const existingUser = await database.findOne(userId);
        if (!existingUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `User with ID ${userId} not found.` });
        }

        const updatedUser = await database.update(userId, { username, email, password }); // Corrected argument
        return res.status(StatusCodes.OK).json({ updatedUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});

userRouter.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const existingUser = await database.findOne(userId);

        if (!existingUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `User with ID ${userId} not found.` });
        }

        await database.remove(userId);
        return res.status(StatusCodes.OK).json({ msg: `User with ID ${userId} deleted.` });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});

userRouter.get("/users/search", async (req: Request, res: Response) => {
    try {
        const { name, email } = req.query;
        if (!name && !email) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide name or email for searching." });
        }

        let foundUsers: UnitUser[] = [];
        if (name) {
            foundUsers = await database.searchByName(name.toString());
        } else if (email) {
            foundUsers = await database.searchByEmail(email.toString());
        }

        return res.status(StatusCodes.OK).json({ total_users: foundUsers.length, users: foundUsers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});

export default userRouter;