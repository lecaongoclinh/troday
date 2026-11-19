import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { request } from '../data/api';
import { Brand } from '../components/Layout';
import { Button, Field, Icon } from '../components/ui';
import { HeroArt } from './Discover';

function Password({ confirm = false, registering = false }) {
  const [show, setShow] = useState(false);
  return <Field label={confirm ? 'Xác nhận mật khẩu' : 'Mật khẩu'}><span className="password-wrap"><input name={confirm ? 'confirmPassword' : 'password'} type={show ? 'text' : 'password'} required minLength={registering ? 10 : 1} maxLength={72} autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'Tối thiểu 10 ký tự' : 'Nhập mật khẩu'} /><button className="password-toggle" type="button" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={show} onClick={() => setShow(v => !v)}>{show ? 'Ẩn' : 'Hiện'}</button></span></Field>;
}
export default function Auth() {
  const { route, navigate, notify, login } = useApp();
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [reset, setReset] = useState(null);
  const register = route.view === 'register', forgot = route.view === 'forgot-password';
  const submit = async e => {
    e.preventDefault(); if (busy) return;
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (register && !values.fullName.trim()) { setError('Vui lòng nhập họ và tên.'); return; }
    if (register && values.password !== values.confirmPassword) { setError('Mật khẩu xác nhận chưa khớp.'); return; }
    setError(''); setBusy(true);
    try {
      if (forgot) {
        if (!reset) {
          const result = await request('/auth/password-resets', { method: 'POST', body: { identifier: values.identifier }, token: null });
          setReset({ selector: result.selector });
        } else if (reset.grant) {
          if (values.password !== values.confirmPassword) throw new Error('Mật khẩu xác nhận chưa khớp.');
          await request('/auth/password-resets/complete', { method: 'POST', body: { resetGrant: reset.grant, newPassword: values.password }, token: null });setReset(null);navigate('login');notify('Đã đặt mật khẩu mới. Vui lòng đăng nhập.');
        } else {
          const result = await request('/auth/password-resets/verify', { method: 'POST', body: { selector: reset.selector, code: values.code }, token: null });
          if (!result.resetGrant) throw new Error('Chưa nhận được quyền đặt lại mật khẩu từ máy chủ.');setReset({ ...reset, grant: result.resetGrant });
        }
      } else if (register) {
        await request('/auth/register', { method: 'POST', token: null, body: { fullName: values.fullName.trim(), email: values.email.trim(), password: values.password, ...(values.phoneNumber.trim() ? { phoneNumber: values.phoneNumber.trim() } : {}) } });
        navigate('login'); notify('Đăng ký thành công. Bạn có thể đăng nhập.');
      } else await login({ identifier: values.identifier.trim(), password: values.password });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="auth-screen"><aside className="auth-story"><Brand /><h1>Một nơi để ở.<br />Một chốn để về.</h1><p>Tìm không gian hợp gu, kết nối bạn cùng nhà và bắt đầu cuộc sống của riêng bạn.</p><HeroArt /><small>© {new Date().getFullYear()} Trọday · Một chỗ ở. Nhiều an tâm.</small></aside><div className="auth-form-side"><button className="back-to-app" type="button" onClick={() => navigate('discover')}><Icon name="arrow-left" />Quay lại khám phá</button><section className="auth-form-wrap"><span className="eyebrow">{register ? 'CHÀO MỪNG ĐẾN VỚI TRỌDAY' : forgot ? 'TÌM LẠI KẾT NỐI' : 'KHÔNG GIAN QUEN THUỘC'}</span><h2>{register ? 'Tạo một khởi đầu mới.' : forgot ? 'Quên mật khẩu?' : 'Vui được gặp lại bạn.'}</h2><p>{register ? 'Tạo tài khoản để tìm nơi ở và lưu những điều bạn thích.' : forgot ? reset?.grant ? 'Nhập và xác nhận mật khẩu mới.' : reset ? 'Nhập mã xác nhận bạn nhận được.' : 'Nhập email hoặc số điện thoại đã đăng ký.' : 'Đăng nhập để tiếp tục hành trình tìm nhà của bạn.'}</p><form className="auth-form" onSubmit={submit}><fieldset disabled={busy} className="form-fieldset">{register && <Field label="Họ và tên"><input name="fullName" required maxLength={150} autoComplete="name" /></Field>}{!reset && <Field label={register ? 'Email' : 'Email hoặc số điện thoại'}><input name={register ? 'email' : 'identifier'} type={register ? 'email' : 'text'} required maxLength={150} autoComplete={register ? 'email' : 'username'} /></Field>}{reset && !reset.grant && <Field label="Mã xác nhận"><input name="code" required autoComplete="one-time-code" /></Field>}{register && <Field label="Số điện thoại (không bắt buộc)"><input name="phoneNumber" type="tel" maxLength={40} autoComplete="tel" /></Field>}{(!forgot || reset?.grant) && <Password registering={register || !!reset?.grant} />}{(register || reset?.grant) && <Password confirm registering />}{!register && !forgot && <div className="auth-options"><button type="button" onClick={() => navigate('forgot-password')}>Quên mật khẩu?</button></div>}{error && <p className="auth-error" role="alert">{error}</p>}<Button type="submit" variant="primary" disabled={busy}>{busy ? 'Đang xử lý…' : register ? 'Đăng ký' : forgot ? 'Tiếp tục' : 'Đăng nhập'}<Icon name="arrow-right" /></Button></fieldset></form><div className="auth-switch">{register ? <>Đã có tài khoản? <button type="button" onClick={() => navigate('login')}>Đăng nhập</button></> : forgot ? <button type="button" onClick={() => navigate('login')}>Quay lại đăng nhập</button> : <>Bạn mới đến Trọday? <button type="button" onClick={() => navigate('register')}>Đăng ký ngay</button></>}</div></section></div></div>;
}
