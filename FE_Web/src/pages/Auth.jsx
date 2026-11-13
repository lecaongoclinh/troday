import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Brand } from "../components/Layout";
import { Button, Field, Icon } from "../components/ui";
import { HeroArt } from "./Discover";
import { endpoint, schemas } from "../../../shared/api/catalog.ts";
import { validate } from "../../../shared/api/validation.ts";

function Password({ confirm = false }) {
    const [show, setShow] = useState(false);
    return (
        <Field label={confirm ? "Xác nhận mật khẩu" : "Mật khẩu"}>
            <span className="password-wrap">
                <input
                    name={confirm ? "confirmPassword" : "password"}
                    type={show ? "text" : "password"}
                    required
                    maxLength={72}
                    autoComplete={confirm ? "new-password" : "current-password"}
                    placeholder="Nhập mật khẩu"
                />
                <button
                    className="password-toggle"
                    type="button"
                    aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShow(!show)}
                >
                    {show ? "Ẩn" : "Hiện"}
                </button>
            </span>
        </Field>
    );
}
export default function Auth() {
    const app = useApp(),
        register = app.route.view === "register",
        forgot = app.route.view === "forgot-password";
    const [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [uncertain, setUncertain] = useState(false);
    async function submit(e) {
        e.preventDefault();
        if (busy || uncertain) return;
        const raw = Object.fromEntries(new FormData(e.currentTarget));
        if (register && raw.password !== raw.confirmPassword) {
            setError("Mật khẩu xác nhận chưa khớp.");
            return;
        }
        const spec = endpoint(register ? 1 : 2),
            checked = validate(spec.input, spec.inputFields, raw, schemas);
        if (Object.keys(checked.errors).length) {
            setError(Object.values(checked.errors)[0]);
            return;
        }
        setBusy(true);
        setError("");
        try {
            if (register) {
                await app.client.request(spec, { body: checked.body });
                app.notify("Đã tạo tài khoản. Bạn có thể đăng nhập.");
                app.navigate("login");
            } else await app.login(checked.body);
        } catch (err) {
            setError(
                err.message +
                    (err.ambiguous && register
                        ? " Chưa xác định tài khoản đã được tạo hay chưa. Hãy thử đăng nhập trước khi đăng ký lại."
                        : ""),
            );
            setUncertain(!!err.ambiguous && register);
        } finally {
            setBusy(false);
        }
    }
    return (
        <div className="auth-screen">
            <aside className="auth-story">
                <Brand />
                <h1>
                    Một nơi để ở.
                    <br />
                    Một chốn để về.
                </h1>
                <p>
                    Tìm không gian hợp gu, kết nối bạn cùng nhà và bắt đầu cuộc
                    sống của riêng bạn.
                </p>
                <HeroArt />
                <small>
                    © {new Date().getFullYear()} Trọday · Một chỗ ở. Nhiều an
                    tâm.
                </small>
            </aside>
            <div className="auth-form-side">
                <button
                    className="back-to-app"
                    onClick={() => app.navigate("discover")}
                >
                    <Icon name="arrow-left" />
                    Quay lại khám phá
                </button>
                <section className="auth-form-wrap">
                    <span className="eyebrow">CHÀO MỪNG ĐẾN VỚI TRỌDAY</span>
                    <h2>
                        {register
                            ? "Tạo một khởi đầu mới."
                            : forgot
                              ? "Quên mật khẩu?"
                              : "Vui được gặp lại bạn."}
                    </h2>
                    <p>
                        {register
                            ? "Tạo tài khoản để tìm nơi ở và lưu những điều bạn thích."
                            : "Đăng nhập để tiếp tục hành trình tìm nhà của bạn."}
                    </p>
                    {forgot ? (
                        <div className="subtle-panel">
                            <p>{endpoint(24).blockedReason}</p>
                            <Button onClick={() => app.navigate("login")}>
                                Quay lại đăng nhập
                            </Button>
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={submit}>
                            <fieldset
                                className="api-fieldset api-stack"
                                disabled={busy || uncertain}
                            >
                                {register && (
                                    <Field label="Họ và tên">
                                        <input
                                            name="fullName"
                                            required
                                            maxLength={150}
                                            autoComplete="name"
                                        />
                                    </Field>
                                )}
                                <Field
                                    label={
                                        register
                                            ? "Email"
                                            : "Email hoặc số điện thoại"
                                    }
                                >
                                    <input
                                        name={register ? "email" : "identifier"}
                                        type={register ? "email" : "text"}
                                        required={!register}
                                        maxLength={150}
                                        autoComplete="username"
                                    />
                                </Field>
                                {register && (
                                    <Field label="Số điện thoại (không bắt buộc)">
                                        <input
                                            name="phoneNumber"
                                            type="tel"
                                            autoComplete="tel"
                                        />
                                    </Field>
                                )}
                                <Password />
                                {register && <Password confirm />}
                            </fieldset>
                            {error && (
                                <p className="auth-error" role="alert">
                                    {error}
                                </p>
                            )}
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={busy || uncertain}
                            >
                                {busy
                                    ? "Đang xử lý…"
                                    : register
                                      ? "Đăng ký"
                                      : "Đăng nhập"}
                                <Icon name="arrow-right" />
                            </Button>
                        </form>
                    )}
                    <div className="auth-switch">
                        <button
                            onClick={() =>
                                app.navigate(register ? "login" : "register")
                            }
                        >
                            {register
                                ? "Đã có tài khoản? Đăng nhập"
                                : "Chưa có tài khoản? Đăng ký"}
                        </button>
                        {!register && !forgot && (
                            <button
                                onClick={() => app.navigate("forgot-password")}
                            >
                                Quên mật khẩu?
                            </button>
                        )}
                    </div>
                    <Button
                        variant="text-button"
                        onClick={() => app.openDialog("connection")}
                    >
                        Kết nối máy chủ
                    </Button>
                </section>
            </div>
        </div>
    );
}
