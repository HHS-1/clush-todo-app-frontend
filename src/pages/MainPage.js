import React, { useState } from 'react';
import '../css/styles.css';
import TaskModal from '../components/TaskModal';
import '../js/scripts';
import 'react-calendar/dist/Calendar.css';
import FetchCalendar from '../components/FetchCalendar';
import Todo from '../components/ToDo'; 
import TodoModify from '../components/ToDoModify';
import { HashLink } from "react-router-hash-link";


const Main = () => {
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  // 사이드바 상태 관리
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 사이드바 열고 닫기 토글
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const [date, setDate] = useState(new Date()); // 선택된 날짜 상태 관리

  const handleDateChange = (value) => {
    setDate(value);
  };

  return (
    <div id="main">
      <TaskModal show={showModal} handleClose={handleClose} />

      {/* 사이드바 */}
      <nav
        className={`navbar navbar-expand-lg navbar-dark bg-info fixed-top ${isSidebarOpen ? 'open' : 'closed'}`}
        id="sideNav"
        style={{
          transition: 'transform 0.3s ease',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <a className="navbar-brand js-scroll-trigger" href="#page-top">
          <span className="d-block d-lg-none">Clarence Taylor</span>
          <span className="d-none d-lg-block">
            <img
              className="img-fluid img-profile rounded-circle mx-auto mb-2"
              src="/assets/img/profile.jpg"
              alt="..."
            />
          </span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link js-scroll-trigger"
                style={{ color: 'rgb(120,93,200)', cursor: 'pointer' }}
                onClick={handleOpen}
              >
                ➕작업 추가
              </a>
            </li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#todo">☀️ 오늘 할 일</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#todo">🪣 관리함</a></li>
            <li className="nav-item">
              <HashLink className="nav-link js-scroll-trigger" to="#calendar">
              🗓️ 일정 캘린더
              </HashLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* 사이드바 열고 닫기 버튼 */}

      <button
        onClick={toggleSidebar}
        className="sidebar-toggle-btn"
        style={{
          position: 'fixed',
          top: '20px',
          left: isSidebarOpen ? '230px' : '20px',
          zIndex: 9050,
          backgroundColor: 'transparent',
          color: 'black',
          border: 'none',
          padding: '10px',
          cursor: 'pointer',
          transition: 'left 0.3s ease',
        }}
      >
        {isSidebarOpen ? '➖' : '🟰'}
      </button>

      <div className="container-fluid p-0"
        style={{
          transition: 'margin-left 0.3s ease', // 본문 이동 애니메이션
          marginLeft: isSidebarOpen ? '0px' : '-100px', // 사이드바 상태에 따라 이동
        }}
      >
        {/* Todo 컴포넌트 추가 */}
        <section className="resume-section" id="todo">
        <div className="todo-container first-section">
          <Todo handleOpen={handleOpen} />
        </div>
        <div className="todo-modify-container">
          <TodoModify />
        </div>
        </section>
        <section className="resume-section" id="calendar">
          <FetchCalendar />
        </section>
      </div>
    </div>
  );
};

export default Main;
