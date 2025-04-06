import express from "express";
import { createClient } from "redis";
import cors from "cors"
import { PrismaClient } from "@repo/db";
import jwt from "jsonwebtoken"
import { signinInput, signupInput } from "@repo/common";
const app = express();
app.use(express.json());
app.use(cors())
const client = createClient({
    url: "redis://my-redis:6379",
});

const prisma = new PrismaClient()
client.on('error', (err) => console.log('Redis Client Error', err));

app.post("/api/v1/order", async (req, res) => {
    const request = req.body
    console.log(req.body)
    try {
        await client.lPush("order", JSON.stringify(request))
        // Store in the database
        res.status(200).send("Submission received and stored.");
    } catch (error) {
        console.error("Redis error:", error);
        res.status(500).send("Failed to store submission.");
    }
});

app.post("/signup", async (req, res) => {
    const request = req.body
    const { success } = signupInput.safeParse(request);
    if (!success) {
        res.status(400);
        res.send("invalid syntax")
        console.log(req.body)
    } else {
        const user = await prisma.user.findFirst({
            where: {
                email: request.email
            }
        })
        if (user) {
            res.send("user with this id already exists")
        }
        try {
            await prisma.user.create({
                data: request
            })
            res.send("succesfullt signed up")
        } catch (err) {
            console.log(err)
            res.send("an error has occured please try again")
        }
    }
})


app.post("/signin", async (req, res) => {
    const request = req.body
    const { success } = signinInput.safeParse(request);
    if (!success) {
        res.status(400);
        console.log(success)
        res.json({ message: "invalid input" });
    } else {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: request.email,
                    password: request.password
                }
            })
            if (user) {
                const token = jwt.sign(JSON.stringify(user), "1122333")
                res.send(token)
            } else {
                res.send("check if you credentials are right")
            }
        } catch (err) {
            console.log(err)
            res.send("an error has occured please try again")
        }
    }
})


async function startServer() {
    try {
        await client.connect();
        console.log("Connected to Redis");

        app.listen(3000, "0.0.0.0", () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();