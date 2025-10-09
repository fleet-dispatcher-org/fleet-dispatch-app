import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming request body:", body);
    const payload = {
      vehicles: body.vehicles,
      shipments: body.shipments,
      options: {
        router: "osrm",
        host: "localhost",
        port: 5000,
      }
    };
    console.log("VROOM payload:", payload);
    const response = await fetch("http://localhost:4000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("VROOM error response:", text);
      return NextResponse.json({ error: "VROOM request failed", details: text }, { status: response.status });
    }

    const data = await response.json();
    console.log("VROOM response:", data);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("VROOM proxy error:", err);
    return NextResponse.json({ error: "Unexpected server error", details: err.message }, { status: 500 });
  }
}
