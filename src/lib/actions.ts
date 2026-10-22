"use server";

// 브라우저에서 부르는 저장 함수 (Server Action). 서버에서 입력을 다시 검사한 뒤 저장한다.
import { LIMITS } from "@/lib/limits";
import { UUID_PATTERN } from "@/lib/invitations";
import { supabaseRequest } from "@/lib/supabase";

type InvitationInput = {
  title: string;
  date: string;
  location: string;
  body: string;
};

type RsvpInput = {
  name: string;
  status: "yes" | "no";
  companions: number;
};

// 글자 수가 1~max 사이인지 검사한다
function checkText(value: unknown, max: number): string {
  if (typeof value !== "string") throw new Error("잘못된 입력이에요.");
  const text = value.trim();
  if (text.length < 1 || text.length > max) throw new Error("잘못된 입력이에요.");
  return text;
}

// 초대장을 저장하고 새 id를 돌려준다
export async function createInvitation(input: InvitationInput): Promise<string> {
  const title = checkText(input.title, LIMITS.title);
  if (title.split("\n").length > 2) throw new Error("제목은 최대 2줄이에요.");

  const invitation = {
    id: crypto.randomUUID(), // 추측하기 어려운 고유 ID
    title,
    date: checkText(input.date, LIMITS.date),
    location: checkText(input.location, LIMITS.location),
    body: checkText(input.body, LIMITS.body),
  };

  await supabaseRequest("invitations", { method: "POST", body: invitation });
  return invitation.id;
}

// 참석 응답을 저장한다
export async function submitRsvp(invitationId: string, input: RsvpInput): Promise<void> {
  if (!UUID_PATTERN.test(invitationId)) throw new Error("잘못된 초대장이에요.");
  if (input.status !== "yes" && input.status !== "no") throw new Error("잘못된 입력이에요.");
  if (!Number.isInteger(input.companions) || input.companions < 0) {
    throw new Error("잘못된 입력이에요.");
  }

  await supabaseRequest("rsvps", {
    method: "POST",
    body: {
      invitation_id: invitationId,
      name: checkText(input.name, LIMITS.name),
      status: input.status,
      // 불참이면 동반 인원은 0
      companions: input.status === "yes" ? input.companions : 0,
    },
  });
}
