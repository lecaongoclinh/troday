// A command with an uncertain outcome must retain the same payload and key on retry.
export class MutationAttempt {
  key: string;
  fingerprint?: string;
  uncertain = false;
  busy = false;
  private createKey: () => string;
  constructor(createKey: () => string) {
    this.createKey = createKey;
    this.key = createKey();
  }
  begin(payload: unknown) {
    if (this.busy) throw new Error("Thao tác đang được xử lý.");
    const next = JSON.stringify(payload);
    if (this.uncertain && this.fingerprint !== next)
      throw new Error(
        "Chưa rõ kết quả lần gửi trước. Vui lòng thử lại cùng nội dung trước khi sửa.",
      );
    if (this.fingerprint && this.fingerprint !== next)
      this.key = this.createKey();
    this.fingerprint = next;
    this.busy = true;
    return this.key;
  }
  finish(uncertain = false) {
    this.busy = false;
    this.uncertain = uncertain;
  }
}
