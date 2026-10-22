"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import CopyLinkField from "@/components/CopyLinkField";
import Image from "@/components/Image";
import InfoRow from "@/components/InfoRow";
import Input from "@/components/Input";
import InvitationCover from "@/components/InvitationCover";
import Label from "@/components/Label";
import NavBar from "@/components/NavBar";
import SuccessIcon from "@/components/SuccessIcon";
import Textarea from "@/components/Textarea";
import { createInvitation } from "@/lib/actions";
import { LIMITS } from "@/lib/limits";

// /create : 호스트가 초대장 내용을 입력하고, 미리보기를 보며 발행한다 (Figma node 69:906)
export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [body, setBody] = useState("");

  // 발행된 초대장 id. 값이 있으면 같은 화면이 발행 완료 상태로 바뀐다
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 필수값이 하나라도 비어 있으면 발행 버튼을 막는다
  const canPublish = [title, date, location, body].every((v) => v.trim() !== "") && !pending;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      // Supabase에 저장하고 새로 만든 id를 받는다
      const id = await createInvitation({ title, date, location, body });
      setPublishedId(id);
      window.scrollTo(0, 0);
    } catch {
      setError("발행하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  }

  // 발행 완료 화면 (Figma node 69:926)
  if (publishedId) {
    const inviteUrl = `${window.location.origin}/i/${publishedId}`;

    return (
      <main className="mx-auto flex w-full max-w-mobile flex-col gap-20 bg-surface-default">
        <NavBar title="발행 완료" />
        <div className="flex w-full flex-col gap-40 px-page-horizontal pb-80">
          <div className="flex w-full flex-col items-center gap-12 py-24 text-center">
            <SuccessIcon />
            <h1 className="text-title-lg text-text-strong">초대장이 발행됐어요!</h1>
            <p className="text-body-md text-text-secondary">아래 두 링크를 복사해 두세요.</p>
          </div>
          <CopyLinkField
            title="초대장 링크"
            url={inviteUrl}
            description="게스트에게 공유하는 링크예요."
          />
          <CopyLinkField
            title="응답 현황 링크"
            url={`${inviteUrl}/responses`}
            description="호스트용이에요. 이 링크를 아는 사람은 응답 목록을 볼 수 있어요."
          />
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(`/i/${publishedId}`)}
          >
            내 초대장 보기
          </Button>
        </div>
      </main>
    );
  }

  return (
    // pb-120: 하단에 고정된 발행 버튼(높이 92px)에 마지막 내용이 가려지지 않게 하는 여백
    <main className="mx-auto flex w-full max-w-mobile flex-col gap-10 bg-surface-default pb-120">
      <NavBar title="초대장 만들기" />

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-40 px-page-horizontal pb-80">
        <div className="flex w-full flex-col gap-24">
          <Textarea
            id="title"
            name="title"
            maxLength={LIMITS.title}
            label="제목"
            rows={2}
            required
            placeholder={"예) 허들링 클럽 2번째\n오프라인 밋업"}
            helper="엔터로 줄을 나눌 수 있어요 · 최대 2줄"
            value={title}
            // 제목은 최대 2줄까지만 받는다
            onChange={(e) => setTitle(e.target.value.split("\n").slice(0, 2).join("\n"))}
          />
          <Input
            id="date"
            name="date"
            maxLength={LIMITS.date}
            label="일시"
            required
            placeholder="예) 2026년 11월 14일 (토) 09:00"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            id="location"
            name="location"
            maxLength={LIMITS.location}
            label="장소"
            required
            placeholder="예) 세종 남극 기지"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Textarea
            id="body"
            name="body"
            maxLength={LIMITS.body}
            label="본문"
            required
            placeholder="게스트에게 전할 초대 글을 적어주세요"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {/* 실시간 미리보기: 입력한 값을 그대로 보여준다 */}
        <section className="flex w-full flex-col gap-8" aria-label="미리보기">
          <Label>미리보기</Label>
          {/* 정해진 높이(h-preview) 안에서 스크롤된다 */}
          <div className="h-preview w-full overflow-y-auto overscroll-contain rounded-control border border-border-subtle bg-background-default">
            <InvitationCover title={title} date={date} location={location} />

            <div className="flex w-full flex-col items-center gap-16 bg-surface-default px-20 py-80">
              <Image type="2" alt="" />
              <p className="w-full whitespace-pre-wrap break-words text-center text-body-compact text-text-primary">
                {body}
              </p>
            </div>

            <div className="w-full bg-background-default px-20 pt-24 pb-40">
              <div className="flex w-full flex-col gap-10 rounded-card bg-surface-subtle p-20">
                <InfoRow label="일시" value={date} />
                <InfoRow label="장소" value={location} />
              </div>
            </div>
          </div>
          <p className="text-caption-md text-text-tertiary">
            입력하는 내용이 바로 미리보기에 반영돼요.
          </p>
        </section>

        {/* 화면 하단에 고정. 큰 화면에서도 375px 폭 가운데에 놓인다 */}
        <div className="fixed inset-x-0 bottom-0 flex justify-center">
          <div className="flex w-full max-w-mobile flex-col gap-8 bg-surface-default p-20">
            {error && <p className="text-caption-md text-feedback-error">{error}</p>}
            <Button type="submit" size="lg" disabled={!canPublish} className="w-full">
              발행하기
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
