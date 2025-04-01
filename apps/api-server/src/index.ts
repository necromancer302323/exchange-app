import express from "express";
import { createClient } from "redis";
import cors from "cors"

const app = express();
app.use(express.json());
app.use(cors())

const client = createClient({
    url: "redis://my-redis:6379",
  });
  
  
client.on('error', (err) => console.log('Redis Client Error', err));

app.post("/api/v1/order", async (req, res) => {
    const request=req.body
    console.log(req.body)
    try {
       await client.lPush("order",JSON.stringify(request))
        // Store in the database
        res.status(200).send("Submission received and stored.");
    } catch (error) {
        console.error("Redis error:", error);
        res.status(500).send("Failed to store submission.");
    }
});

async function startServer() {
    try {
        await client.connect();
        console.log("Connected to Redis");

        app.listen(3000,"0.0.0.0", () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();