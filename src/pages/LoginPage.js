import React, { useState , useEffect} from 'react';
import '../css/Login.css'; // CSS 파일을 import

const Login = ({ onLoginSuccess }) => {
  const [id, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // 회원가입 모드 여부

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  // 로그인 처리
  const handleLogin = async () => {
    if (!id || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const response = await fetch('http://localhost:8081/user/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, userPassWord: password }),
    });

    if (response.ok) {
      window.location = "/";
    } else {
      alert('로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  // 회원가입 처리
  const handleRegister = async () => {
    if (!id || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    const response = await fetch('http://localhost:8081/user/sign-up', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, userPassWord: password }),
    });

    if (response.ok) {
      alert('회원가입이 완료되었습니다. 이제 로그인해주세요.');
      setIsRegistering(false); // 회원가입 완료 후 로그인 화면으로 전환
    } else {
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="login-container">
      <h2 className="title">{isRegistering ? '회원가입' : '로그인'}</h2>
      <input
        type="text"
        placeholder="이메일"
        value={id}
        onChange={(e) => setUsername(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
      <div className="button-container">
        {isRegistering ? (
          <>
            <button onClick={handleRegister} className="button register">
              회원가입
            </button>
            <button onClick={() => setIsRegistering(false)} className="button">
              로그인 화면으로
            </button>
          </>
        ) : (
          <>
            <button onClick={handleLogin} className="button login">
              로그인
            </button>
            <button onClick={() => setIsRegistering(true)} className="button">
              회원가입
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
