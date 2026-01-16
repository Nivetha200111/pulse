import { getResult } from "@/lib/db/kv";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const result = await getResult(id);
  if (!result) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(result);
}
