import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "@/components/Image";
import InfoRow from "@/components/InfoRow";
import InvitationCover from "@/components/InvitationCover";
import RSVPCard from "@/components/RSVPCard";
import { submitRsvp } from "@/lib/actions";
import { getInvitation } from "@/lib/invitations";

// /i/[id] : 게스트가 초대장을 보고 참석 여부를 보낸다 (Figma node 74:525)
export default function InvitePage({ params }: PageProps<"/i/[id]">) {
  return (
    <main className="mx-auto w-full max-w-mobile">
      {/* 주소의 id는 요청 때 정해지는 값이라 Suspense 안에서 읽는다 */}
      <Suspense>
        <Invitation params={params} />
      </Suspense>
    </main>
  );
}

async function Invitation({ params }: Pick<PageProps<"/i/[id]">, "params">) {
  const { id } = await params;
  const invitation = await getInvitation(id);

  if (!invitation) notFound();

  return (
    <>
      <InvitationCover
        title={invitation.title}
        date={invitation.date}
        location={invitation.location}
      />

      <div className="flex w-full flex-col items-center gap-16 bg-surface-default px-20 py-80">
        <Image type="2" alt="" />
        <p className="w-full whitespace-pre-wrap break-words text-center text-body-compact text-text-primary">
          {invitation.body}
        </p>
      </div>

      <div className="w-full bg-background-default px-20 pt-24 pb-40">
        <div className="flex w-full flex-col gap-10 rounded-card bg-surface-subtle p-20">
          <InfoRow label="일시" value={invitation.date} />
          <InfoRow label="장소" value={invitation.location} />
        </div>
      </div>

      {/* 참석 신청 카드. 제출하면 Supabase에 저장하고 같은 자리에서 완료 화면으로 바뀐다 */}
      <div className="w-full bg-background-subtle px-20 pt-40 pb-60">
        <RSVPCard onSubmit={submitRsvp.bind(null, invitation.id)} />
      </div>
    </>
  );
}
