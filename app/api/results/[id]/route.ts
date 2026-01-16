import { getResult } from "@/lib/db/kv";

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const result = await getResult(params.id);
  if (!result) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(result);
}
