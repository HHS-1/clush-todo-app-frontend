import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/calendarStyle.css';
import { Modal, Button } from 'react-bootstrap';
import { Editor } from '@toast-ui/react-editor'; 
import '@toast-ui/editor/dist/toastui-editor.css'; 
import '@toast-ui/editor/dist/i18n/ko-kr'; 

const SharedCalendar = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState({});
  const [calendars, setCalendars] = useState([]); 
  const [currentCalendar, setCurrentCalendar] = useState(localStorage.getItem('currentCalendar') || null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showToast2, setShowToast2] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [taskPriority, setTaskPriority] = useState('');
  
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const response = await fetch('http://localhost:8080/shared', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCalendars(data);
        } else {
          console.error('Failed to fetch calendars');
        }
      } catch (error) {
        console.error('Error fetching calendars:', error);
      }
    };

    fetchCalendars();
  }, []);

  const handleAddCalendar = async () => {
    if (!newCalendarName) {
      alert('캘린더 이름을 입력하세요');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/shared', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: newCalendarName, 
        credentials: 'include',
      });

      if (response.ok) {
        handleCalendarSelection(null);
        window.location.reload();
      } else {
        console.error('Failed to create calendar');
      }
    } catch (error) {
      console.error('Error creating calendar:', error);
    }
  };

  const handleCalendarSelection = (calendarId) => {
    setCurrentCalendar(calendarId);
    localStorage.setItem('currentCalendar', calendarId); // 선택한 캘린더 정보 로컬 스토리지에 저장
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTaskNameChange = (e) => {
    setTaskName(e.target.value);
  };

  const handleTaskPriorityChange = (e) => {
    setTaskPriority(e.target.value);
  };

  const handleTaskDescriptionChange = () => {
    const htmlContent = editorRef.current.getInstance().getHTML();
    setTaskDescription(htmlContent);
  };

  const handleEmailChange = (e) =>{
    setEmail(e.target.value)
  }

  const saveToDo = async () => {
    const formData = {
      title: taskName,
      description: taskDescription,
      date: selectedDate,
      priority: taskPriority,
    };

    try {
      const response = await fetch(`http://localhost:8080/shared/${currentCalendar}`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': "application/json",
        },
      });

      if (response.ok) {
        alert('작업이 추가되었습니다!');
        refreshCalendarSection();
        setIsModalOpen(false);
      } else {
        alert('작업 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error("Error saving ToDo:", error);
      alert('작업 추가 중 오류가 발생했습니다.');
    }
  };

  async function refreshCalendarSection() {
    try {
      const response = await fetch(`http://localhost:8080/shared/${currentCalendar}`, {
        method: "GET",
        credentials: "include",
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
  
        // sharedTodos 배열을 날짜별로 그룹화
        const eventsByDate = data.sharedTodos.reduce((acc, todo) => {
          const date = todo.date; // 날짜를 기준으로 그룹화
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(todo);
          return acc;
        }, {});
  
        // selectedCalendar에 맞게 날짜별 이벤트를 저장
        setEvents((prevEvents) => ({
          ...prevEvents,
          [currentCalendar]: eventsByDate, // selectedCalendar에 해당하는 날짜별 이벤트
        }));
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error("Error refreshing section:", error);
      alert('섹션 갱신 중 오류가 발생했습니다.');
    }
  }

  const sendEmail = async () =>{
    try{
      const response = await fetch(`http://localhost:8080/email/${currentCalendar}`,{
        method:"POST",
        credentials:'include',
        headers:{
          "Content-Type" : "application/json"
        },
        body: email,
    })
      if(response.ok){
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }else if(response.status === 404){
        console.log("404")
        setShowToast2(true);
        setTimeout(() => setShowToast2(false), 3000);
      }
    }catch(error){
      setShowToast2(true);
      setTimeout(() => setShowToast2(false), 3000);
    }

  }

  useEffect(() => {
    if (currentCalendar) {
      refreshCalendarSection();
    }
  }, [currentCalendar]);


  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const dateString = adjustedDate.toISOString().split('T')[0]; // yyyy-mm-dd 형식으로 변환
  
      // currentCalendar에 맞는 날짜별 이벤트 목록
      const eventList = events[currentCalendar]?.[dateString];
  
      if (eventList && eventList.length > 0) {
        const sortedEventList = [...eventList].sort((a, b) => a.priority - b.priority); // 우선순위 기준 정렬
        return (
          <ul className="event-list" style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem', color: '#333', width:'100%'}}>
            {sortedEventList.map((event, index) => (
              <li key={index} className="event-item"
                style={{ 
                textAlign: 'left',
                padding: '2px 5px',
                backgroundColor: getPriorityColor(event.priority), // 우선 순위에 따른 배경색 설정
                borderRadius: '4px', // 좀 더 보기 좋게 둥근 모서리 추가
                marginBottom: '2px',
                width: '100%', }}>
                {event.title}
              </li>
            ))}
          </ul>
        );
      }
    }
    return null;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return '#FFAAAA';
      case 2:
        return '#FFCC99';
      case 3:
        return '#A9D1FF';
      case 4:
        return '#A8E0A6';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <div className="shared-calendar-container">
      {!currentCalendar ? (
        <div className="calendar-selection">
          <h2 className="calendar-title">공유 캘린더 선택</h2>
          <ul className="calendar-list">
            {calendars.map((calendar) => (
              <li key={calendar.id} className="calendar-item">
                <button className="calendar-button" onClick={() => handleCalendarSelection(calendar.id)}>{calendar.name}</button>
              </li>
            ))}
          </ul>
          <button className="add-calendar-button" onClick={() => setIsModalOpen(true)}>공유 캘린더 추가</button>

          {isModalOpen && (
            <div className="modal2">
              <div className="modal-content2">
                <h3 className="modal-title2">공유 캘린더 추가</h3>
                <input
                  type="text"
                  className="calendar-input"
                  placeholder="캘린더 이름을 입력하세요"
                  value={newCalendarName}
                  onChange={(e) => setNewCalendarName(e.target.value)}
                />
                <button className="save-button" onClick={handleAddCalendar}>저장</button>
                <button className="cancel-button" onClick={() => setIsModalOpen(false)}>취소</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="calendar-view">
          <Calendar
            onChange={setValue}
            value={value}
            className="custom-calendar"
            tileContent={getTileContent}
            onClickDay={(date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const clickedDate = `${year}-${month}-${day}`;
              setSelectedDate(clickedDate); // 클릭한 날짜를 상태에 저장
              setIsModalOpen(true);
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
            <button className="back-to-selection-button" onClick={() => setCurrentCalendar(null)}>다른 캘린더 선택</button>
            <div>
              <input type="text" placeholder='이메일을 입력하세요' value={email} onChange={handleEmailChange}/>
              <button onClick={sendEmail}>사용자 초대</button>
            </div>
          </div>
          
          {showToast && (
              <div style={{
                  position: 'fixed', 
                  bottom: showToast ? '20px' : '-100px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  backgroundColor: 'rgb(19, 51, 120)', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '5px', 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)', 
                  transition: 'bottom 0.5s ease, opacity 0.5s ease', 
                  opacity: showToast ? 1 : 0, 
                  zIndex: 1000
              }}>
                  사용자를 초대했습니다!
              </div>
            )}
            {showToast2 && (
              <div style={{
                  position: 'fixed', 
                  bottom: showToast2 ? '50px' : '-100px', 
                  right: '-10%', 
                  transform: 'translateX(-80%)', 
                  backgroundColor: 'rgb(235, 10, 108)', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '5px', 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)', 
                  transition: 'bottom 0.5s ease, opacity 0.5s ease', 
                  opacity: showToast2 ? 1 : 0, 
                  zIndex: 1000
              }}>
                  사용자를 찾을 수 없습니다
              </div>
            )}

          <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
            <Modal.Header closeButton>
              <Modal.Title>공유 작업 추가</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className="mb-3">
                  <label htmlFor="taskName" className="form-label">제목</label>
                  <input
                    type="text"
                    className="form-control"
                    id="taskName"
                    value={taskName}
                    onChange={handleTaskNameChange}
                    placeholder="ex) clush 과제 세팅하기"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="taskDescription" className="form-label">작업 설명</label>
                  <Editor
                    ref={editorRef}
                    value={taskDescription}
                    onChange={handleTaskDescriptionChange}
                    previewStyle="vertical"
                    height="300px"
                    initialEditType="wysiwyg"
                    language="ko-KR"
                    toolbarItems={[
                      ['bold', 'italic', 'strike'],
                      ['ul', 'ol', 'task', 'indent', 'outdent'],
                      ['hr', 'quote'],
                      ['link']
                    ]}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="taskDate" className="form-label">날짜</label>
                  <input
                    type="date"
                    className="form-control"
                    id="taskDate"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="taskPriority" className="form-label">우선 순위</label>
                  <select
                    className="form-control"
                    id="taskPriority"
                    value={taskPriority}
                    onChange={handleTaskPriorityChange}
                  >
                    <option value="">우선순위 선택</option>
                    <option value="1">매우 높음</option>
                    <option value="2">높음</option>
                    <option value="3">보통</option>
                    <option value="4">낮음</option>
                    <option value="5">기타</option>
                  </select>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>닫기</Button>
              <Button variant="primary" onClick={saveToDo}>저장</Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default SharedCalendar;
