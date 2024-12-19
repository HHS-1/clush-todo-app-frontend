import React, { useState, useEffect } from 'react';

const Todo = ({ handleOpen }) => {
  const [isInProgressVisible, setInProgressVisible] = useState(true);
  const [isCompletedVisible, setCompletedVisible] = useState(true);
  const [events, setEvents] = useState([]); // events를 배열로 설정
  const [showToast, setShowToast] = useState(false); // 토스트 메시지 상태 관리

  const toggleInProgress = () => {
    setInProgressVisible(!isInProgressVisible);
  };

  const toggleCompleted = () => {
    setCompletedVisible(!isCompletedVisible);
  };

  const getTodayToDo = async () => {
    try {
      const response = await fetch('http://localhost:8081/to-do',{credentials: 'include'});
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
        const response = await fetch(`http://localhost:8081/to-do/${id}`,{
            method : 'PATCH',
            credentials: 'include',
            headers : {'Content-Type' : 'application/json'},
            body : newStatus
        })
        if(response.ok){
            setEvents((prevEvents) =>
                prevEvents.map((todo) =>
                    todo.id === id ? { ...todo, status: newStatus } : todo
                )
            );

            if (newStatus === '완료') {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000); // 3초 후 자동으로 토스트 닫기
              }
        }
        
    }catch(error){
        console.log(error);
        alert('상태변경 실패');
    }
  }

  const showToDoModify = async (id) => {
    try{
        const response = await fetch(`http://localhost:8081/to-do/${id}`, {credentials: 'include'})
        const toDoDate = await response.json();

        if(response.status==204){
            alert('데이터가 존재하지 않습니다.');
            return null;
        }else{
            const event = new CustomEvent('dataFetched', { detail: toDoDate });
            window.dispatchEvent(event);
        }

    }catch(error){
        console.log(error);
        alert('서버 오류로 인해 데이터를 불러오는 데 실패했습니다.')
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
              <li key={todo.id} style={{fontWeight:'bold'}} onClick={()=>showToDoModify(todo.id)}>
                <div>
                    <input type="checkbox" checked={todo.status === '완료'}  
                        onClick={(e) => {
                            e.stopPropagation(); // 이벤트 버블링 방지
                            changeStatus(todo.id, todo.status);
                        }} /> 
                    <span class='priority'>{todo.priority}</span> {todo.title}</div>
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
              <li key={todo.id} style={{fontWeight:'lighter'}} onClick={()=>showToDoModify(todo.id)}>
                <div>
                    <input type="checkbox" checked={todo.status === '완료'} 
                        onClick={(e) => {
                            e.stopPropagation(); // 이벤트 버블링 방지
                            changeStatus(todo.id, todo.status);
                        }}  /> 
                    <span class='priority'>{todo.priority}</span> {todo.title}
                </div>
                <div style={{fontWeight:'bold'}}>⁝</div>
              </li>
            ))}
        </ul>
      )}
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
            작업이 완료되었습니다!
        </div>
      )}


    </div>
    
  );
};

export default Todo;
