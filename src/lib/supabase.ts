// Supabase REST 호출 도우미. 새 패키지 없이 fetch만 쓴다.
// URL과 공개(anon) 키는 .env.local에서 읽는다.

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

export async function supabaseRequest<T = void>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      ".env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 넣어주세요.",
    );
  }

  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // 저장할 때는 결과 데이터를 돌려받지 않는다
      ...(method === "POST" ? { Prefer: "return=minimal" } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Supabase 요청 실패 (${res.status}): ${await res.text()}`);
  }
  // 저장 성공 시에는 응답 본문이 비어 있다
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
