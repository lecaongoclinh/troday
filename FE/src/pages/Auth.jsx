import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Brand } from '../components/Layout';
import { Button, Field, Icon } from '../components/ui';
import { HeroArt } from './Discover';

function Password({ confirm = false }) {
  const [show, setShow] = useState(false);
  return <Field label={confirm ? 'Xác nhận mật khẩu' : 'Mật khẩu'}><span className="password-wrap"><input name={confirm ? 'confirmPassword' : 'password'} type={show ? 'text' : 'password'} required minLength={10} maxLength={72} autoComplete={confirm ? 'new-password' : 'current-password'} placeholder={confirm ? 'Nhập lại mật khẩu của bạn' : 'Tối thiểu 10 ký tự'} /><button className="password-toggle" type="button" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={show} onClick={() => setShow(v => !v)}>{show ? 'Ẩn' : 'Hiện'}</button></span></Field>;
}
export default function Auth() {
  const { route, role, navigate, notify } = useApp();
  const [error, setError] = useState(''), [sent, setSent] = useState(false);
  const register = route.view === 'register', forgot = route.view === 'forgot-password';
  const home = () => navigate(role === 'tenant' ? 'discover' : 'dashboard');
  const submit = e => {
    e.preventDefault(); const form = e.currentTarget, values = Object.fromEntries(new FormData(form));
    if (register && !values.fullName.trim()) { setError('Vui lòng nhập họ và tên.'); return; }
    if (register && values.password !== values.confirmPassword) { setError('Mật khẩu xác nhận chưa khớp.'); return; }
    if (values.password && new TextEncoder().encode(values.password).length > 72) { setError('Mật khẩu tối đa 72 byte UTF-8.'); return; }
    form.reset(); setError('');
    if (forgot) { setSent(true); return; }
    home(); notify('Bạn đang trải nghiệm bằng tài khoản mẫu. Thông tin đăng nhập chưa được gửi đi.');
  };
  return <div className="auth-screen"><aside className="auth-story"><Brand /><h1>Một nơi để ở.<br />Một chốn để về.</h1><p>Tìm không gian hợp gu, kết nối bạn cùng nhà và bắt đầu cuộc sống của riêng bạn.</p><HeroArt /><small>© {new Date().getFullYear()} Trọday · Một chỗ ở. Nhiều an tâm.</small></aside><div className="auth-form-side"><button className="back-to-app" type="button" onClick={home}><Icon name="arrow-left" />Quay lại khám phá</button><section className="auth-form-wrap"><span className="eyebrow">{register ? 'CHÀO MỪNG ĐẾN VỚI TRỌDAY' : forgot ? 'TÌM LẠI KẾT NỐI' : 'KHÔNG GIAN QUEN THUỘC'}</span><h2>{register ? 'Tạo một khởi đầu mới.' : forgot ? 'Quên mật khẩu?' : 'Vui được gặp lại bạn.'}</h2><p>{register ? 'Tạo tài khoản để tìm nơi ở và lưu những điều bạn thích.' : forgot ? 'Nhập email để xem trước luồng lấy lại mật khẩu.' : 'Đăng nhập để tiếp tục hành trình tìm nhà của bạn.'}</p>{sent ? <div className="subtle-panel"><Icon name="check" /><h3>Bạn đã đến đúng nơi.</h3><p>Trong phiên bản kết nối API, hướng dẫn đặt lại mật khẩu sẽ được gửi tới email của bạn. Bản giao diện hiện tại chưa gửi email.</p><Button onClick={() => navigate('login')}>Quay lại đăng nhập</Button></div> : <form className="auth-form" onSubmit={submit}>{register && <Field label="Họ và tên"><input name="fullName" required maxLength={150} autoComplete="name" placeholder="Nhập họ và tên của bạn" /></Field>}<Field label={register || forgot ? 'Email' : 'Email hoặc số điện thoại'}><input name={register || forgot ? 'email' : 'identifier'} type={register || forgot ? 'email' : 'text'} required maxLength={150} autoComplete={register || forgot ? 'email' : 'username'} placeholder={register || forgot ? 'ban@example.com' : 'Nhập email hoặc số điện thoại'} /></Field>{register && <Field label="Số điện thoại (không bắt buộc)"><input name="phoneNumber" type="tel" maxLength={40} autoComplete="tel" placeholder="09xx xxx xxx" /></Field>}{!forgot && <Password />}{register && <Password confirm />}{!register && !forgot && <div className="auth-options"><span className="muted tiny">Trải nghiệm bằng tài khoản mẫu</span><button type="button" onClick={() => navigate('forgot-password')}>Quên mật khẩu?</button></div>}{error && <p className="auth-error" role="alert">{error}</p>}<Button type="submit" variant="primary">{register ? 'Đăng ký trải nghiệm' : forgot ? 'Tiếp tục' : 'Đăng nhập trải nghiệm'}<Icon name="arrow-right" /></Button></form>}<div className="auth-switch">{register ? <>Đã có tài khoản? <button type="button" onClick={() => navigate('login')}>Đăng nhập</button></> : forgot ? <button type="button" onClick={() => navigate('login')}>Quay lại đăng nhập</button> : <>Bạn mới đến Trọday? <button type="button" onClick={() => navigate('register')}>Đăng ký ngay</button></>}</div><div className="auth-demo-note">Giao diện dùng thử. Các biểu mẫu chưa kết nối hệ thống tài khoản.<br />Mật khẩu không được lưu và không được gửi đi.</div></section></div></div>;
}
