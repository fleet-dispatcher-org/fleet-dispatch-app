import type { NextApiHandler, NextApiResponse } from "next";

const handler: NextApiHandler = async (req, res) => {
  try {
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "VROOM request failed" });
  }
};

export default handler;
