import express, { response } from "express";
import { createClient } from "redis";
import cors from "cors";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { signinInput, signupInput } from "@repo/common";
const app = express();
app.use(express.json());
app.use(cors());

const publisher = createClient({
  url: "redis://my-redis:6379",
});
const engine_pubsub = createClient({
  url: "redis://api-engine-pubsub:6379",
});

function createRandomId() {
  return Math.random().toString();
}
function sendAndAwait(message: any, market?: any) {
  return new Promise((resolve) => {
    const id = createRandomId();
    engine_pubsub.subscribe(id, (message) => {
      engine_pubsub.unsubscribe(id);
      resolve(JSON.parse(message));
    });
    publisher.lPush("order", JSON.stringify({ clientId: id, message, market }));
  });
}

app.post("/api/v1/order", async (req, res) => {
  const request = req.body;
  const { market } = req.query;
  const userId=jwt.verify(req.header("Authorization")||"","112233")
  try {
    if (request.type == "bid") {
      const response = await sendAndAwait({type:request.type,price:request.price,quantity:request.quantity,userId}, market);
      res.send(response);
    } else if (request.type == "ask") {
      const response = await sendAndAwait({type:request.type,price:request.price,quantity:request.quantity,userId}, market);
      res.send(response);
    } else {
      res.status(200).send("err has occured");
    }
  } catch (error) {
    console.error("Redis error:", error);
    res.status(500).send("Failed to store submission.");
  }
});
app.get("/api/v1/depth", async (req, res) => {
  const { market } = req.query;
  console.log(market);
  const response = await sendAndAwait({ type: "DEPTH" }, market);
  res.send(response);
});
app.post("/onRamp", async (req, res) => {
    const request=req.body
   const userId=jwt.verify(req.header("Authorization")||"","112233")
   const response = await sendAndAwait({ type: "OnRamp",userId,amount:request.amount });
res.send(response)
})
app.post("/signup", async (req, res) => {
  const request = req.body;
  const { success } = signupInput.safeParse(request);
  if (!success) {
    res.status(400);
    res.send("invalid syntax");
  } else {
    console.log(request.email)
    const user = await prisma.user.findFirst({
      where: {
        email: request.email,
      },
    });
    if (user) {
      res.send("user with this id already exists");
    }else{
    try {
      await prisma.user.create({
        data: request,
      });
      const userId= await prisma.user.findFirst({
        where:{email:request.email,
          password:request.password
        },
        select:{
          id:true
        }
      })
      const response=await sendAndAwait({type:"addUser",userId})
      console.log(response)
      res.send(response);
    } catch (err) {
      console.log(err);
      res.send("an error has occured please try again");
    }
  }
}
});

app.post("/signin", async (req, res) => {
  const request = req.body;
  const { success } = signinInput.safeParse(request);
  if (!success) {
    res.status(400);
    console.log(success);
    res.json({ message: "invalid input" });
  } else {
    try {
      const userId = await prisma.user.findUnique({
        where: {
          email: request.email,
          password: request.password,
        },
        select:{
          id:true
        }
      });
      if (userId) {
        const token = jwt.sign(JSON.stringify(userId), "112233");
        res.send(token);
      } else {
        res.send("check if you credentials are right");
      }
    } catch (err) {
      console.log(err);
      res.send("an error has occured please try again");
    }
  }
});

async function startServer() {
  try {
    await publisher.connect();
    await engine_pubsub.connect();
    console.log("Connected to Redis");

    app.listen(3000, "0.0.0.0", () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();
