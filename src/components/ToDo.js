import React, { useState, useEffect } from 'react';

const Todo = ({ handleOpen }) => {
  const [isInProgressVisible, setInProgressVisible] = useState(true);
  const [isCompletedVisible, setCompletedVisible] = useState(true);
  const [events, setEvents] = useState([]); // events를 배열로 설정

  const toggleInProgress = () => {
    setInProgressVisible(!isInProgressVisible);
  };

  const toggleCompleted = () => {
    setCompletedVisible(!isCompletedVisible);
  };

  const getTodayToDo = async () => {
    try {
      const response = await fetch('http://localhost:8080/to-do');
      console.log(response)
      if(response.status == 204){
        return null;
      }else{
        const data = await response.json();  // 응답 데이터를 JSON 형식으로 파싱
        setEvents(data);  // 응답 받은 데이터를 events 상태에 저장
      }
    } catch (error) {
      console.log(error);
      alert('에러발생');
    }
  };

  useEffect(() => {
    getTodayToDo();  // 컴포넌트가 마운트될 때 API 호출
  }, []);

  const changeStatus = async (id, currentStatus) => {
    try{    
        const newStatus = currentStatus === '진행중' ? '완료' : '진행중';
        const response = await fetch(`http://localhost:8080/to-do/${id}`,{
            method : 'PATCH',
            headers : {'Content-Type' : 'application/json'},
            body : newStatus
        })
        if(response.ok){
            setEvents((prevEvents) =>
                prevEvents.map((todo) =>
                    todo.id === id ? { ...todo, status: newStatus } : todo
                )
            );
        }
    }catch(error){
        console.log(error);
        alert('상태변경 실패');
    }
  }

  return (
    <div>
      <h3>오늘</h3>
      <br />
      <div
        className="add-todo"
        onClick={handleOpen}
        style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}
      >
        + 작업 추가
      </div>

      <div onClick={toggleInProgress} style={{ cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom:'3px', marginBottom:'3px' }}>
        {isInProgressVisible ? '▼ 진행중' : '▶ 진행중'}
      </div>
      {isInProgressVisible && (
        <ul className="todo-list">
          {events
            .filter((todo) => todo.status === '진행중')  // 진행중인 할 일만 필터링
            .sort((a, b) => a.priority - b.priority)
            .map((todo) => (
              <li key={todo.id} style={{fontWeight:'bold'}}>
                <div><input type="checkbox" checked={todo.status === '완료'}  onClick={()=>changeStatus(todo.id, todo.status)} /> <span class='priority'>{todo.priority}</span> {todo.title}</div>
                <div style={{fontWeight:'bold'}}>⁝</div>
              </li>
            ))}
        </ul>
      )}

      <div onClick={toggleCompleted} style={{ cursor: 'pointer', marginTop: '30px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom:'3px', marginBottom:'3px' }}>
        {isCompletedVisible ? '▼ 완료' : '▶ 완료'}
      </div>
      {isCompletedVisible && (
        <ul className="todo-list">
          {events
            .filter((todo) => todo.status === '완료')  // 완료된 할 일만 필터링
            .sort((a, b) => a.priority - b.priority)
            .map((todo) => (
              <li key={todo.id} style={{fontWeight:'lighter'}}>
                <div>
                    <input type="checkbox" checked={todo.status === '완료'} onClick={()=>changeStatus(todo.id, todo.status)}  /> <span class='priority'>{todo.priority}</span> {todo.title}
                </div>
                <div style={{fontWeight:'bold'}}>⁝</div>
              </li>
            ))}
        </ul>
      )}
    </div>
    
  );
};

export default Todo;
