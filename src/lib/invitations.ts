// Supabase에서 초대장과 응답을 읽는 함수. 서버 컴포넌트에서만 쓴다.
import { supabaseRequest } from "@/lib/supabase";

// 초대장: 제목 · 일시 · 장소 · 본문
export type Invitation = {
  id: string;
  title: string; // 최대 2줄, 줄바꿈(\n)은 그대로 보여준다
  date: string; // 일시. 화면에 보이는 글자 그대로 저장한다
  location: string; // 장소. 주소를 글자로만 표시한다
  body: string; // 본문. 줄바꿈(\n)은 그대로 보여준다
};

// 참석 응답: 이름 · 참석 여부 · 동반 인원
export type Rsvp = {
  id: string;
  invitationId: string;
  name: string;
  status: "yes" | "no"; // yes 참석 · no 불참
  companions: number; // 본인을 제외한 동반 인원. 불참이면 0
};

// 주소의 id가 UUID 모양인지 검사한다 (아니면 DB에 묻지 않고 "없음"으로 처리)
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// id로 초대장을 찾는다. 없으면 null
export async function getInvitation(id: string): Promise<Invitation | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const rows = await supabaseRequest<Invitation[]>(
    `invitations?id=eq.${id}&select=id,title,date,location,body`,
  );
  return rows[0] ?? null;
}

// 초대장의 응답 목록
export async function getRsvps(invitationId: string): Promise<Rsvp[]> {
  const rows = await supabaseRequest<
    {
      id: string;
      invitation_id: string;
      name: string;
      status: "yes" | "no";
      companions: number;
    }[]
  >(`rsvps?invitation_id=eq.${invitationId}&select=id,invitation_id,name,status,companions`);

  return rows.map((r) => ({
    id: r.id,
    invitationId: r.invitation_id,
    name: r.name,
    status: r.status,
    companions: r.companions,
  }));
}
